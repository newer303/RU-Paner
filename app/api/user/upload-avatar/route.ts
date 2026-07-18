import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

// Create admin client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(req: Request) {
  console.log('--- Upload API Started ---');
  try {
    if (!supabaseAdmin) {
      console.error('Supabase Admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ message: 'Supabase not configured properly' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    console.log('Session check:', !!session);
    
    if (!session || !session.user || !session.user.email) {
      console.log('Unauthorized');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    console.log('File received:', !!file, file instanceof File ? `${(file as File).name} (${(file as File).type})` : 'Not a File object');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'No valid file provided' }, { status: 400 });
    }

    // Sanitize file name: remove special chars, replace spaces with underscores
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${session.user.email}/${Date.now()}-${sanitizedFileName}`;
    console.log('Target path:', filePath);

    // Upload using admin client to bypass RLS for this specific storage operation 
    // while still being restricted to the user's email folder.
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase Upload error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        message: 'Failed to upload to storage', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Upload success, path:', data.path);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(data.path);
    console.log('Public URL generated:', urlData.publicUrl);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
