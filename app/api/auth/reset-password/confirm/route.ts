import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    // In a real implementation, you would verify the token against the database.
    // For this prototype, we'll assume the token is a valid user ID for demonstration purposes.
    // In production, use a separate 'password_resets' table.
    const userId = token; 

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ message: 'ไม่สามารถอัปเดตรหัสผ่านได้' }, { status: 500 });
    }

    return NextResponse.json({ message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' }, { status: 200 });

  } catch (error) {
    console.error('Password confirmation error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
