// Data service abstraction layer - switches between Supabase and local JSON
import { isGuestMode } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';
import { tracks, artists, albums, getTracksWithDetails, getArtistById, getAlbumById } from './seed-data';

// Storage keys for guest mode
const STORAGE_KEYS = {
  LIKES: 'novatok_likes',
  RECENTS: 'novatok_recents',
  PLAYLISTS: 'novatok_playlists',
  PLAY_COUNTS: 'novatok_play_counts',
};

// Helper for localStorage
const getStorage = (key, defaultValue = []) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Get current user ID helper
const getCurrentUserId = async () => {
  if (isGuestMode()) return 'guest';
  const supabase = getSupabaseClient();
  if (!supabase) return 'guest';
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || 'guest';
};

// TRACKS
export const getTracks = async ({ orderBy = 'created_at', limit = 50, search = '' } = {}) => {
  if (isGuestMode()) {
    let result = getTracksWithDetails();
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.artist_name.toLowerCase().includes(searchLower)
      );
    }
    
    const playCounts = getStorage(STORAGE_KEYS.PLAY_COUNTS, {});
    result = result.map(t => ({
      ...t,
      play_count: playCounts[t.id] || t.play_count,
    }));
    
    if (orderBy === 'play_count') {
      result.sort((a, b) => b.play_count - a.play_count);
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return result.slice(0, limit);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  // Try music_tracks first (uploaded tracks), then fallback to tracks table
  let query = supabase
    .from('music_tracks')
    .select('*')
    .order(orderBy, { ascending: false })
    .limit(limit);
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  
  if (error || !data?.length) {
    // Fallback to legacy tracks table
    let legacyQuery = supabase
      .from('tracks')
      .select('*, artists(name), albums(title)')
      .order(orderBy, { ascending: false })
      .limit(limit);
    
    if (search) {
      legacyQuery = legacyQuery.or(`title.ilike.%${search}%`);
    }
    
    const { data: legacyData } = await legacyQuery;
    return (legacyData || []).map(t => ({
      ...t,
      artist_name: t.artists?.name || 'Unknown Artist',
      album_title: t.albums?.title || 'Unknown Album',
    }));
  }
  
  return data.map(t => ({
    ...t,
    artist_name: t.artist || 'Unknown Artist',
    duration_sec: t.duration_seconds || 0,
  }));
};

export const getTrackById = async (id) => {
  if (isGuestMode()) {
    const track = tracks.find(t => t.id === id);
    if (!track) return null;
    const artist = getArtistById(track.artist_id);
    const album = getAlbumById(track.album_id);
    const playCounts = getStorage(STORAGE_KEYS.PLAY_COUNTS, {});
    return {
      ...track,
      play_count: playCounts[track.id] || track.play_count,
      artist_name: artist?.name || 'Unknown Artist',
      album_title: album?.title || 'Unknown Album',
      artist,
      album,
    };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  // Try music_tracks first
  const { data: musicTrack } = await supabase
    .from('music_tracks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (musicTrack) {
    return {
      ...musicTrack,
      artist_name: musicTrack.artist || 'Unknown Artist',
      duration_sec: musicTrack.duration_seconds || 0,
    };
  }
  
  // Fallback to legacy tracks
  const { data } = await supabase
    .from('tracks')
    .select('*, artists(*), albums(*)')
    .eq('id', id)
    .single();
  
  if (!data) return null;
  
  return {
    ...data,
    artist_name: data.artists?.name || 'Unknown Artist',
    album_title: data.albums?.title || 'Unknown Album',
    artist: data.artists,
    album: data.albums,
  };
};

// LIKES
export const getLikedTracks = async (userId) => {
  if (isGuestMode()) {
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    return getTracksWithDetails().filter(t => likes.includes(t.id));
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') return [];
  
  // Try music_likes first
  const { data: musicLikes } = await supabase
    .from('music_likes')
    .select('track_id, music_tracks(*)')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false });
  
  if (musicLikes?.length) {
    return musicLikes.map(l => ({
      ...l.music_tracks,
      artist_name: l.music_tracks?.artist || 'Unknown Artist',
      duration_sec: l.music_tracks?.duration_seconds || 0,
    })).filter(Boolean);
  }
  
  // Fallback to user_likes
  const { data } = await supabase
    .from('user_likes')
    .select('track_id, tracks(*, artists(name), albums(title))')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false });
  
  return (data || []).map(l => ({
    ...l.tracks,
    artist_name: l.tracks?.artists?.name || 'Unknown Artist',
    album_title: l.tracks?.albums?.title || 'Unknown Album',
  })).filter(Boolean);
};

