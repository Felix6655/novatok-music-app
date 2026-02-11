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

/**
 * Get the canonical site URL
 * Priority: NEXT_PUBLIC_SITE_URL > window.location.origin (client) > localhost fallback (server)
 */
export const getSiteUrl = () => {
  // Use env var if set
  if (ENV.SITE_URL) return ENV.SITE_URL;
  
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback
  return 'http://localhost:3000';
};

/**
 * Get site URL for server-side rendering (sitemap, robots, metadata)
 * This is used in places where window is not available
 */
export const getServerSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://novatok.music';
};
