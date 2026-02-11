'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TrackCard from '@/components/TrackCard';
import { useAuth } from '@/lib/context/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, Music2, Upload, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function MyTracksPage() {
  const { user, isAuthenticated, isSupabaseConfigured, loading: authLoading } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isSupabaseConfigured) {
      fetchMyTracks();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, isSupabaseConfigured, user]);

  const fetchMyTracks = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tracks:', error);
      toast.error('Failed to load tracks');
    } else {
      setTracks(data.map(t => ({
        ...t,
        artist_name: t.artist,
        duration_sec: t.duration_seconds,
      })));
    }
    setIsLoading(false);
  };

  const handleDelete = async (trackId) => {
    if (!confirm('Delete this track? This cannot be undone.')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('music_tracks')
      .delete()
      .eq('id', trackId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete track');
    } else {
      toast.success('Track deleted');
      setTracks(tracks.filter(t => t.id !== trackId));
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isSupabaseConfigured || !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Music2 className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <p className="text-white/60 mb-6">Sign in to view and manage your uploaded tracks.</p>
        <Button asChild className="bg-purple-500 hover:bg-purple-600">
          <Link href="/music/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" asChild className="text-white/60 hover:text-white mb-6">
        <Link href="/music"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tracks</h1>
          <p className="text-white/60">{tracks.length} uploaded track{tracks.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild className="bg-purple-500 hover:bg-purple-600">
          <Link href="/music/upload"><Upload className="w-4 h-4 mr-2" /> Upload New</Link>
        </Button>
      </div>

      {tracks.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Music2 className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No tracks yet</h3>
            <p className="text-white/60 mb-4">Upload your first track to get started</p>
            <Button asChild className="bg-purple-500 hover:bg-purple-600">
              <Link href="/music/upload">Upload Track</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="relative group">
              <TrackCard track={track} allTracks={tracks} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(track.id)}
                  className="w-8 h-8 bg-black/60 hover:bg-red-500/80 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
