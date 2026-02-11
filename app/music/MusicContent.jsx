'use client';

import { useState, useEffect } from 'react';
import TrackCard from '@/components/TrackCard';
import { getTracks } from '@/lib/data/data-service';
import { Loader2, Sparkles } from 'lucide-react';

export default function MusicContent() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const data = await getTracks({ orderBy: 'created_at', limit: 20 });
        setTracks(data);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
          <span className="text-4xl">🎵</span>
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">No tracks found</h2>
        <p className="text-white/60 text-center max-w-md">
          Check back later for new releases
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Discover New Music</h1>
        </div>
        <p className="text-white/60">Explore the latest releases</p>
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
