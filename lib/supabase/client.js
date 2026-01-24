import { createClient } from '@supabase/supabase-js';
import { ENV, hasSupabaseConfig } from '@/lib/env';

let supabaseClient = null;

export const getSupabaseClient = () => {
  if (!hasSupabaseConfig()) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  }
  
  return supabaseClient;
};

export const supabase = hasSupabaseConfig() 
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY) 
  : null;
