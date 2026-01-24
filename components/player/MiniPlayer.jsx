'use client';

import { usePlayer } from '@/lib/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  ChevronUp, Loader2, Music2 
} from 'lucide-react';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleExpanded,
  } = usePlayer();

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-xl border-t border-purple-500/20">
      {/* Progress bar at top */}
      <div className="h-1 bg-white/10 cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seek(percent * duration);
      }}>
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={toggleExpanded}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-500/20 flex-shrink-0">
              {currentTrack.cover_url ? (
                <img 
                  src={currentTrack.cover_url} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-purple-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{currentTrack.title}</p>
              <p className="text-white/60 text-sm truncate">{currentTrack.artist_name}</p>
            </div>
            <ChevronUp className="w-5 h-5 text-white/60 hidden sm:block" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={previous}
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Time & Volume */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            <span className="text-white/60 text-sm min-w-[80px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={([val]) => setVolume(val / 100)}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
