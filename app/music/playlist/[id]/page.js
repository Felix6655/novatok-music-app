'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TrackCard from '@/components/TrackCard';
import { useAuth } from '@/lib/context/AuthContext';
import { usePlayer } from '@/lib/context/PlayerContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, ListMusic, Play, Shuffle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PlaylistDetailPage({ params }) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Fetch playlist
    const { data: playlistData, error: playlistError } = await supabase
      .from('music_playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (playlistError || !playlistData) {
      setIsLoading(false);
      return;
    }

    setPlaylist(playlistData);
    setIsOwner(user?.id === playlistData.user_id);

    // Fetch tracks in playlist
    const { data: trackData, error: trackError } = await supabase
      .from('music_playlist_tracks')
      .select(`
        track_id,
        position,
        music_tracks(*)
      `)
      .eq('playlist_id', id)
      .order('position');

    if (!trackError && trackData) {
      setTracks(trackData.map(t => ({
        ...t.music_tracks,
        artist_name: t.music_tracks.artist,
        duration_sec: t.music_tracks.duration_seconds,
      })).filter(Boolean));
    }

    setIsLoading(false);
  };

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks, 0);
  };

  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled, 0);
  };

  const handleRemoveTrack = async (trackId) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('music_playlist_tracks')
      .delete()
      .eq('playlist_id', id)
      .eq('track_id', trackId);

    if (error) {
      toast.error('Failed to remove track');
    } else {
      toast.success('Track removed');
      setTracks(tracks.filter(t => t.id !== trackId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Playlist Not Found</h2>
        <Button asChild><Link href="/music/playlists">Back to Playlists</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" asChild className="text-white/60 hover:text-white mb-6">
        <Link href="/music/playlists"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
      </Button>

      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
          <ListMusic className="w-20 h-20 text-white/60" />
        </div>
        <div className="flex-1">
          <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Playlist</p>
          <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
          {playlist.description && <p className="text-white/60 mb-4">{playlist.description}</p>}
          <p className="text-white/60 text-sm mb-4">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
          
          <div className="flex gap-3">
            <Button onClick={handlePlayAll} disabled={tracks.length === 0} className="bg-purple-500 hover:bg-purple-600">
              <Play className="w-4 h-4 mr-2" /> Play All
            </Button>
            <Button onClick={handleShuffle} disabled={tracks.length === 0} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Shuffle className="w-4 h-4 mr-2" /> Shuffle
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-white/60">This playlist is empty. Add some tracks!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="relative group">
              <TrackCard track={track} allTracks={tracks} />
              {isOwner && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveTrack(track.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
