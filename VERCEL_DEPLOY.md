# Deploying NovaTok Music to Vercel

## Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js - use defaults
5. Click Deploy

## Configuration

### Framework Preset
- **Framework**: Next.js (auto-detected)
- **Build Command**: `yarn build` (default)
- **Install Command**: `yarn install` (default)
- **Output Directory**: `.next` (default)

### Environment Variables (Optional)

The app works in **Guest Mode** with zero environment variables.

To enable Supabase sync, add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Service role key for server operations |

## Guest Mode vs Supabase Mode

### Guest Mode (Default - No Env Vars)
- ✅ App works fully
- ✅ 20 tracks, 6 artists, 6 albums from local seed data
- ✅ Likes and recents saved to browser localStorage
- ✅ Player state persists in localStorage
- ⚠️ Data doesn't sync across devices/browsers

### Supabase Mode (With Env Vars)
- ✅ All Guest Mode features
- ✅ Likes and recents sync to Supabase database
- ✅ User authentication ready (future feature)
- ✅ Data syncs across devices when logged in

## Applying Database Migration

If using Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/0001_novatok_music.sql`
4. Run the SQL to create tables and seed data

## Vercel-Specific Settings

### Recommended
```json
{
  "buildCommand": "yarn build",
  "installCommand": "yarn install",
  "framework": "nextjs"
}
```

### vercel.json (Optional)
No special configuration needed. The app uses standard Next.js output.

## Troubleshooting Vercel Deploys

### Build Fails
- Ensure `yarn.lock` is committed
- Check Node.js version (20.x recommended)
- Build should work with zero env vars

### Audio Not Playing
- External MP3 URLs may have CORS issues
- App gracefully shows "Audio unavailable" toast
- This is expected behavior for demo tracks

### App Shows Loading Forever
- Check browser console for errors
- Ensure Supabase env vars are correct (if using)
- In Guest Mode, ensure localStorage isn't blocked
