export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const body = await request.json();
    
    // Batch Mode
    if (body.courses && Array.isArray(body.courses)) {
      const upsertData = body.courses.map((c: any) => ({
        user_id: userId,
        course_code: c.code,
        grade: c.grade || null,
        is_reexam: c.is_reexam || false
      }));
      
      const { error } = await supabase.from('completed_courses').upsert(upsertData);
      if (error) throw error;
      
      return NextResponse.json({ success: true, count: body.courses.length });
    }

    // Single Mode
    const { courseCode, completed, grade, is_reexam } = body;
    
    if (completed || is_reexam) {
      const { error } = await supabase.from('completed_courses').upsert({
        user_id: userId,
        course_code: courseCode,
        grade: grade || null,
        is_reexam: is_reexam || false
      });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('completed_courses')
        .delete()
        .eq('course_code', courseCode)
        .eq('user_id', userId);
      if (error) throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update completed course' }, { status: 500 });
  }
}
