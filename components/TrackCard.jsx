'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '@/lib/context/PlayerContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Play, Pause, Heart, MoreHorizontal, Music2, ListPlus, User, Disc } from 'lucide-react';
import { isTrackLiked, toggleLike, getTracks } from '@/lib/data/data-service';

export default function TrackCard({ track, allTracks = null }) {
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, pause, addToQueue } = usePlayer();
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentTrack = currentTrack?.id === track.id;

  useEffect(() => {
    isTrackLiked(track.id).then(setLiked);
  }, [track.id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = await toggleLike(track.id);
    setLiked(newLiked);
  };

  const handlePlay = async (e) => {
    e.stopPropagation();
    if (isCurrentTrack && isPlaying) {
      pause();
    } else {
      // Get all tracks for queue if not provided
      const queue = allTracks || await getTracks();
      const index = queue.findIndex(t => t.id === track.id);
      playTrack(track, queue, index >= 0 ? index : 0);
    }
  };

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(track);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="group relative bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border border-white/5 hover:border-purple-500/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/music/track/${track.id}`)}
    >
      {/* Cover Image */}
      <div className="relative aspect-square">
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 items-center justify-center ${track.cover_url ? 'hidden' : 'flex'}`}
          style={{ display: track.cover_url ? 'none' : 'flex' }}
        >
          <Music2 className="w-12 h-12 text-white/40" />
        </div>
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered || isCurrentTrack ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlay}
            className="w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-600 text-white hover:scale-110 transition-transform shadow-lg"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Currently Playing Indicator */}
        {isCurrentTrack && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Playing
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-medium truncate mb-1">{track.title}</h3>
        <p className="text-white/60 text-sm truncate mb-2">{track.artist_name}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">{formatDuration(track.duration_sec)}</span>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`w-8 h-8 ${liked ? 'text-pink-500' : 'text-white/40 hover:text-white'} hover:bg-white/10`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                <DropdownMenuItem 
                  onClick={handleAddToQueue}
                  className="text-white/80 hover:text-white focus:text-white focus:bg-white/10"
                >
                  <ListPlus className="w-4 h-4 mr-2" />
                  Add to queue
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/music/artist/${track.artist_id}`);
                  }}
                  className="text-white/80 hover:text-white focus:text-white focus:bg-white/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  Go to artist
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/music/album/${track.album_id}`);
                  }}
                  className="text-white/80 hover:text-white focus:text-white focus:bg-white/10"
                >
                  <Disc className="w-4 h-4 mr-2" />
                  Go to album
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