export const isTrackLiked = async (trackId, userId) => {
  if (isGuestMode()) {
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    return likes.includes(trackId);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') return false;
  
  const { data } = await supabase
    .from('music_likes')
    .select('track_id')
    .eq('user_id', currentUserId)
    .eq('track_id', trackId)
    .single();
  
  return !!data;
};

export const toggleLike = async (trackId, userId) => {
  if (isGuestMode()) {
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    const isLiked = likes.includes(trackId);
    
    if (isLiked) {
      setStorage(STORAGE_KEYS.LIKES, likes.filter(id => id !== trackId));
    } else {
      setStorage(STORAGE_KEYS.LIKES, [...likes, trackId]);
    }
    
    return !isLiked;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') return false;
  
  const isLiked = await isTrackLiked(trackId, currentUserId);
  
  if (isLiked) {
    await supabase
      .from('music_likes')
      .delete()
      .eq('user_id', currentUserId)
      .eq('track_id', trackId);
    return false;
  } else {
    await supabase
      .from('music_likes')
      .insert({ user_id: currentUserId, track_id: trackId });
    return true;
  }
};

// RECENTS
export const getRecentTracks = async (userId, limit = 20) => {
  if (isGuestMode()) {
    const recents = getStorage(STORAGE_KEYS.RECENTS, []);
    const recentTrackIds = recents.slice(0, limit);
    const allTracks = getTracksWithDetails();
    return recentTrackIds.map(id => allTracks.find(t => t.id === id)).filter(Boolean);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') return [];
  
  const { data } = await supabase
    .from('music_recent')
    .select('track_id, played_at, music_tracks(*)')
    .eq('user_id', currentUserId)
    .order('played_at', { ascending: false })
    .limit(limit);
  
  return (data || []).map(r => ({
    ...r.music_tracks,
    artist_name: r.music_tracks?.artist || 'Unknown Artist',
    duration_sec: r.music_tracks?.duration_seconds || 0,
    played_at: r.played_at,
  })).filter(Boolean);
};

export const addToRecent = async (trackId, userId) => {
  if (isGuestMode()) {
    const recents = getStorage(STORAGE_KEYS.RECENTS, []);
    const filtered = recents.filter(id => id !== trackId);
    setStorage(STORAGE_KEYS.RECENTS, [trackId, ...filtered].slice(0, 50));
    return true;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') return false;
  
  await supabase
    .from('music_recent')
    .upsert({ user_id: currentUserId, track_id: trackId, played_at: new Date().toISOString() });
  
  return true;
};

// PLAY COUNT
export const incrementPlayCount = async (trackId) => {
  if (isGuestMode()) {
    const playCounts = getStorage(STORAGE_KEYS.PLAY_COUNTS, {});
    const track = tracks.find(t => t.id === trackId);
    const baseCount = track?.play_count || 0;
    const currentCount = playCounts[trackId] || baseCount;
    playCounts[trackId] = currentCount + 1;
    setStorage(STORAGE_KEYS.PLAY_COUNTS, playCounts);
    return true;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  // Try the new function first
  const { error } = await supabase.rpc('increment_music_track_play_count', { p_track_id: trackId });
  
  if (error) {
    // Fallback to legacy function
    await supabase.rpc('increment_play_count', { track_id: trackId });
  }
  
  return true;
};

// TRENDING
export const getTrendingTracks = async (limit = 20) => {
  if (isGuestMode()) {
    const allTracks = getTracksWithDetails();
    const playCounts = getStorage(STORAGE_KEYS.PLAY_COUNTS, {});
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    
    const withScores = allTracks.map(t => {
      const playCount = playCounts[t.id] || t.play_count;
      const isLiked = likes.includes(t.id) ? 1000 : 0;
      return {
        ...t,
        play_count: playCount,
        trending_score: playCount + isLiked,
      };
    });
    
    return withScores
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, limit);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  // Get tracks ordered by play_count + like_count
  const { data } = await supabase
    .from('music_tracks')
    .select('*')
    .order('play_count', { ascending: false })
    .limit(limit);
  
  if (data?.length) {
    return data.map(t => ({
      ...t,
      artist_name: t.artist || 'Unknown Artist',
      duration_sec: t.duration_seconds || 0,
      trending_score: (t.play_count || 0) + (t.like_count || 0) * 10,
    })).sort((a, b) => b.trending_score - a.trending_score);
  }
  
  return getTracks({ orderBy: 'play_count', limit });
};

// ARTISTS
export const getArtists = async () => {
  if (isGuestMode()) return artists;
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data } = await supabase.from('artists').select('*').order('name');
  return data || [];
};

export const getArtistByIdWithTracks = async (id) => {
  if (isGuestMode()) {
    const artist = getArtistById(id);
    if (!artist) return null;
    const artistTracks = getTracksWithDetails().filter(t => t.artist_id === id);
    const artistAlbums = albums.filter(a => a.artist_id === id);
    return { ...artist, tracks: artistTracks, albums: artistAlbums };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  const { data } = await supabase
    .from('artists')
    .select('*, tracks(*), albums(*)')
    .eq('id', id)
    .single();
  
  return data;
};

// ALBUMS
export const getAlbumByIdWithTracks = async (id) => {
  if (isGuestMode()) {
    const album = getAlbumById(id);
    if (!album) return null;
    const artist = getArtistById(album.artist_id);
    const albumTracks = getTracksWithDetails().filter(t => t.album_id === id);
    return { ...album, artist, tracks: albumTracks };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  const { data } = await supabase
    .from('albums')
    .select('*, artists(*), tracks(*)')
    .eq('id', id)
    .single();
  
  return data ? { ...data, artist: data.artists } : null;
};

// SEARCH
export const searchAll = async (query) => {
  if (!query) return { tracks: [], artists: [], albums: [] };
  
  const searchLower = query.toLowerCase();
  
  if (isGuestMode()) {
    return {
      tracks: getTracksWithDetails().filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.artist_name.toLowerCase().includes(searchLower)
      ).slice(0, 10),
      artists: artists.filter(a => a.name.toLowerCase().includes(searchLower)).slice(0, 5),
      albums: albums.filter(a => a.title.toLowerCase().includes(searchLower)).slice(0, 5),
    };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return { tracks: [], artists: [], albums: [] };
  
  const [tracksResult, artistsResult, albumsResult] = await Promise.all([
    supabase.from('music_tracks').select('*').or(`title.ilike.%${query}%,artist.ilike.%${query}%`).limit(10),
    supabase.from('artists').select('*').ilike('name', `%${query}%`).limit(5),
    supabase.from('albums').select('*').ilike('title', `%${query}%`).limit(5),
  ]);
  
  return {
    tracks: (tracksResult.data || []).map(t => ({ ...t, artist_name: t.artist, duration_sec: t.duration_seconds })),
    artists: artistsResult.data || [],
    albums: albumsResult.data || [],
  };
};

// UPLOAD
export const uploadTrack = async ({ title, artist, audioFile, coverFile, userId }) => {
  if (isGuestMode()) {
    throw new Error('Upload requires Supabase connection');
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase not configured');
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') throw new Error('Please sign in to upload');
  
  // Upload audio file
  const audioFileName = `${currentUserId}/${Date.now()}-${audioFile.name}`;
  const { error: audioError } = await supabase.storage
    .from('music-audio')
    .upload(audioFileName, audioFile);
  
  if (audioError) throw new Error(`Audio upload failed: ${audioError.message}`);
  
  const { data: audioUrlData } = supabase.storage
    .from('music-audio')
    .getPublicUrl(audioFileName);
  
  let coverUrl = null;
  
  if (coverFile) {
    const coverFileName = `${currentUserId}/${Date.now()}-${coverFile.name}`;
    const { error: coverError } = await supabase.storage
      .from('music-covers')
      .upload(coverFileName, coverFile);
    
    if (!coverError) {
      const { data: coverUrlData } = supabase.storage
        .from('music-covers')
        .getPublicUrl(coverFileName);
      coverUrl = coverUrlData.publicUrl;
    }
  }
  
  // Insert track into music_tracks
  const { data: track, error: trackError } = await supabase
    .from('music_tracks')
    .insert({
      user_id: currentUserId,
      title,
      artist,
      audio_url: audioUrlData.publicUrl,
      cover_url: coverUrl,
      duration_seconds: 0,
    })
    .select()
    .single();
  
  if (trackError) throw new Error(`Failed to save track: ${trackError.message}`);
  
  // Trigger marketing automation webhook (fire and forget)
  triggerUploadWebhook(track).catch(err => {
    console.warn('Marketing webhook failed (non-blocking):', err.message);
  });
  
  return track;
};

// Marketing automation webhook
const triggerUploadWebhook = async (track) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    // Silently skip if webhook not configured
    return;
  }
  
  const payload = {
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    publicUrl: track.audio_url,
    coverUrl: track.cover_url,
    createdAt: track.created_at,
  };
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}`);
  }
  
  return response;
};

// PLAYLISTS
export const getPlaylists = async (userId) => {
  if (isGuestMode()) {
    return getStorage(STORAGE_KEYS.PLAYLISTS, []);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const currentUserId = userId || await getCurrentUserId();
  if (currentUserId === 'guest') return [];
  
  const { data } = await supabase
    .from('music_playlists')
    .select('*')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false });
  
  return data || [];
};

export const addTrackToPlaylist = async (playlistId, trackId) => {
  if (isGuestMode()) {
    // Guest mode playlist support
    const playlists = getStorage(STORAGE_KEYS.PLAYLISTS, []);
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      if (!playlist.tracks) playlist.tracks = [];
      if (!playlist.tracks.includes(trackId)) {
        playlist.tracks.push(trackId);
        setStorage(STORAGE_KEYS.PLAYLISTS, playlists);
      }
    }
    return true;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('music_playlist_tracks')
    .insert({ playlist_id: playlistId, track_id: trackId });
  
  return !error;
};
