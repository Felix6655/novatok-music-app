'use client';

import { usePlayer } from '@/lib/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  ChevronDown, Loader2, Music2, Shuffle, Repeat, Repeat1,
  ListMusic, X, Heart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { isTrackLiked, toggleLike } from '@/lib/data/data-service';

export default function ExpandedPlayer() {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isExpanded,
    repeat,
    shuffle,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setExpanded,
    setRepeat,
    toggleShuffle,
    playTrack,
    removeFromQueue,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      isTrackLiked(currentTrack.id).then(setLiked);
    }
  }, [currentTrack]);

  const handleLike = async () => {
    if (!currentTrack) return;
    const newLiked = await toggleLike(currentTrack.id);
    setLiked(newLiked);
  };

  if (!isExpanded || !currentTrack) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cycleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % 3]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-purple-900/95 via-black/98 to-black backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(false)}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
        <span className="text-white/60 text-sm font-medium">Now Playing</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowQueue(!showQueue)}
          className={`text-white/60 hover:text-white hover:bg-white/10 ${showQueue ? 'text-purple-400' : ''}`}
        >
          <ListMusic className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all ${showQueue ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
          {/* Album Art */}
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 mb-8">
            {currentTrack.cover_url ? (
              <img 
                src={currentTrack.cover_url} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                <Music2 className="w-24 h-24 text-purple-400" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentTrack.title}</h2>
            <p className="text-white/60 text-lg">{currentTrack.artist_name}</p>
          </div>

          {/* Progress */}
          <div className="w-full max-w-md mb-6">
            <Slider
              value={[currentTime]}
              onValueChange={([val]) => seek(val)}
              max={duration || 100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-white/60 text-sm mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={`text-white/60 hover:text-white hover:bg-white/10 ${shuffle ? 'text-purple-400' : ''}`}
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={previous}
              className="text-white/80 hover:text-white hover:bg-white/10 w-12 h-12"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="text-white/80 hover:text-white hover:bg-white/10 w-12 h-12"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleRepeat}
              className={`text-white/60 hover:text-white hover:bg-white/10 ${repeat !== 'off' ? 'text-purple-400' : ''}`}
            >
              {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </Button>
          </div>

          {/* Volume & Like */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`hover:bg-white/10 ${liked ? 'text-pink-500' : 'text-white/60 hover:text-white'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </Button>
            
            <div className="flex items-center gap-2 flex-1">
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
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Queue Panel */}
        {showQueue && (
          <div className="w-full md:w-1/2 border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold">Queue ({queue.length})</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQueue(false)}
                className="text-white/60 hover:text-white md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {queue.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      index === queueIndex 
                        ? 'bg-purple-500/20 border border-purple-500/30' 
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => playTrack(track, queue, index)}
                  >
                    <div className="w-10 h-10 rounded overflow-hidden bg-purple-500/20 flex-shrink-0">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${index === queueIndex ? 'text-purple-400 font-medium' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-white/60 text-sm truncate">{track.artist_name}</p>
                    </div>
                    {index !== queueIndex && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(index);
                        }}
                        className="text-white/40 hover:text-white hover:bg-white/10 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
