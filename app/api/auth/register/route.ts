import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      name,
      email,
      password: hashedPassword,
      image: null // Provide explicit null to avoid potential NOT NULL constraint errors if the column exists
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ 
        error: 'Database insertion failed', 
        details: insertError.message 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration system error:', error);
    return NextResponse.json({ 
      error: 'System error during registration', 
      details: error.message 
    }, { status: 500 });
  }
}
