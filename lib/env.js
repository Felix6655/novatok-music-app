// Environment validation - checks for Supabase config

export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
  REQUIRE_SUPABASE: process.env.NEXT_PUBLIC_REQUIRE_SUPABASE === 'true',
};

export const hasSupabaseConfig = () => {
  return Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
};

export const isGuestMode = () => !hasSupabaseConfig();

export const getSiteUrl = () => {
  if (ENV.SITE_URL) return ENV.SITE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
};
