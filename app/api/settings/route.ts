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

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const settingsMap = (settings || []).reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const body = await request.json();
    const { key, value } = body;
    
    const { error } = await supabase.from('settings').upsert({
      user_id: userId,
      key,
      value: value.toString()
    }, { onConflict: 'user_id, key' });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
