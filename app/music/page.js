'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackCard from '@/components/TrackCard';
import { getTracks, getLikedTracks, getRecentTracks } from '@/lib/data/data-service';
import { Loader2 } from 'lucide-react';

function MusicPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'discover';
  
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        let data;
        switch (tab) {
          case 'trending':
            data = await getTracks({ orderBy: 'play_count', limit: 20 });
            break;
          case 'liked':
            data = await getLikedTracks();
            break;
          case 'recent':
            data = await getRecentTracks();
            break;
          default:
            data = await getTracks({ orderBy: 'created_at', limit: 20 });
        }
        setTracks(data);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [tab]);

  const getTabTitle = () => {
    switch (tab) {
      case 'trending': return 'Trending Tracks';
      case 'liked': return 'Liked Tracks';
      case 'recent': return 'Recently Played';
      default: return 'Discover New Music';
    }
  };

  const getTabDescription = () => {
    switch (tab) {
      case 'trending': return 'Most played tracks this week';
      case 'liked': return 'Your favorite tracks';
      case 'recent': return 'Continue listening';
      default: return 'Explore the latest releases';
    }
  };

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
        <h2 className="text-white text-xl font-semibold mb-2">
          {tab === 'liked' ? 'No liked tracks yet' : 
           tab === 'recent' ? 'No recent plays' : 'No tracks found'}
        </h2>
        <p className="text-white/60 text-center max-w-md">
          {tab === 'liked' ? 'Like some tracks to see them here!' : 
           tab === 'recent' ? 'Start playing music to build your history' : 
           'Check back later for new releases'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">{getTabTitle()}</h2>
        <p className="text-white/60">{getTabDescription()}</p>
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

export default function MusicPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading tracks...</p>
      </div>
    }>
      <MusicPageContent />
    </Suspense>
  );
}
