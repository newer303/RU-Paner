export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const body = await request.json();
    const { id, name, required } = body;
    
    const { error } = await supabase.from('degree_categories').upsert({
      user_id: userId,
      id: String(id),
      name,
      required: required || 0
    }, { onConflict: 'user_id, id' });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add/update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'global';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    console.log('[API DELETE] Processing deletion for ID:', id);
    
    // 1. Clear courses first (manual cascade since we don't assume foreign key setup in JS client easily)
    await supabase.from('degree_courses').delete().eq('category_id', id).eq('user_id', userId);
    
    // 2. Delete the category
    const { error } = await supabase.from('degree_categories').delete().eq('id', id).eq('user_id', userId);
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API DELETE] Critical Error:', error);
    return NextResponse.json({ error: 'Failed to delete category', details: error.message }, { status: 500 });
  }
}
