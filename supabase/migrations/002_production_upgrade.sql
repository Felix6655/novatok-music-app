-- Migration: 002_production_upgrade.sql
-- NovaTok Music Production Upgrade
-- Adds: User profiles, Playlists, Track stats, Enhanced RLS

-- ============================================
-- USER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PLAYLISTS
-- ============================================

CREATE TABLE IF NOT EXISTS music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS music_playlist_tracks (
  playlist_id UUID NOT NULL REFERENCES music_playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  position INT DEFAULT 0,
  PRIMARY KEY (playlist_id, track_id)
);

-- Index for playlist tracks ordering
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON music_playlist_tracks(playlist_id, position);

-- ============================================
-- TRACK STATS (for trending)
-- ============================================

CREATE TABLE IF NOT EXISTS music_track_stats (
  track_id UUID PRIMARY KEY,
  play_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add play_count and like_count to music_tracks if not exists
ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS play_count INT DEFAULT 0;
ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

-- Index for trending
CREATE INDEX IF NOT EXISTS idx_music_tracks_play_count ON music_tracks(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_music_tracks_like_count ON music_tracks(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id ON music_tracks(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Increment play count for music_tracks
CREATE OR REPLACE FUNCTION increment_music_track_play_count(p_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE music_tracks SET play_count = COALESCE(play_count, 0) + 1 WHERE id = p_track_id;
  
  INSERT INTO music_track_stats (track_id, play_count, updated_at)
  VALUES (p_track_id, 1, NOW())
  ON CONFLICT (track_id) DO UPDATE
  SET play_count = music_track_stats.play_count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Update like count when likes change
CREATE OR REPLACE FUNCTION update_track_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE music_tracks SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.track_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE music_tracks SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.track_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count updates
DROP TRIGGER IF EXISTS on_music_like_change ON music_likes;
CREATE TRIGGER on_music_like_change
  AFTER INSERT OR DELETE ON music_likes
  FOR EACH ROW EXECUTE FUNCTION update_track_like_count();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_music_track_play_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_music_track_play_count(UUID) TO anon;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Playlists
ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlists are viewable" ON music_playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create playlists" ON music_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON music_playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON music_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist Tracks
ALTER TABLE music_playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlist tracks viewable if playlist viewable" ON music_playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM music_playlists p
      WHERE p.id = playlist_id AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add tracks to own playlists" ON music_playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM music_playlists p
      WHERE p.id = playlist_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tracks from own playlists" ON music_playlist_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM music_playlists p
      WHERE p.id = playlist_id AND p.user_id = auth.uid()
    )
  );

-- Track Stats (public read, system write)
ALTER TABLE music_track_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats are viewable" ON music_track_stats
  FOR SELECT USING (true);

-- ============================================
-- STORAGE BUCKETS POLICIES (run in Dashboard)
-- ============================================
-- 
-- For music-audio bucket:
-- Policy name: "Allow public read"
-- Allowed operation: SELECT
-- Policy: true
--
-- Policy name: "Allow authenticated upload"
-- Allowed operation: INSERT
-- Policy: auth.role() = 'authenticated'
--
-- Policy name: "Allow owner delete"
-- Allowed operation: DELETE  
-- Policy: auth.uid()::text = (storage.foldername(name))[1]
--
-- Same policies for music-covers bucket

-- ============================================
-- SUCCESS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Production upgrade migration complete!';
  RAISE NOTICE 'New tables: user_profiles, music_playlists, music_playlist_tracks, music_track_stats';
  RAISE NOTICE 'New functions: increment_music_track_play_count, update_track_like_count, handle_new_user';
  RAISE NOTICE 'Remember to create storage buckets and policies in Supabase Dashboard';
END $$;
