'use client';

import { usePlayer } from '@/lib/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  ChevronUp, Loader2, Music2, AlertCircle 
} from 'lucide-react';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    error,
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
    queue,
  } = usePlayer();

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasMultipleTracks = queue.length > 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-xl border-t border-purple-500/20">
      {/* Progress bar at top */}
      <div 
        className="h-1 bg-white/10 cursor-pointer group" 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seek(percent * duration);
        }}
      >
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={toggleExpanded}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-500/20 flex-shrink-0 relative">
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
              {isPlaying && !error && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  <div className="w-0.5 h-2 bg-purple-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-0.5 h-3 bg-purple-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-0.5 h-2 bg-purple-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate flex items-center gap-2">
                {currentTrack.title}
                {error && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              </p>
              <p className="text-white/60 text-sm truncate">{currentTrack.artist_name}</p>
            </div>
            <ChevronUp className="w-5 h-5 text-white/60 hidden sm:block flex-shrink-0" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={previous}
              disabled={!hasMultipleTracks}
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex disabled:opacity-30"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading || error}
              className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : error ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
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
              disabled={!hasMultipleTracks}
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex disabled:opacity-30"
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
