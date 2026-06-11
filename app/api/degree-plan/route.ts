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

    const [majorRes, totalCreditsRes, categoriesRes, completedRes] = await Promise.all([
      supabase.from('settings').select('value').eq('user_id', userId).eq('key', 'major').single(),
      supabase.from('settings').select('value').eq('user_id', userId).eq('key', 'totalCredits').single(),
      supabase.from('degree_categories').select('*').eq('user_id', userId),
      supabase.from('completed_courses').select('course_code, grade, is_reexam').eq('user_id', userId)
    ]);

    const major = majorRes.data?.value || 'ยังไม่ได้ระบุชื่อหลักสูตร';
    const totalCredits = parseInt(totalCreditsRes.data?.value || "0") || 0;
    const categories = categoriesRes.data || [];
    const completedCourses = completedRes.data || [] as CompletedCourse[];

    const categoriesWithCourses = await Promise.all(categories.map(async (cat: any) => {
      const { data: courses } = await supabase
        .from('degree_courses')
        .select('course_code')
        .eq('category_id', cat.id)
        .eq('user_id', userId);
        
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
    console.error('Error in GET /api/degree-plan:', error);
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/degree-plan:', error);
    return NextResponse.json({ error: 'Failed to update degree plan', details: error.message }, { status: 500 });
  }
}
