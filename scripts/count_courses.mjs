
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { count, error } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Total courses:', count);
  }
}

check();
