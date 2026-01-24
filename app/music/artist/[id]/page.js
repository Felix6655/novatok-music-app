'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TrackCard from '@/components/TrackCard';
import { usePlayer } from '@/lib/context/PlayerContext';
import { getArtistByIdWithTracks } from '@/lib/data/data-service';
import { Play, ArrowLeft, Loader2, User } from 'lucide-react';

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const { playTrack } = usePlayer();
  
  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      const data = await getArtistByIdWithTracks(params.id);
      setArtist(data);
      setIsLoading(false);
    };
    fetchArtist();
  }, [params.id]);

  const handlePlayAll = () => {
    if (artist?.tracks?.length > 0) {
      playTrack(artist.tracks[0], artist.tracks, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading artist...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Artist not found</h2>
        <p className="text-white/60 mb-4">This artist doesn&apos;t exist.</p>
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

      {/* Artist Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl shadow-purple-500/20">
          {artist.image_url ? (
            <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
              <User className="w-16 h-16 text-white/40" />
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-white/60 text-sm mb-1">Artist</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{artist.name}</h1>
          <p className="text-white/60 mb-4">{artist.tracks?.length || 0} tracks</p>
          <Button
            onClick={handlePlayAll}
            size="lg"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8"
            disabled={!artist.tracks?.length}
          >
            <Play className="w-5 h-5 mr-2" />
            Play All
          </Button>
        </div>
      </div>

      {/* Tracks */}
      {artist.tracks?.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artist.tracks.map((track) => (
              <TrackCard key={track.id} track={track} allTracks={artist.tracks} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/60">No tracks available for this artist.</p>
        </div>
      )}
    </div>
  );
}
