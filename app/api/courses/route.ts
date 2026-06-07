export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    let allCourses: any[] = [];
    let from = 0;
    const limit = 1000;
    let keepFetching = true;

    while (keepFetching) {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .range(from, from + limit - 1);
      
      if (error) throw error;
      
      if (courses && courses.length > 0) {
        allCourses = [...allCourses, ...courses];
        from += limit;
      } else {
        keepFetching = false;
      }
      
      if (courses && courses.length < limit) {
        keepFetching = false;
      }
    }

    return NextResponse.json(allCourses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { code, name, credit, day, time, room, examDate, examTime } = body;
    
    if (!code || !name) {
      return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
    }

    const { error } = await supabase.from('courses').upsert({
      code,
      name,
      credit: credit || 3,
      day: day || '',
      time: time || '',
      room: room || '',
      examDate: examDate || '',
      examTime: examTime || ''
    });

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: 'Failed to save to database', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API POST error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
    }

    const { error } = await supabase.from('courses').delete().eq('code', code);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
