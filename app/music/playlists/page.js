'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/context/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, ListMusic, Plus, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/lib/context/PlayerContext';

export default function PlaylistsPage() {
  const { user, isAuthenticated, isSupabaseConfigured, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isSupabaseConfigured) {
      fetchPlaylists();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, isSupabaseConfigured, user]);

  const fetchPlaylists = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('music_playlists')
      .select(`
        *,
        music_playlist_tracks(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
    } else {
      setPlaylists(data.map(p => ({
        ...p,
        track_count: p.music_playlist_tracks?.[0]?.count || 0,
      })));
    }
    setIsLoading(false);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    setIsCreating(true);
    const { data, error } = await supabase
      .from('music_playlists')
      .insert({ user_id: user.id, name: newPlaylistName.trim() })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create playlist');
    } else {
      toast.success('Playlist created!');
      setPlaylists([{ ...data, track_count: 0 }, ...playlists]);
      setNewPlaylistName('');
      setDialogOpen(false);
    }
    setIsCreating(false);
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Delete this playlist?')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('music_playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete playlist');
    } else {
      toast.success('Playlist deleted');
      setPlaylists(playlists.filter(p => p.id !== playlistId));
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
          <ListMusic className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <p className="text-white/60 mb-6">Sign in to create and manage playlists.</p>
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
          <h1 className="text-2xl font-bold text-white">My Playlists</h1>
          <p className="text-white/60">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" /> New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a2e] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="bg-white/5 border-white/10 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <Button
                onClick={handleCreatePlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <ListMusic className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No playlists yet</h3>
            <p className="text-white/60 mb-4">Create your first playlist to organize your music</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-4">
                <Link href={`/music/playlist/${playlist.id}`} className="block">
                  <div className="w-full aspect-square mb-4 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                    <ListMusic className="w-16 h-16 text-white/60" />
                  </div>
                  <h3 className="text-white font-semibold truncate">{playlist.name}</h3>
                  <p className="text-white/60 text-sm">{playlist.track_count} track{playlist.track_count !== 1 ? 's' : ''}</p>
                </Link>
                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
