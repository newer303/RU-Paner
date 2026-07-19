export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DegreeCategory, CompletedCourse } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    // 1. Fetch user-specific data
    let [majorRes, totalCreditsRes, categoriesRes, completedRes] = await Promise.all([
      supabase.from('settings').select('value').eq('user_id', userId).eq('key', 'major').maybeSingle(),
      supabase.from('settings').select('value').eq('user_id', userId).eq('key', 'totalCredits').maybeSingle(),
      supabase.from('degree_categories').select('*').eq('user_id', userId),
      supabase.from('completed_courses').select('course_code, grade, is_reexam').eq('user_id', userId)
    ]);

    // 2. Fallback to 'global' if user-specific data is missing and user is not 'global'
    if (userId !== 'global') {
      const hasCategories = categoriesRes.data && categoriesRes.data.length > 0;
      const hasCompleted = completedRes.data && completedRes.data.length > 0;
      
      if (!majorRes.data || !totalCreditsRes.data || !hasCategories || !hasCompleted) {
        console.log(`[API GET] Falling back to global data for user: ${userId}`);
        const [gMajorRes, gTotalCreditsRes, gCategoriesRes, gCompletedRes] = await Promise.all([
          supabase.from('settings').select('value').eq('user_id', 'global').eq('key', 'major').maybeSingle(),
          supabase.from('settings').select('value').eq('user_id', 'global').eq('key', 'totalCredits').maybeSingle(),
          supabase.from('degree_categories').select('*').eq('user_id', 'global'),
          supabase.from('completed_courses').select('course_code, grade, is_reexam').eq('user_id', 'global')
        ]);

        if (!majorRes.data) majorRes = gMajorRes;
        if (!totalCreditsRes.data) totalCreditsRes = gTotalCreditsRes;
        if (!hasCategories) categoriesRes = gCategoriesRes;
        if (!hasCompleted) completedRes = gCompletedRes;
      }
    }

    if (categoriesRes.error) console.error('Error fetching categories:', categoriesRes.error);
    if (completedRes.error) console.error('Error fetching completed courses:', completedRes.error);

    const major = majorRes.data?.value || 'ยังไม่ได้ระบุชื่อหลักสูตร';
    const totalCredits = parseInt(totalCreditsRes.data?.value || "0") || 0;
    const categories = categoriesRes.data || [];
    const completedCourses = completedRes.data || [] as CompletedCourse[];

    // 3. Fetch courses for each category
    const categoriesWithCourses = await Promise.all(categories.map(async (cat: any) => {
      // Note: We search in BOTH user-specific and global degree_courses 
      // but prioritize user-specific if we want. However, the schema 
      // typically links courses to categories.
      
      const { data: courses, error: coursesError } = await supabase
        .from('degree_courses')
        .select('course_code')
        .eq('category_id', cat.id)
        .eq('user_id', cat.user_id); // Use the user_id from the category we found (might be 'global')
        
      if (coursesError) console.error(`Error fetching courses for category ${cat.id}:`, coursesError);

      return {
        ...cat,
        id: String(cat.id),
        courses: courses?.map((c: any) => c.course_code) || []
      };
    }));

    return NextResponse.json({
      major,
      totalCredits,
      categories: categoriesWithCourses,
      completedCourses
    });
  } catch (error: any) {
    console.error('CRITICAL ERROR in GET /api/degree-plan:', error);
    return NextResponse.json({ error: 'Failed to fetch degree plan', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const body = await request.json();
    const { major, totalCredits, categories } = body;

    // 1. Update Settings
    if (major !== undefined) {
      await supabase.from('settings').upsert({ user_id: userId, key: 'major', value: major }, { onConflict: 'user_id, key' });
    }
    if (totalCredits !== undefined) {
      await supabase.from('settings').upsert({ user_id: userId, key: 'totalCredits', value: String(totalCredits) }, { onConflict: 'user_id, key' });
    }

    // 2. Sync Categories if provided
    if (Array.isArray(categories)) {
      console.log('[API PUT] Syncing categories. New count:', categories.length);
      
      const { data: existingCats } = await supabase
        .from('degree_categories')
        .select('id')
        .eq('user_id', userId);
        
      const existingIds = existingCats?.map((c: any) => String(c.id)) || [];
      const newIds = categories.map((c: any) => String(c.id));

      // Delete categories removed from the list
      const toDelete = existingIds.filter((id: string) => !newIds.includes(id));
      if (toDelete.length > 0) {
        console.log('[API PUT] Deleting orphaned categories:', toDelete);
        await supabase.from('degree_courses').delete().in('category_id', toDelete).eq('user_id', userId);
        await supabase.from('degree_categories').delete().in('id', toDelete).eq('user_id', userId);
      }

      // Upsert categories in the list
      if (categories.length > 0) {
        const upsertData = categories.map((cat: any) => ({
          user_id: userId,
          id: String(cat.id),
          name: cat.name,
          required: cat.required
        }));
        
        await supabase.from('degree_categories').upsert(upsertData, { onConflict: 'user_id, id' });

        // 3. Sync Courses within Categories
        console.log('[API PUT] Syncing course-category mappings...');
        
        // Clear all existing mappings for these categories to prevent duplicates or orphaned items
        const categoryIds = categories.map((c: any) => String(c.id));
        await supabase.from('degree_courses').delete().in('category_id', categoryIds).eq('user_id', userId);

        // Prepare new mapping data
        const newMappings: any[] = [];
        categories.forEach((cat: any) => {
          if (Array.isArray(cat.courses)) {
            cat.courses.forEach((courseCode: string) => {
              newMappings.push({
                user_id: userId,
                category_id: String(cat.id),
                course_code: courseCode
              });
            });
          }
        });

        if (newMappings.length > 0) {
          const { error: mappingError } = await supabase.from('degree_courses').insert(newMappings);
          if (mappingError) {
            console.error('Error inserting degree_courses:', mappingError);
            throw mappingError;
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/degree-plan:', error);
    return NextResponse.json({ error: 'Failed to update degree plan', details: error.message }, { status: 500 });
  }
}
