'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TrackCard from '@/components/TrackCard';
import { usePlayer } from '@/lib/context/PlayerContext';
import {
  getTracks,
  getTrendingTracks,
  getRecentTracks,
  getCreatorPlaylists,
  getTrendingInReels,
  getFriendsActivity,
  getRecommendedTracks,
} from '@/lib/data/data-service';
import { Loader2, Sparkles, Flame, ListMusic, Film, Users, Wand2, Clock, Play, Music2 } from 'lucide-react';

function Section({ icon: Icon, title, subtitle, accent = 'from-purple-500 to-pink-500', children, action }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
            {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ScrollRow({ children }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {children}
    </div>
  );
}

function MiniTrackCard({ track, allTracks }) {
  const { currentTrack, isPlaying, playTrack, pause } = usePlayer();
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrentTrack && isPlaying) {
      pause();
    } else {
      const queue = allTracks || [track];
      playTrack(track, queue, queue.findIndex(t => t.id === track.id) || 0);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className="group relative w-36 flex-shrink-0 bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-colors cursor-pointer border border-white/5 hover:border-purple-500/30"
    >
      <div className="relative aspect-square">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-white/40" />
          </div>
        )}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-2">
        <p className="text-white text-sm font-medium truncate">{track.title}</p>
        <p className="text-white/50 text-xs truncate">{track.artist_name}</p>
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }) {
  const { playTrack } = usePlayer();
  return (
    <div
      onClick={() => playlist.tracks?.[0] && playTrack(playlist.tracks[0], playlist.tracks, 0)}
      className="group w-40 flex-shrink-0 bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-colors cursor-pointer border border-white/5 hover:border-purple-500/30"
    >
      <div className="relative aspect-square">
        {playlist.cover_url ? (
          <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <ListMusic className="w-8 h-8 text-white/40" />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
        <p className="text-white/50 text-xs truncate">{playlist.track_count} tracks</p>
      </div>
    </div>
  );
}

function FriendActivityCard({ activity }) {
  const { playTrack } = usePlayer();
  return (
    <div
      onClick={() => playTrack(activity.track, [activity.track], 0)}
      className="w-56 flex-shrink-0 bg-white/5 hover:bg-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors border border-white/5 hover:border-purple-500/30"
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {activity.friend_name[0]}
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm truncate">
          <span className="font-medium">{activity.friend_name}</span> is listening to
        </p>
        <p className="text-white/60 text-xs truncate">{activity.track.title}</p>
      </div>
    </div>
  );
}

export default function MusicContent() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [reelsTrending, setReelsTrending] = useState([]);
  const [friendsActivity, setFriendsActivity] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const data = await getTracks({ orderBy: 'created_at', limit: 20 });
        setTracks(data);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  useEffect(() => {
    getTrendingTracks(10).then(setTrending).catch(() => setTrending([]));
    getRecentTracks(undefined, 10).then(setRecent).catch(() => setRecent([]));
    getRecommendedTracks(10).then(setRecommended).catch(() => setRecommended([]));
    getCreatorPlaylists().then(setPlaylists).catch(() => setPlaylists([]));
    getTrendingInReels(8).then(setReelsTrending).catch(() => setReelsTrending([]));
    getFriendsActivity(6).then(setFriendsActivity).catch(() => setFriendsActivity([]));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
          <span className="text-4xl">🎵</span>
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">No tracks found</h2>
        <p className="text-white/60 text-center max-w-md">
          Check back later for new releases
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Discover New Music</h1>
        </div>
        <p className="text-white/60">Explore the latest releases</p>
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} allTracks={tracks} />
        ))}
      </div>

      {/* Create with AI promo */}
      <Link
        href="/music/ai-studio"
        className="block mb-10 p-5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Create Music with AI</h3>
            <p className="text-white/60 text-sm">Describe a vibe and generate an original track in seconds</p>
          </div>
        </div>
      </Link>

      {trending.length > 0 && (
        <Section icon={Flame} title="Trending Right Now" subtitle="Most played this week" accent="from-orange-500 to-red-500">
          <ScrollRow>
            {trending.map(t => <MiniTrackCard key={t.id} track={t} allTracks={trending} />)}
          </ScrollRow>
        </Section>
      )}

      {playlists.length > 0 && (
        <Section icon={ListMusic} title="Creator Playlists" subtitle="Curated by your favorite artists">
          <ScrollRow>
            {playlists.map(p => <PlaylistCard key={p.id} playlist={p} />)}
          </ScrollRow>
        </Section>
      )}

      {reelsTrending.length > 0 && (
        <Section icon={Film} title="Songs Trending in Reels" subtitle="What creators are using right now" accent="from-pink-500 to-rose-500">
          <ScrollRow>
            {reelsTrending.map(t => <MiniTrackCard key={t.id} track={t} allTracks={reelsTrending} />)}
          </ScrollRow>
        </Section>
      )}

      {friendsActivity.length > 0 && (
        <Section icon={Users} title="Friends Activity" subtitle="See what people are playing" accent="from-blue-500 to-cyan-500">
          <ScrollRow>
            {friendsActivity.map(a => <FriendActivityCard key={a.id} activity={a} />)}
          </ScrollRow>
        </Section>
      )}

      {recommended.length > 0 && (
        <Section icon={Sparkles} title="Recommended For You" subtitle="Based on what's popular">
          <ScrollRow>
            {recommended.map(t => <MiniTrackCard key={t.id} track={t} allTracks={recommended} />)}
          </ScrollRow>
        </Section>
      )}

      {recent.length > 0 && (
        <Section icon={Clock} title="Recently Played" accent="from-green-500 to-emerald-500">
          <ScrollRow>
            {recent.map(t => <MiniTrackCard key={t.id} track={t} allTracks={recent} />)}
          </ScrollRow>
        </Section>
      )}
    </div>
  );
}
