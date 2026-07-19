import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  return NextResponse.json({
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasAuthSecret: !!nextAuthSecret,
    hasVapidPublic: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
    envKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_') || key.startsWith('GOOGLE_') || key.includes('VAPID')),
    nodeEnv: process.env.NODE_ENV
  });
}
