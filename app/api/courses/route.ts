export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import db from '@/lib/db';

export async function GET() {
  const fallbackToLocal = async () => {
    try {
      const rows = db.prepare('SELECT * FROM courses').all();
      return NextResponse.json(rows);
    } catch (localError: any) {
      console.error('Local DB fallback failed:', localError);
      return NextResponse.json({ error: 'Failed to fetch courses from both Supabase and local DB', details: localError.message }, { status: 500 });
    }
  };

  if (!supabase) {
    console.warn('Supabase client not configured; falling back to local database for /api/courses GET');
    return fallbackToLocal();
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
      
      if (error) {
        console.error('Supabase GET /courses failed:', error);
        return fallbackToLocal();
      }
      
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
  } catch (error: any) {
    console.error('GET /api/courses unexpected error:', error);
    return fallbackToLocal();
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    console.log('API POST received payload:', body);
    const {
      code,
      name,
      credit,
      lecDay, lecTime, lecRoom,
      labDay, labTime, labRoom,
      examDate, examTime,
      isFacultyExam, examMonthOnly, examMonth
    } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
    }

    const payload = {
      code,
      name,
      credit: credit || 3,
      lecDay: lecDay || '',
      lecTime: lecTime || '',
      lecRoom: lecRoom || '',
      labDay: labDay || '',
      labTime: labTime || '',
      labRoom: labRoom || '',
      examDate: examDate || '',
      examTime: examTime || '',
      isFacultyExam: !!isFacultyExam,
      examMonthOnly: !!examMonthOnly,
      examMonth: examMonth || ''
    };

    const { error } = await supabase.from('courses').upsert(payload, { onConflict: 'code' });
    
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
