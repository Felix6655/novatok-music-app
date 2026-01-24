'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/lib/context/PlayerContext';
import { getTrackById, isTrackLiked, toggleLike, getTracks } from '@/lib/data/data-service';
import { 
  Play, Pause, Heart, Share2, ListPlus, Clock, Music2, 
  User, Disc, ArrowLeft, Loader2, BarChart2 
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, pause, addToQueue } = usePlayer();
  
  const [track, setTrack] = useState(null);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isCurrentTrack = currentTrack?.id === params.id;

  useEffect(() => {
    const fetchTrack = async () => {
      setIsLoading(true);
      const data = await getTrackById(params.id);
      setTrack(data);
      if (data) {
        const likeStatus = await isTrackLiked(data.id);
        setLiked(likeStatus);
      }
      setIsLoading(false);
    };
    fetchTrack();
  }, [params.id]);

  const handlePlay = async () => {
    if (isCurrentTrack && isPlaying) {
      pause();
    } else if (track) {
      const allTracks = await getTracks();
      const index = allTracks.findIndex(t => t.id === track.id);
      playTrack(track, allTracks, index >= 0 ? index : 0);
    }
  };

  const handleLike = async () => {
    if (!track) return;
    const newLiked = await toggleLike(track.id);
    setLiked(newLiked);
    toast.success(newLiked ? 'Added to liked songs' : 'Removed from liked songs');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleAddToQueue = () => {
    if (track) {
      addToQueue(track);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlayCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading track...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <Music2 className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Track not found</h2>
        <p className="text-white/60 mb-4">This track doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push('/music')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Art */}
        <div className="flex-shrink-0">
          <div className="w-full md:w-80 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
            {track.cover_url ? (
              <img 
                src={track.cover_url} 
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <Music2 className="w-20 h-20 text-white/40" />
              </div>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{track.title}</h1>
          
          <Link 
            href={`/music/artist/${track.artist_id}`}
            className="text-xl text-purple-400 hover:text-purple-300 transition-colors mb-4 inline-block"
          >
            {track.artist_name}
          </Link>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-white/60 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(track.duration_sec)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              <span>{formatPlayCount(track.play_count)} plays</span>
            </div>
            {track.album && (
              <Link 
                href={`/music/album/${track.album_id}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Disc className="w-4 h-4" />
                <span>{track.album_title}</span>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button
              onClick={handlePlay}
              size="lg"
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8"
            >
              {isCurrentTrack && isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLike}
              className={`w-12 h-12 rounded-full border-white/20 ${liked ? 'text-pink-500 border-pink-500/30' : 'text-white hover:text-pink-500'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleAddToQueue}
              className="w-12 h-12 rounded-full border-white/20 text-white hover:text-purple-400"
            >
              <ListPlus className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="w-12 h-12 rounded-full border-white/20 text-white hover:text-blue-400"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Artist & Album Links */}
          <div className="space-y-4">
            {track.artist && (
              <Link 
                href={`/music/artist/${track.artist_id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 overflow-hidden flex-shrink-0">
                  {track.artist.image_url ? (
                    <img src={track.artist.image_url} alt={track.artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white/60 text-sm">Artist</p>
                  <p className="text-white font-medium">{track.artist_name}</p>
                </div>
              </Link>
            )}

            {track.album && (
              <Link 
                href={`/music/album/${track.album_id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 overflow-hidden flex-shrink-0">
                  {track.album.cover_url ? (
                    <img src={track.album.cover_url} alt={track.album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white/60 text-sm">Album</p>
                  <p className="text-white font-medium">{track.album_title}</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
