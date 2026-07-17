import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Ensure supabase client is initialized
    if (!supabase) {
      return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    }

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${session.user.email}/${Date.now()}-${file.name}`, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ message: 'Failed to upload' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
