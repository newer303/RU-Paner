export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    // Get all plans for this user
    const { data: plansData, error: plansError } = await supabase
      .from('semester_plans')
      .select('*')
      .eq('user_id', userId);

    if (plansError) {
      console.warn('semester_plans table might be missing:', plansError.message);
      return NextResponse.json([]);
    }

    if (!plansData || plansData.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique course codes
    const courseCodes = Array.from(new Set(plansData.map((p: any) => p.course_code)));
    
    // Fetch course details
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('code', courseCodes);

    if (coursesError) throw coursesError;

    // Group by semester
    const grouped = plansData.reduce((acc: any, item: any) => {
      if (!acc[item.semester_id]) {
        acc[item.semester_id] = {
          semester_id: item.semester_id,
          courses: []
        };
      }
      const courseDetails = courses?.find((c: any) => c.code === item.course_code);
      if (courseDetails) {
        acc[item.semester_id].courses.push(courseDetails);
      }
      return acc;
    }, {});

    return NextResponse.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const { semesterId, courseCode } = await request.json();
    
    const { error } = await supabase.from('semester_plans').upsert({ 
      user_id: userId, 
      semester_id: semesterId,
      course_code: courseCode 
    }, { 
      onConflict: 'user_id, semester_id, course_code' 
    });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add to roadmap' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode');
    const semesterId = searchParams.get('semesterId');

    if (!semesterId) {
       return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
    }

    let query = supabase.from('semester_plans').delete().eq('user_id', userId).eq('semester_id', semesterId);
    
    if (courseCode) {
      query = query.eq('course_code', courseCode);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove from roadmap' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const { oldSemesterId, newSemesterId, courseCode } = await request.json();
    
    if (!oldSemesterId || !newSemesterId || !courseCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('semester_plans')
      .update({ semester_id: newSemesterId })
      .eq('user_id', userId)
      .eq('semester_id', oldSemesterId)
      .eq('course_code', courseCode);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to move course' }, { status: 500 });
  }
}
