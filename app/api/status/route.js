import { NextResponse } from 'next/server';
import { hasSupabaseConfig, isGuestMode, ENV } from '@/lib/env';

export async function GET() {
  const supabaseConfigured = hasSupabaseConfig();
  const mode = supabaseConfigured ? 'supabase' : 'guest';
  
  // Basic status (no secrets exposed)
  const status = {
    mode,
    supabaseConfigured,
    authEnabled: supabaseConfigured,
    // Only show if URL is set, not the actual value
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!ENV.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!ENV.SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: !!ENV.SITE_URL,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(status);
}
