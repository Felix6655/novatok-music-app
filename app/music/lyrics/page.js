'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/lib/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  ListMusic, FileText, Settings, ChevronLeft, Upload, Edit3, 
  Music2, Play, Pause, RefreshCw, Loader2 
} from 'lucide-react';

export default function LyricsPage() {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, seek } = usePlayer();
  const [lyrics, setLyrics] = useState('');
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [sidebarTab, setSidebarTab] = useState('lyrics');
  const [isEditing, setIsEditing] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Untitled Session');
  const lyricsContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Parse LRC format lyrics
  const parseLRC = (lrcText) => {
    const lines = lrcText.split('\n');
    const parsed = [];
    
    lines.forEach(line => {
      // Match LRC timestamp format [mm:ss.xx] or [mm:ss]
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
        // Plain text without timestamp
        parsed.push({ time: null, text: line.trim() });
      }
    });
    
    return parsed.sort((a, b) => (a.time || 0) - (b.time || 0));
  };

  // Update parsed lyrics when raw lyrics change
  useEffect(() => {
    const parsed = parseLRC(lyrics);
    setParsedLyrics(parsed);
  }, [lyrics]);

  // Update current line based on playback time
  useEffect(() => {
    if (parsedLyrics.length === 0) return;
    
    const hasTimestamps = parsedLyrics.some(l => l.time !== null);
    if (!hasTimestamps) return;

    let newIndex = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (parsedLyrics[i].time !== null && currentTime >= parsedLyrics[i].time) {
        newIndex = i;
        break;
      }
    }
    
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [currentTime, parsedLyrics, currentLineIndex]);

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

  const handleImportLRC = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLyrics(event.target.result);
        setIsEditing(false);
      };
      reader.readAsText(file);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasTimestamps = parsedLyrics.some(l => l.time !== null);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] min-h-[500px]">
      {/* Left Sidebar */}
      <div className="w-full lg:w-80 bg-white/5 rounded-xl border border-white/10 flex flex-col">
        {/* Sidebar Tabs */}
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
            <p className="text-white/60 text-sm">View and manage your playback queue here.</p>
          </TabsContent>

          <TabsContent value="lyrics" className="flex-1 flex flex-col p-4 m-0 gap-4">
            {/* Paste/Editor Toggle */}
            <div className="flex gap-2">
              <Button
                variant={!isEditing ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(false)}
                className={!isEditing ? 'bg-purple-500 hover:bg-purple-600' : 'border-white/20 text-white/60'}
              >
                Paste
              </Button>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(true)}
                className={isEditing ? 'bg-purple-500 hover:bg-purple-600' : 'border-white/20 text-white/60'}
              >
                Editor
              </Button>
            </div>

            {/* Lyrics Input */}
            <Textarea
              placeholder="Paste lyrics here...\n\n[Verse 1]\nYour lyrics...\n\n[Chorus]\nChorus lyrics..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="flex-1 min-h-[200px] bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
            />

            {/* Actions */}
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
                Import .lrc
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            <p className="text-white/40 text-xs">
              Tip: Use [Verse], [Chorus] tags. Import .lrc for synced lyrics.
            </p>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 p-4 m-0">
            <p className="text-white/60 text-sm">Lyrics display settings coming soon.</p>
          </TabsContent>
        </Tabs>
      </div>

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
          </div>
        </div>

        {/* Lyrics Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
          {parsedLyrics.length === 0 ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Music2 className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-white/60 text-lg mb-2">No lyrics loaded</h3>
              <p className="text-white/40 text-sm">Add lyrics in the Lyrics tab</p>
            </div>
          ) : (
            <ScrollArea className="w-full h-full" ref={lyricsContainerRef}>
              <div className="space-y-4 py-8 px-4">
                {parsedLyrics.map((line, index) => (
                  <div
                    key={index}
                    data-index={index}
                    className={`text-center transition-all duration-300 cursor-pointer ${
                      index === currentLineIndex
                        ? 'text-2xl md:text-3xl font-bold text-white scale-105'
                        : 'text-lg md:text-xl text-white/40 hover:text-white/60'
                    }`}
                    onClick={() => line.time !== null && seek(line.time)}
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

        {/* Mode Indicator */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">
            {hasTimestamps ? 'Synced lyrics mode' : 'Lyrics-only mode'}
          </p>
          <p className="text-white/40 text-xs">
            {hasTimestamps ? 'Auto-scrolling with playback' : 'Auto-scrolling at reading pace'}
          </p>
        </div>

        {/* Play Controls */}
        {currentTrack && (
          <div className="p-4 border-t border-white/10 flex items-center justify-center">
            <Button
              onClick={togglePlay}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-8"
            >
              {isPlaying ? (
                <><Pause className="w-5 h-5 mr-2" /> Pause</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> Play</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
