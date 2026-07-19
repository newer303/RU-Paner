import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper to check if a string is a valid URL
const isValidSupabaseUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch {
    return false;
  }
};

if (!isValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase credentials missing or invalid. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  if (supabaseUrl && !isValidSupabaseUrl(supabaseUrl)) {
    console.warn('The provided NEXT_PUBLIC_SUPABASE_URL does not start with http/https. Current value starts with:', supabaseUrl.substring(0, 10));
  }
}

// Only create the client if we have the necessary credentials to avoid crashing during build
export const supabase = (isValidSupabaseUrl(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
