import { createClient } from '@supabase/supabase-js';
import { ENV, hasSupabaseConfig } from '@/lib/env';

export const getServerSupabase = () => {
  if (!hasSupabaseConfig()) {
    return null;
  }
  
  // Use service role key for server-side operations if available
  const key = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY;
  return createClient(ENV.SUPABASE_URL, key);
};
