'use client';

import { useState, useEffect } from 'react';
import TrackCard from '@/components/TrackCard';
import { getTrendingTracks } from '@/lib/data/data-service';
import { Loader2, TrendingUp, Flame } from 'lucide-react';

export default function TrendingContent() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const data = await getTrendingTracks(20);
        setTracks(data);
      } catch (error) {
        console.error('Error fetching trending tracks:', error);
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
        <p className="text-white/60">Loading trending tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
          <TrendingUp className="w-10 h-10 text-orange-400" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">No trending tracks yet</h2>
        <p className="text-white/60 text-center max-w-md">
          Start playing music to see what&apos;s trending!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Trending Now</h1>
        </div>
        <p className="text-white/60">Most played tracks this week</p>
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="relative">
            {/* Rank Badge */}
            <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {index + 1}
            </div>
            <TrackCard track={track} allTracks={tracks} />
          </div>
        ))}
      </div>
    </div>
  );
}
