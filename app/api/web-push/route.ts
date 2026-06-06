import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';
    
    const body = await request.json();
    const { subscription, title, message, url } = body;

    if (subscription) {
      // Save subscription to database
      await supabase.from('settings').upsert({
        user_id: userId,
        key: 'webPushSubscription',
        value: JSON.stringify(subscription)
      });
      return NextResponse.json({ success: true });
    }

    // If message is provided, send notification
    if (message) {
      const { data: setting } = await supabase
        .from('settings')
        .select('value')
        .eq('user_id', userId)
        .eq('key', 'webPushSubscription')
        .single();

      if (!setting?.value) {
        return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
      }

      const pushSubscription = JSON.parse(setting.value);
      
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: title || 'RU Planner Alert',
          body: message,
          url: url || '/'
        })
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Push error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
