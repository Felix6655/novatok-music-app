'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hasSupabaseConfig, isGuestMode, ENV } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
  Database, Shield, HardDrive, User, Loader2, RefreshCw 
} from 'lucide-react';

export default function StatusPage() {
  const { user, isAuthenticated, isSupabaseConfigured: authConfigured, loading: authLoading } = useAuth();
  const [status, setStatus] = useState({
    mode: 'loading',
    supabaseConfigured: false,
    authEnabled: false,
    storageBucketsConfigured: null,
    databaseConnected: null,
    currentUser: null,
    checks: [],
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkStatus();
  }, [authLoading]);

  const checkStatus = async () => {
    setIsChecking(true);
    const checks = [];
    
    // Check 1: Supabase Configuration
    const supabaseConfigured = hasSupabaseConfig();
    checks.push({
      name: 'Supabase URL configured',
      status: !!ENV.SUPABASE_URL,
      detail: ENV.SUPABASE_URL ? 'URL set' : 'NEXT_PUBLIC_SUPABASE_URL not set',
    });
    checks.push({
      name: 'Supabase Anon Key configured',
      status: !!ENV.SUPABASE_ANON_KEY,
      detail: ENV.SUPABASE_ANON_KEY ? 'Key set (hidden)' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY not set',
    });

    const mode = supabaseConfigured ? 'supabase' : 'guest';
    let authEnabled = false;
    let storageBucketsConfigured = null;
    let databaseConnected = null;

    if (supabaseConfigured) {
      const supabase = getSupabaseClient();
      
      // Check 2: Database Connection
      try {
        const { data, error } = await supabase.from('music_tracks').select('id').limit(1);
        databaseConnected = !error;
        checks.push({
          name: 'Database connection',
          status: databaseConnected,
          detail: error ? `Error: ${error.message}` : 'Connected successfully',
        });
      } catch (e) {
        databaseConnected = false;
        checks.push({
          name: 'Database connection',
          status: false,
          detail: `Exception: ${e.message}`,
        });
      }

      // Check 3: Auth System
      try {
        const { data: session } = await supabase.auth.getSession();
        authEnabled = true;
        checks.push({
          name: 'Auth system',
          status: true,
          detail: session?.session ? 'Active session' : 'No active session',
        });
      } catch (e) {
        authEnabled = false;
        checks.push({
          name: 'Auth system',
          status: false,
          detail: `Error: ${e.message}`,
        });
      }

      // Check 4: Storage Buckets (best effort)
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          // RLS might block listing, try to check if buckets exist by name
          storageBucketsConfigured = 'unknown';
          checks.push({
            name: 'Storage buckets',
            status: null,
            detail: 'Cannot verify (RLS may block listing)',
          });
        } else {
          const hasAudio = buckets?.some(b => b.name === 'music-audio');
          const hasCovers = buckets?.some(b => b.name === 'music-covers');
          storageBucketsConfigured = hasAudio && hasCovers;
          checks.push({
            name: 'Storage: music-audio bucket',
            status: hasAudio,
            detail: hasAudio ? 'Found' : 'Not found - create in Supabase Dashboard',
          });
          checks.push({
            name: 'Storage: music-covers bucket',
            status: hasCovers,
            detail: hasCovers ? 'Found' : 'Not found - create in Supabase Dashboard',
          });
        }
      } catch (e) {
        storageBucketsConfigured = 'unknown';
        checks.push({
          name: 'Storage buckets',
          status: null,
          detail: `Cannot verify: ${e.message}`,
        });
      }

      // Check 5: Required tables
      const tables = ['music_tracks', 'music_likes', 'music_recent', 'music_playlists', 'user_profiles'];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(0);
          checks.push({
            name: `Table: ${table}`,
            status: !error,
            detail: error ? `Missing or no access: ${error.message}` : 'OK',
          });
        } catch (e) {
          checks.push({
            name: `Table: ${table}`,
            status: false,
            detail: `Error: ${e.message}`,
          });
        }
      }
    }

    setStatus({
      mode,
      supabaseConfigured,
      authEnabled,
      storageBucketsConfigured,
      databaseConnected,
      currentUser: isAuthenticated ? user?.email : null,
      checks,
    });
    setIsChecking(false);
  };

  const StatusIcon = ({ value }) => {
    if (value === null || value === 'unknown') {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return value ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" asChild className="text-white/60 hover:text-white mb-6">
        <Link href="/music"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Music</Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">System Status</h1>
          <p className="text-white/60">NovaTok Music configuration check</p>
        </div>
        <Button 
          onClick={checkStatus} 
          disabled={isChecking}
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
        >
          {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6 text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              status.mode === 'supabase' ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              <Database className={`w-6 h-6 ${status.mode === 'supabase' ? 'text-green-400' : 'text-yellow-400'}`} />
            </div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Mode</p>
            <p className={`text-lg font-bold ${status.mode === 'supabase' ? 'text-green-400' : 'text-yellow-400'}`}>
              {status.mode === 'loading' ? '...' : status.mode.toUpperCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6 text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              status.supabaseConfigured ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <StatusIcon value={status.supabaseConfigured} />
            </div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Supabase</p>
            <p className="text-white text-sm font-medium">
              {status.supabaseConfigured ? 'Configured' : 'Not Set'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6 text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              status.authEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
            }`}>
              <Shield className={`w-6 h-6 ${status.authEnabled ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Auth</p>
            <p className="text-white text-sm font-medium">
              {status.authEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6 text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              status.currentUser ? 'bg-purple-500/20' : 'bg-gray-500/20'
            }`}>
              <User className={`w-6 h-6 ${status.currentUser ? 'text-purple-400' : 'text-gray-400'}`} />
            </div>
            <p className="text-white/60 text-xs uppercase tracking-wider">User</p>
            <p className="text-white text-sm font-medium truncate max-w-[100px] mx-auto" title={status.currentUser || 'Guest'}>
              {status.currentUser || 'Guest'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* JSON Status */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black/30 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-green-400">
{JSON.stringify({
  mode: status.mode,
  supabaseConfigured: status.supabaseConfigured,
  authEnabled: status.authEnabled,
  storageBucketsConfigured: status.storageBucketsConfigured,
  databaseConnected: status.databaseConnected,
  currentUser: status.currentUser ? '(authenticated)' : null,
}, null, 2)}
            </code>
          </pre>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Detailed Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {isChecking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {status.checks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                  <StatusIcon value={check.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{check.name}</p>
                    <p className="text-white/60 text-sm truncate">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Links */}
      <div className="mt-6 text-center">
        <p className="text-white/40 text-sm mb-2">Need help setting up?</p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <Link href="/SUPABASE_SETUP.md" target="_blank">Setup Guide</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
