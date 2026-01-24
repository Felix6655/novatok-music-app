'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Database, Cloud, HardDrive, CheckCircle2, 
  XCircle, AlertCircle, Music2, Info, ExternalLink 
} from 'lucide-react';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    mode: 'loading',
    supabaseUrl: false,
    supabaseAnonKey: false,
    tracksCount: 0,
    artistsCount: 0,
    albumsCount: 0,
  });

  useEffect(() => {
    // Check environment configuration
    const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isSupabaseMode = supabaseUrl && supabaseAnonKey;

    // Import seed data counts
    import('@/lib/data/seed-data').then((seedData) => {
      setConfig({
        mode: isSupabaseMode ? 'supabase' : 'guest',
        supabaseUrl,
        supabaseAnonKey,
        tracksCount: seedData.tracks.length,
        artistsCount: seedData.artists.length,
        albumsCount: seedData.albums.length,
      });
    });
  }, []);

  const isGuestMode = config.mode === 'guest';
  const isSupabaseMode = config.mode === 'supabase';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        asChild
        className="text-white/60 hover:text-white mb-6"
      >
        <Link href="/music">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Music
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-white/60 mb-8">Connection status and app configuration</p>

      {/* Connection Status Card */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {isGuestMode ? (
              <>
                <HardDrive className="w-5 h-5 text-yellow-500" />
                Guest Mode Active
              </>
            ) : isSupabaseMode ? (
              <>
                <Cloud className="w-5 h-5 text-green-500" />
                Connected to Supabase
              </>
            ) : (
              <>
                <Database className="w-5 h-5 text-purple-500" />
                Loading...
              </>
            )}
          </CardTitle>
          <CardDescription className="text-white/60">
            {isGuestMode 
              ? 'Your data is stored locally in this browser' 
              : isSupabaseMode 
              ? 'Your data syncs to the cloud database'
              : 'Checking connection...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mode Badge */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-white/80">Current Mode</span>
              <Badge 
                variant="outline" 
                className={isGuestMode 
                  ? 'border-yellow-500/50 text-yellow-500' 
                  : 'border-green-500/50 text-green-500'}
              >
                {isGuestMode ? 'Guest Mode' : isSupabaseMode ? 'Supabase Mode' : 'Loading'}
              </Badge>
            </div>

            {/* What this means */}
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80 text-sm">
                    {isGuestMode ? (
                      <>
                        <strong>Guest Mode</strong> means your likes, recent plays, and player state 
                        are saved to your browser&apos;s localStorage. This data won&apos;t sync across 
                        devices or browsers.
                      </>
                    ) : (
                      <>
                        <strong>Supabase Mode</strong> syncs your data to the cloud. When you sign in, 
                        your library will be available on any device.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Status */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">Environment Variables</CardTitle>
          <CardDescription className="text-white/60">
            Required variables for Supabase integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                {config.supabaseUrl ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <code className="text-white/80 text-sm">NEXT_PUBLIC_SUPABASE_URL</code>
              </div>
              <Badge variant="outline" className={config.supabaseUrl 
                ? 'border-green-500/50 text-green-500' 
                : 'border-red-500/50 text-red-400'}>
                {config.supabaseUrl ? 'Set' : 'Missing'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                {config.supabaseAnonKey ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <code className="text-white/80 text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </div>
              <Badge variant="outline" className={config.supabaseAnonKey 
                ? 'border-green-500/50 text-green-500' 
                : 'border-red-500/50 text-red-400'}>
                {config.supabaseAnonKey ? 'Set' : 'Missing'}
              </Badge>
            </div>

            {!isSupabaseMode && (
              <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/80 text-sm mb-2">
                      To enable Supabase sync, add these environment variables to your deployment:
                    </p>
                    <a 
                      href="https://supabase.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-1"
                    >
                      Get credentials at supabase.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seed Data Info */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Music2 className="w-5 h-5 text-purple-400" />
            Demo Data
          </CardTitle>
          <CardDescription className="text-white/60">
            {isGuestMode 
              ? 'Local seed data loaded for demo purposes' 
              : 'Data loaded from Supabase database'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white">{config.tracksCount}</div>
              <div className="text-white/60 text-sm">Tracks</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white">{config.artistsCount}</div>
              <div className="text-white/60 text-sm">Artists</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white">{config.albumsCount}</div>
              <div className="text-white/60 text-sm">Albums</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="mt-8 text-center text-white/40 text-sm">
        <p>NovaTok Music v1.0.0</p>
        <p>Built with Next.js 14 + Tailwind CSS</p>
      </div>
    </div>
  );
}
