'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@/lib/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  ListMusic, FileText, Settings, Maximize2, Share2, Mic, 
  Music2, Play, Pause, RefreshCw, Timer, Save, Upload 
} from 'lucide-react';
import { toast } from 'sonner';

export default function KaraokePage() {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, seek, play } = usePlayer();
  const [lyrics, setLyrics] = useState('');
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [sidebarTab, setSidebarTab] = useState('lyrics');
  const [sessionTitle, setSessionTitle] = useState('Untitled Session');
  const [isTimingMode, setIsTimingMode] = useState(false);
  const [timingIndex, setTimingIndex] = useState(0);
  const [timedLyrics, setTimedLyrics] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Parse LRC format lyrics
  const parseLRC = (lrcText) => {
    const lines = lrcText.split('\n');
    const parsed = [];
    
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.?(\d{2})?\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const hundredths = match[3] ? parseInt(match[3]) : 0;
        const time = minutes * 60 + seconds + hundredths / 100;
        const text = match[4].trim();
        if (text) {
          parsed.push({ time, text });
        }
      } else if (line.trim() && !line.startsWith('[')) {
        parsed.push({ time: null, text: line.trim() });
      }
    });
    
    return parsed.sort((a, b) => (a.time || 0) - (b.time || 0));
  };

  // Update parsed lyrics when raw lyrics change
  useEffect(() => {
    const parsed = parseLRC(lyrics);
    setParsedLyrics(parsed);
    setTimedLyrics(parsed);
  }, [lyrics]);

  // Update current line based on playback time
  useEffect(() => {
    if (timedLyrics.length === 0) return;
    
    const hasTimestamps = timedLyrics.some(l => l.time !== null);
    if (!hasTimestamps) return;

    let newIndex = -1;
    for (let i = timedLyrics.length - 1; i >= 0; i--) {
      if (timedLyrics[i].time !== null && currentTime >= timedLyrics[i].time) {
        newIndex = i;
        break;
      }
    }
    
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [currentTime, timedLyrics, currentLineIndex]);

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeElement = container.querySelector(`[data-index="${currentLineIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  // Handle timing tap
  const handleTimingTap = useCallback(() => {
    if (!isTimingMode || timingIndex >= parsedLyrics.length) return;

    const newTimedLyrics = [...timedLyrics];
    newTimedLyrics[timingIndex] = {
      ...newTimedLyrics[timingIndex],
      time: currentTime,
    };
    setTimedLyrics(newTimedLyrics);
    setTimingIndex(timingIndex + 1);

    if (timingIndex + 1 >= parsedLyrics.length) {
      setIsTimingMode(false);
      toast.success('Timing complete!', {
        description: 'All lines have been timed.',
      });
    }
  }, [isTimingMode, timingIndex, parsedLyrics, timedLyrics, currentTime]);

  // Keyboard shortcut for timing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && isTimingMode) {
        e.preventDefault();
        handleTimingTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimingMode, handleTimingTap]);

  const handleImportLRC = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLyrics(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const startTimingMode = () => {
    if (parsedLyrics.length === 0) {
      toast.error('Add lyrics first');
      return;
    }
    // Reset timing data
    setTimedLyrics(parsedLyrics.map(l => ({ ...l, time: null })));
    setTimingIndex(0);
    setIsTimingMode(true);
    seek(0);
    play();
    toast.info('Timing mode started', {
      description: 'Press SPACE or tap the button to mark each line.',
    });
  };

  const exportLRC = () => {
    if (timedLyrics.length === 0) return;
    
    const lrcContent = timedLyrics.map(line => {
      if (line.time !== null) {
        const mins = Math.floor(line.time / 60).toString().padStart(2, '0');
        const secs = Math.floor(line.time % 60).toString().padStart(2, '0');
        const hundredths = Math.floor((line.time % 1) * 100).toString().padStart(2, '0');
        return `[${mins}:${secs}.${hundredths}]${line.text}`;
      }
      return line.text;
    }).join('\n');

    const blob = new Blob([lrcContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle}.lrc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('LRC file exported!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasTimestamps = timedLyrics.some(l => l.time !== null);

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] min-h-[500px] bg-[#0a0a0f]">
      {/* Left Sidebar */}
      {!isFullscreen && (
        <div className="w-full lg:w-80 bg-white/5 rounded-xl border border-white/10 flex flex-col">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex flex-col h-full">
            <TabsList className="bg-transparent border-b border-white/10 rounded-none p-0 h-auto">
              <TabsTrigger 
                value="queue" 
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none py-3"
              >
                <ListMusic className="w-4 h-4 mr-2" />
                Queue
              </TabsTrigger>
              <TabsTrigger 
                value="lyrics" 
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Lyrics
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none py-3"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="flex-1 p-4 m-0">
              <p className="text-white/60 text-sm">Queue management coming soon.</p>
            </TabsContent>

            <TabsContent value="lyrics" className="flex-1 flex flex-col p-4 m-0 gap-4">
              <Textarea
                placeholder="Paste lyrics here...\n\n[Verse 1]\nYour lyrics...\n\n[Chorus]\nChorus lyrics..."
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="flex-1 min-h-[200px] bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
              />

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".lrc,.txt"
                  onChange={handleImportLRC}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportLRC}
                  disabled={timedLyrics.length === 0}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <p className="text-white/40 text-xs">
                Tip: Import .lrc for pre-synced lyrics or use timing mode to create your own.
              </p>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-4 m-0">
              <p className="text-white/60 text-sm">Karaoke display settings coming soon.</p>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Main Stage */}
      <div className="flex-1 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30 rounded-xl border border-white/10 flex flex-col overflow-hidden">
        {/* Stage Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="bg-transparent text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-2 py-1"
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-white/60 hover:text-white">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white/60 hover:text-white">
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Karaoke Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
          {timedLyrics.length === 0 ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Mic className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-white/60 text-lg mb-2">No lyrics loaded</h3>
              <p className="text-white/40 text-sm">Add lyrics in the Lyrics tab to start karaoke</p>
            </div>
          ) : isTimingMode ? (
            <div className="text-center w-full max-w-2xl">
              <div className="mb-8">
                <p className="text-purple-400 text-sm mb-2">Timing line {timingIndex + 1} of {parsedLyrics.length}</p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {parsedLyrics[timingIndex]?.text || 'Done!'}
                </p>
              </div>
              <Button
                onClick={handleTimingTap}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-12 py-6 text-lg"
                disabled={timingIndex >= parsedLyrics.length}
              >
                <Timer className="w-6 h-6 mr-2" />
                Tap to Time (or press SPACE)
              </Button>
            </div>
          ) : (
            <ScrollArea className="w-full h-full" ref={lyricsContainerRef}>
              <div className="space-y-6 py-8 px-4">
                {timedLyrics.map((line, index) => (
                  <div
                    key={index}
                    data-index={index}
                    className={`text-center transition-all duration-500 ${
                      index === currentLineIndex
                        ? 'text-3xl md:text-5xl font-bold text-white scale-110'
                        : index === currentLineIndex + 1
                        ? 'text-xl md:text-2xl text-white/60'
                        : 'text-lg md:text-xl text-white/30'
                    }`}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-white/10">
          <Slider
            value={[currentTime]}
            onValueChange={([val]) => seek(val)}
            max={duration || 100}
            step={0.1}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-white/60 text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mode Info */}
        {!isTimingMode && (
          <div className="p-4 border-t border-white/10 text-center">
            {hasTimestamps ? (
              <p className="text-green-400 text-sm">✓ Synced karaoke mode active</p>
            ) : (
              <p className="text-yellow-400 text-sm">Add timing to enable karaoke sync</p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {timedLyrics.length > 0 && !hasTimestamps && !isTimingMode && (
            <Button
              onClick={startTimingMode}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6"
            >
              <Timer className="w-5 h-5 mr-2" />
              Start Timing Mode
            </Button>
          )}
          {isTimingMode && (
            <Button
              onClick={() => setIsTimingMode(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-6"
            >
              Cancel Timing
            </Button>
          )}
          <Button
            onClick={togglePlay}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-full px-8"
          >
            {isPlaying ? (
              <><Pause className="w-5 h-5 mr-2" /> Pause</>
            ) : (
              <><Play className="w-5 h-5 mr-2" /> Play</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
