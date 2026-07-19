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
    const { categoryId, courseCode } = body;
    
    // Ensure course exists in courses table (shared)
    await supabase.from('courses').upsert({ code: courseCode, name: 'ไม่ระบุชื่อวิชา', credit: 3 }, { onConflict: 'code', ignoreDuplicates: true });
    
    const { error } = await supabase.from('degree_courses').insert({ user_id: userId, category_id: categoryId, course_code: courseCode });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add course to category' }, { status: 500 });
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
    const categoryId = searchParams.get('categoryId');
    const courseCode = searchParams.get('courseCode');
    
    if (!categoryId || !courseCode) return NextResponse.json({ error: 'categoryId and courseCode are required' }, { status: 400 });
    
    const { error } = await supabase
      .from('degree_courses')
      .delete()
      .eq('category_id', categoryId)
      .eq('course_code', courseCode)
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete course from category' }, { status: 500 });
  }
}
