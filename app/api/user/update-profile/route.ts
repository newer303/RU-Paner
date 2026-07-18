import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 });
    }

    const { name, image } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'กรุณากรอกชื่อผู้ใช้งาน' }, { status: 400 });
    }

    console.log('Updating user:', session.user.email, 'with:', { name, image });

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ name, image })
      .eq('email', session.user.email)
      .select();

    if (updateError) {
      console.error('Update profile error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json({ message: 'ไม่สามารถอัปเดตข้อมูลโปรไฟล์ได้', details: updateError.message }, { status: 500 });
    }

    console.log('Update result data:', data);

    return NextResponse.json({ message: 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว' }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
