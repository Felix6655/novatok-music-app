# NovaTok Music - Go Live Checklist

## Pre-Launch Verification

Use this checklist to ensure NovaTok Music is production-ready.

### 1. Environment Configuration

- [ ] `.env` file exists with all required variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set (for production mode)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set (for production mode)
- [ ] `NEXT_PUBLIC_SITE_URL` is set for sharing/SEO
- [ ] Guest mode fallback works when Supabase not configured

### 2. Supabase Setup (Production Mode)

- [ ] Supabase project created at [supabase.com](https://supabase.com)
- [ ] SQL migration applied: `supabase/migrations/001_music.sql`
- [ ] Storage buckets created:
  - [ ] `music-audio` (for uploaded tracks)
  - [ ] `music-covers` (for album art)
- [ ] Storage policies configured for public read access
- [ ] RLS policies verified for user_likes, user_recent tables

### 3. Core Features Test

#### Global Player
- [ ] Play a track → audio plays
- [ ] Navigate between tabs → audio continues playing
- [ ] Refresh page → player restores current track and position
- [ ] Play/Pause, Next, Previous controls work
- [ ] Seek bar updates and allows seeking
- [ ] Volume slider works
- [ ] Mute toggle works
- [ ] Expanded player opens/closes
- [ ] Queue panel shows current queue
- [ ] Add to queue works from track cards
- [ ] Shuffle and repeat modes work

#### Discover Page
- [ ] Track grid loads correctly
- [ ] Track cards show cover, title, artist, duration
- [ ] Play button on hover works
- [ ] Like button toggles like state
- [ ] Menu dropdown works (Add to queue, Go to artist, Go to album)

#### Trending Page
- [ ] Shows tracks sorted by play count
- [ ] Rank badges display correctly

#### Liked Page
- [ ] Shows empty state when no likes
- [ ] Shows liked tracks when likes exist
- [ ] Liking a track adds it to this page
- [ ] Unliking removes it

#### Recent Page
- [ ] Shows empty state when no history
- [ ] Playing a track adds it to recent
- [ ] Order reflects most recent first

#### Track Detail Page
- [ ] Opens when clicking track card
- [ ] Shows full track info
- [ ] Play, Like, Add to Queue, Share buttons work
- [ ] Artist and Album links work

#### Search
- [ ] Search dropdown appears when typing
- [ ] Shows tracks, artists, albums
- [ ] Clicking result navigates correctly

#### Upload (Production Only)
- [ ] Shows "Requires Supabase" in Guest Mode
- [ ] Upload form validates required fields
- [ ] Audio file upload works
- [ ] Cover image upload works (optional)
- [ ] Progress indicator shows during upload
- [ ] Redirects to track page after success

### 4. Data Persistence

- [ ] Likes persist after refresh (localStorage in Guest Mode)
- [ ] Recent plays persist after refresh
- [ ] Player state restores after refresh
- [ ] Queue restores after refresh
- [ ] Volume setting persists

### 5. Mobile Experience

- [ ] Mini player fits on mobile screens
- [ ] Touch controls work (play/pause, seek)
- [ ] Expanded player scrolls properly
- [ ] Tab navigation scrolls horizontally

### 6. Error Handling

- [ ] Missing audio URL shows appropriate error
- [ ] Network errors handled gracefully
- [ ] Invalid routes show 404
- [ ] Upload errors show helpful messages

### 7. Demo Mode Verification

- [ ] Guest Mode banner shows when Supabase not configured
- [ ] All 20 demo tracks have working audio
- [ ] Demo cover images load
- [ ] Search works with demo data

### 8. Final Steps

- [ ] Build passes: `yarn build`
- [ ] No console errors in production
- [ ] Responsive design works at all breakpoints
- [ ] Dark theme renders correctly

---

## Quick Setup Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Run production build
yarn start
```

## Environment Variables

```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_REQUIRE_SUPABASE=false
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Supabase dashboard for API/storage issues
4. Review `/music/settings` page for connection status
