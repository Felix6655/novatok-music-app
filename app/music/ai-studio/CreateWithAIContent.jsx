'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { usePlayer } from '@/lib/context/PlayerContext';
import { useAuth } from '@/lib/context/AuthContext';
import {
  generateAIMusic,
  saveGeneratedTrack,
  getMyGeneratedTracks,
} from '@/lib/data/data-service';
import {
  Wand2, Sparkles, Loader2, Play, Pause, Save, Film,
  Music2, AlertTriangle, Check,
} from 'lucide-react';
import { toast } from 'sonner';

const MOODS = ['Happy', 'Chill', 'Energetic', 'Sad', 'Dark', 'Romantic', 'Epic', 'Dreamy'];
const GENRES = ['Pop', 'Hip-Hop', 'Electronic', 'Lo-fi', 'Rock', 'Cinematic', 'Jazz', 'Ambient'];
const DURATIONS = [
  { label: '15 seconds', value: 15 },
  { label: '30 seconds', value: 30 },
  { label: '60 seconds', value: 60 },
];

export default function CreateWithAIContent() {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, pause } = usePlayer();

  const [prompt, setPrompt] = useState('');
  const [mood, setMood] = useState('Chill');
  const [genre, setGenre] = useState('Lo-fi');
  const [duration, setDuration] = useState(15);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null); // single generated track
  const [demoTracks, setDemoTracks] = useState(null); // fallback list
  const [demoMessage, setDemoMessage] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [myCreations, setMyCreations] = useState([]);

  useEffect(() => {
    getMyGeneratedTracks(user?.id).then(setMyCreations).catch(() => setMyCreations([]));
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Describe your track first', { description: 'e.g. "uplifting synth pop with a driving beat"' });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setDemoTracks(null);
    setDemoMessage(null);

    try {
      const res = await generateAIMusic({ prompt, mood, genre, duration });

      if (res.success) {
        setResult(res.track);
        playTrack(res.track, [res.track], 0);
        toast.success('Track generated!', { description: 'Now playing your AI track' });
      } else {
        setDemoMessage(res.message);
        setDemoTracks(res.tracks);
        toast.info('AI generation is in demo mode right now', {
          description: 'Here are some demo tracks to try in the meantime',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else {
      playTrack(track, [track], 0);
    }
  };

  const handleSave = async (track) => {
    try {
      const saved = await saveGeneratedTrack(track, user?.id);
      setSavedIds(prev => new Set(prev).add(track.id));
      setMyCreations(prev => [saved, ...prev.filter(t => t.id !== saved.id)]);
      toast.success('Saved!', { description: 'Find it under Your AI Creations below' });
    } catch (error) {
      toast.error('Could not save track', { description: error.message });
    }
  };

  const handleUseInReel = (track) => {
    try {
      localStorage.setItem('novatok_reel_sound_draft', JSON.stringify(track));
    } catch {
      // localStorage unavailable - non-blocking
    }
    toast.success('Track ready for Reels', { description: 'Open Reels and pick it from your saved sounds' });
  };

  const activeTracks = result ? [result] : (demoTracks || []);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Music with AI</h1>
        <p className="text-white/60">Describe a vibe and let AI compose an original track</p>
      </div>

      {/* Prompt Form */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Describe your track</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. uplifting synth pop with a driving beat and dreamy vocals"
              className="bg-white/5 border-white/10 text-white min-h-[90px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {MOODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Genre / Style</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Duration</label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {DURATIONS.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Composing your track...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" /> Generate</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Demo mode banner */}
      {demoMessage && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">{demoMessage}</p>
            <p className="text-white/60 text-sm">The AI engine may be waking up or temporarily unavailable. Try one of these demo tracks while you wait.</p>
          </div>
        </div>
      )}

      {/* Generated track(s) */}
      {activeTracks.length > 0 && (
        <div className="space-y-3 mb-10">
          {activeTracks.map((track) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isSaved = savedIds.has(track.id);
            return (
              <Card key={track.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <Button
                    size="icon"
                    onClick={() => handlePlay(track)}
                    className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0"
                  >
                    {isCurrentTrack && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{track.title}</p>
                    <p className="text-white/60 text-sm truncate">
                      {track.artist_name} · {track.mood || mood} · {track.genre || genre}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSave(track)}
                      disabled={isSaved}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {isSaved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseInReel(track)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Film className="w-4 h-4 mr-1" /> Use in Reel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Your AI Creations */}
      {myCreations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Music2 className="w-5 h-5 text-purple-400" /> Your AI Creations
          </h2>
          <div className="space-y-3">
            {myCreations.map((track) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              return (
                <Card key={track.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Button
                      size="icon"
                      onClick={() => handlePlay(track)}
                      className="w-10 h-10 rounded-full bg-purple-500/80 hover:bg-purple-600 text-white flex-shrink-0"
                    >
                      {isCurrentTrack && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{track.title}</p>
                      <p className="text-white/60 text-sm truncate">{track.artist_name}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseInReel(track)}
                      className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                    >
                      <Film className="w-4 h-4 mr-1" /> Use in Reel
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
