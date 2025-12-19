import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://itqfnjlnuumlntcvspju.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cWZuamxudXVtbG50Y3ZzcGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjAyMDksImV4cCI6MjA3Njk5NjIwOX0.4Nvnf1j9ikHwc-jOfaZlsjkHi1lFKRsoBlBOHp5ANyU';

// Only create Supabase client if credentials are provided
// Otherwise, app will work in localStorage-only mode
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

