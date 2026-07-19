import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const body = await request.json();
    const { message } = body;

    // Get LINE Token from settings
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'lineToken')
      .single();
      
    const token = setting?.value;

    if (!token) {
      return NextResponse.json({ error: 'LINE Token not found' }, { status: 400 });
    }

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: new URLSearchParams({ message })
    });

    if (!response.ok) {
      // Line Notify might not return JSON on all errors
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to send notification');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification', details: error.message }, { status: 500 });
  }
}
