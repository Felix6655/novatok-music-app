// Environment validation - checks for Supabase config

export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export const hasSupabaseConfig = () => {
  return Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
};

export const isGuestMode = () => !hasSupabaseConfig();
