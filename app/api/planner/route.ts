export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const fallbackPlannerCourses = async (userId: string) => {
    try {
      const plannerRows = db.prepare('SELECT course_code FROM planner_courses WHERE user_id = ?').all(userId) as { course_code: string }[];
      const courseCodes = plannerRows.map(row => row.course_code);
      if (courseCodes.length === 0) return [];
      const placeholders = courseCodes.map(() => '?').join(',');
      const courses = db.prepare(`SELECT * FROM courses WHERE code IN (${placeholders})`).all(...courseCodes);
      return courses || [];
    } catch (localError: any) {
      console.error('Local planner fallback failed:', localError);
      throw localError;
    }
  };

  if (!supabase) {
    console.warn('Supabase client not configured; falling back to local database for /api/planner GET');
    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id || 'global';
      const courses = await fallbackPlannerCourses(userId);
      return NextResponse.json(courses);
    } catch (fallbackError: any) {
      return NextResponse.json({ error: 'Failed to fetch planner courses from both remote and local DB', details: fallbackError.message }, { status: 500 });
    }
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const { data: plannerData, error: plannerError } = await supabase
      .from('planner_courses')
      .select('course_code')
      .eq('user_id', userId);

    if (plannerError) {
      console.error('Supabase planner fetch failed:', plannerError);
      const courses = await fallbackPlannerCourses(userId);
      return NextResponse.json(courses);
    }
    
    if (!plannerData || plannerData.length === 0) {
      return NextResponse.json([]);
    }

    const courseCodes = plannerData.map((p: any) => p.course_code);
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('code', courseCodes);

    if (coursesError) {
      console.error('Supabase planner courses fetch failed:', coursesError);
      const courses = await fallbackPlannerCourses(userId);
      return NextResponse.json(courses);
    }
    
    return NextResponse.json(courses || []);
  } catch (error: any) {
    console.error('GET /api/planner unexpected error:', error);
    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id || 'global';
      const courses = await fallbackPlannerCourses(userId);
      return NextResponse.json(courses);
    } catch (fallbackError: any) {
      return NextResponse.json({ error: 'Failed to fetch planner courses', details: fallbackError.message }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';
    const body = await request.json();
    const { courseCode } = body;

    if (!courseCode) {
      return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
    }

    if (!supabase) {
      console.warn('Supabase client not configured; falling back to local database for /api/planner POST');
      db.prepare('INSERT OR IGNORE INTO planner_courses (user_id, course_code) VALUES (?, ?)').run(userId, courseCode);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('planner_courses').upsert({ user_id: userId, course_code: courseCode }, { onConflict: 'user_id, course_code', ignoreDuplicates: true });
    if (error) {
      console.error('Supabase planner upsert failed:', error);
      db.prepare('INSERT OR IGNORE INTO planner_courses (user_id, course_code) VALUES (?, ?)').run(userId, courseCode);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add course to planner', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode');
    if (!courseCode) {
      return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
    }

    if (!supabase) {
      console.warn('Supabase client not configured; falling back to local database for /api/planner DELETE');
      db.prepare('DELETE FROM planner_courses WHERE user_id = ? AND course_code = ?').run(userId, courseCode);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from('planner_courses')
      .delete()
      .eq('course_code', courseCode)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase planner delete failed:', error);
      db.prepare('DELETE FROM planner_courses WHERE user_id = ? AND course_code = ?').run(userId, courseCode);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove course from planner', details: error.message }, { status: 500 });
  }
}
