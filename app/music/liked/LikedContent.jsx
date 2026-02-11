'use client';

import { useState, useEffect } from 'react';
import TrackCard from '@/components/TrackCard';
import { getLikedTracks } from '@/lib/data/data-service';
import { Loader2, Heart, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LikedContent() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const data = await getLikedTracks();
        setTracks(data);
      } catch (error) {
        console.error('Error fetching liked tracks:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
    
    // Listen for storage changes (when likes are updated)
    const handleStorageChange = () => {
      fetchTracks();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading liked tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-pink-400" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">No liked tracks yet</h2>
        <p className="text-white/60 text-center max-w-md mb-6">
          Tap the heart icon on any track to save it to your likes.
        </p>
        <Button asChild className="bg-purple-500 hover:bg-purple-600">
          <Link href="/music">
            <Music2 className="w-4 h-4 mr-2" />
            Discover Music
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Liked Tracks</h1>
        </div>
        <p className="text-white/60">{tracks.length} track{tracks.length !== 1 ? 's' : ''} you love</p>
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} allTracks={tracks} />
        ))}
      </div>
    </div>
  );
}
