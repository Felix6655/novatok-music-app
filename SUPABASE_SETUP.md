# NovaTok Music - Supabase Production Setup

## 1. Required Environment Variables

Add these to your `.env.local` (local) or Vercel/hosting environment:

```bash
# Required for Supabase features
NEXT_PUBLIC_SUPABASE_URL=         # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Your Supabase anon/public key

# Optional but recommended
NEXT_PUBLIC_SITE_URL=             # Your production URL (for SEO/sitemap)
SUPABASE_SERVICE_ROLE_KEY=        # For server-side admin operations (optional)
```

### Where to get these:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Database Setup (SQL Migrations)

Run these SQL files **in order** in Supabase SQL Editor:

### Migration 1: Base Schema
**File:** `/supabase/migrations/001_music.sql`

This creates:
- `artists` table
- `albums` table  
- `tracks` table (legacy)
- `music_tracks` table (main tracks table)
- `music_likes` table
- `music_recent` table
- RLS policies for all tables
- `increment_play_count()` function
- Seed data (demo tracks)

### Migration 2: Production Upgrade
**File:** `/supabase/migrations/002_production_upgrade.sql`

This creates:
- `user_profiles` table (auto-created on signup)
- `music_playlists` table
- `music_playlist_tracks` table
- `music_track_stats` table
- `increment_music_track_play_count()` function
- Trigger for auto-profile creation
- Trigger for like_count updates
- Additional RLS policies

### How to run:
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste contents of `001_music.sql`, click "Run"
4. Create new query, paste `002_production_upgrade.sql`, click "Run"

---

## 3. Storage Buckets Setup

Create these buckets in Supabase Dashboard → Storage:

### Bucket 1: `music-audio`
- **Name:** `music-audio`
- **Public:** Yes (public read)
- **File size limit:** 50MB (recommended)
- **Allowed MIME types:** `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/x-m4a`

### Bucket 2: `music-covers`
- **Name:** `music-covers`
- **Public:** Yes (public read)
- **File size limit:** 5MB (recommended)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

### Storage Policies (for each bucket):

**Policy 1: Public Read**
```sql
-- Policy name: Allow public read
-- Operation: SELECT
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'music-audio');
```

**Policy 2: Authenticated Upload**
```sql
-- Policy name: Allow authenticated upload
-- Operation: INSERT
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'music-audio' 
    AND auth.role() = 'authenticated'
  );
```

**Policy 3: Owner Delete**
```sql
-- Policy name: Allow owner delete
-- Operation: DELETE
CREATE POLICY "Allow owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'music-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

Repeat for `music-covers` bucket.

---

## 4. Testing Procedure

### Step 1: Check Status Page
Visit `/music/status` to verify configuration:
- ✅ `mode: supabase` (not guest)
- ✅ `supabaseConfigured: true`
- ✅ `authEnabled: true`

### Step 2: Test Authentication
1. Go to `/music/login`
2. **Sign Up:** Create a new account
3. Check email for confirmation (if email confirmation enabled)
4. **Sign In:** Log in with credentials
5. Verify redirect to `/music`

### Step 3: Test Upload
1. Go to `/music/upload`
2. Upload an MP3 file
3. Add title and artist name
4. Optionally add cover image
5. Click "Upload Track"
6. Verify redirect to track page

### Step 4: Test My Tracks
1. Go to `/music/my-tracks`
2. Verify uploaded track appears
3. Test delete functionality

### Step 5: Test Playlists
1. Go to `/music/playlists`
2. Create a new playlist
3. Go to any track → Add to playlist
4. Open playlist → Verify track appears
5. Test removing tracks from playlist

### Step 6: Test Play Count & Trending
1. Play any track
2. Refresh `/music/trending`
3. Verify play counts increment
4. Tracks should reorder by popularity

### Step 7: Verify Guest Mode Fallback
1. Remove/comment out Supabase env vars
2. Restart server
3. Visit `/music/status` - should show `mode: guest`
4. All features should work with localStorage
5. Upload/playlists show "Sign in required" messages

---

## 5. Quick Reference

### Pages to Test

| Page | Auth Required | Feature |
|------|--------------|---------|
| `/music` | No | Browse all tracks |
| `/music/login` | No | Sign in/up |
| `/music/account` | Yes | Profile management |
| `/music/upload` | Yes | Upload tracks |
| `/music/my-tracks` | Yes | View uploaded tracks |
| `/music/playlists` | Yes | Manage playlists |
| `/music/playlist/[id]` | View: No, Edit: Yes | Playlist detail |
| `/music/liked` | Partial | Liked tracks |
| `/music/recent` | Partial | Recently played |
| `/music/trending` | No | Popular tracks |
| `/music/status` | No | System status |

### API/Functions

| Function | Description |
|----------|-------------|
| `increment_music_track_play_count(track_id)` | Increments play count |
| `handle_new_user()` | Auto-creates profile on signup |
| `update_track_like_count()` | Updates like counts on like/unlike |

---

## 6. Troubleshooting

### "Supabase not configured"
- Check env vars are set correctly
- Restart Next.js server after adding env vars
- Verify URL doesn't have trailing slash

### "Upload failed"
- Check storage bucket exists and is public
- Verify storage policies allow authenticated uploads
- Check file size limits

### "Profile not found"
- Run migration `002_production_upgrade.sql`
- Check `handle_new_user` trigger exists

### Auth not working
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public key (not secret)
- Check Supabase Auth settings
- For Google OAuth: configure in Supabase Dashboard → Authentication → Providers

---

## 7. Production Deployment (Vercel)

1. Add environment variables in Vercel Dashboard
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain
3. Configure Supabase Auth redirect URLs:
   - Go to Supabase → Authentication → URL Configuration
   - Add your production URL to "Site URL"
   - Add `https://yourdomain.com/music` to "Redirect URLs"
