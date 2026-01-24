'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import TrackCard from '@/components/TrackCard';
import { getLikedTracks, getRecentTracks } from '@/lib/data/data-service';
import { Heart, Clock, Loader2, Music2 } from 'lucide-react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('liked');
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const data = activeTab === 'liked' 
          ? await getLikedTracks()
          : await getRecentTracks();
        setTracks(data);
      } catch (error) {
        console.error('Error fetching library:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
  }, [activeTab]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Your Library</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('liked')}
          className={`rounded-full ${activeTab === 'liked' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'text-white/60 hover:text-white'}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          Liked Songs
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('recent')}
          className={`rounded-full ${activeTab === 'recent' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'text-white/60 hover:text-white'}`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Recent Plays
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-white/60">Loading your library...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            {activeTab === 'liked' ? (
              <Heart className="w-10 h-10 text-purple-400" />
            ) : (
              <Clock className="w-10 h-10 text-purple-400" />
            )}
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            {activeTab === 'liked' ? 'No liked songs yet' : 'No recent plays'}
          </h2>
          <p className="text-white/60 text-center max-w-md">
            {activeTab === 'liked' 
              ? 'Start exploring and like songs to see them here!' 
              : 'Play some music to build your listening history'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} allTracks={tracks} />
          ))}
        </div>
      )}
    </div>
  );
}
