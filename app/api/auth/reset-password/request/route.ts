import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'กรุณาระบุอีเมล' }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        exists: false,
        message: 'ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      exists: true,
      userId: user.id,
      message: 'พบข้อมูลผู้ใช้งานในระบบ' 
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
