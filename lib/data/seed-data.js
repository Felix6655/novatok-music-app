// Seed data for NovaTok Music - used in Guest Mode
import { v4 as uuidv4 } from 'uuid';

// Fixed UUIDs for consistent references
const artistIds = {
  huntrx: 'a1000000-0000-0000-0000-000000000001',
  djo: 'a1000000-0000-0000-0000-000000000002',
  sombr: 'a1000000-0000-0000-0000-000000000003',
  kehlani: 'a1000000-0000-0000-0000-000000000004',
  sabrina: 'a1000000-0000-0000-0000-000000000005',
  leon: 'a1000000-0000-0000-0000-000000000006',
};

const albumIds = {
  kpopDemon: 'b1000000-0000-0000-0000-000000000001',
  decide: 'b1000000-0000-0000-0000-000000000002',
  midnight: 'b1000000-0000-0000-0000-000000000003',
  blueMoon: 'b1000000-0000-0000-0000-000000000004',
  emails: 'b1000000-0000-0000-0000-000000000005',
  genesis: 'b1000000-0000-0000-0000-000000000006',
};

// Sample MP3 URLs - mix of working samples and placeholders
const sampleAudioUrls = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  null, // Some tracks have no audio
  null,
];

// Cover image placeholders with gradients
const coverImages = [
  'https://picsum.photos/seed/golden/400/400',
  'https://picsum.photos/seed/endofbegin/400/400',
  'https://picsum.photos/seed/friends/400/400',
  'https://picsum.photos/seed/folded/400/400',
  'https://picsum.photos/seed/manchild/400/400',
  'https://picsum.photos/seed/mutt/400/400',
  'https://picsum.photos/seed/ordinary/400/400',
  'https://picsum.photos/seed/manneed/400/400',
  'https://picsum.photos/seed/starlight/400/400',
  'https://picsum.photos/seed/electric/400/400',
  'https://picsum.photos/seed/dreams/400/400',
  'https://picsum.photos/seed/neon/400/400',
  'https://picsum.photos/seed/cosmic/400/400',
  'https://picsum.photos/seed/waves/400/400',
  'https://picsum.photos/seed/aurora/400/400',
  'https://picsum.photos/seed/pulse/400/400',
  'https://picsum.photos/seed/echo/400/400',
  'https://picsum.photos/seed/drift/400/400',
  'https://picsum.photos/seed/spark/400/400',
  'https://picsum.photos/seed/bloom/400/400',
];

export const artists = [
  { id: artistIds.huntrx, name: 'HUNTR/X', image_url: 'https://picsum.photos/seed/huntrx/200/200', created_at: '2024-01-01T00:00:00Z' },
  { id: artistIds.djo, name: 'Djo', image_url: 'https://picsum.photos/seed/djo/200/200', created_at: '2024-01-02T00:00:00Z' },
  { id: artistIds.sombr, name: 'sombr', image_url: 'https://picsum.photos/seed/sombr/200/200', created_at: '2024-01-03T00:00:00Z' },
  { id: artistIds.kehlani, name: 'Kehlani', image_url: 'https://picsum.photos/seed/kehlani/200/200', created_at: '2024-01-04T00:00:00Z' },
  { id: artistIds.sabrina, name: 'Sabrina Carpenter', image_url: 'https://picsum.photos/seed/sabrina/200/200', created_at: '2024-01-05T00:00:00Z' },
  { id: artistIds.leon, name: 'Leon Thomas', image_url: 'https://picsum.photos/seed/leon/200/200', created_at: '2024-01-06T00:00:00Z' },
];

export const albums = [
  { id: albumIds.kpopDemon, title: 'K-Pop Demon Hunters', artist_id: artistIds.huntrx, cover_url: 'https://picsum.photos/seed/kpopdemon/400/400', created_at: '2024-02-01T00:00:00Z' },
  { id: albumIds.decide, title: 'DECIDE', artist_id: artistIds.djo, cover_url: 'https://picsum.photos/seed/decide/400/400', created_at: '2024-02-02T00:00:00Z' },
  { id: albumIds.midnight, title: 'Midnight Thoughts', artist_id: artistIds.sombr, cover_url: 'https://picsum.photos/seed/midnightthoughts/400/400', created_at: '2024-02-03T00:00:00Z' },
  { id: albumIds.blueMoon, title: 'Blue Moon', artist_id: artistIds.kehlani, cover_url: 'https://picsum.photos/seed/bluemoon/400/400', created_at: '2024-02-04T00:00:00Z' },
  { id: albumIds.emails, title: 'emails i cant send', artist_id: artistIds.sabrina, cover_url: 'https://picsum.photos/seed/emails/400/400', created_at: '2024-02-05T00:00:00Z' },
  { id: albumIds.genesis, title: 'Genesis', artist_id: artistIds.leon, cover_url: 'https://picsum.photos/seed/genesis/400/400', created_at: '2024-02-06T00:00:00Z' },
];

export const tracks = [
  { id: 't1000000-0000-0000-0000-000000000001', title: 'Golden', artist_id: artistIds.huntrx, album_id: albumIds.kpopDemon, duration_sec: 192, cover_url: coverImages[0], audio_url: sampleAudioUrls[0], play_count: 15420, created_at: '2024-03-01T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000002', title: 'End of Beginning', artist_id: artistIds.djo, album_id: albumIds.decide, duration_sec: 159, cover_url: coverImages[1], audio_url: sampleAudioUrls[1], play_count: 98234, created_at: '2024-03-02T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000003', title: 'back to friends', artist_id: artistIds.sombr, album_id: albumIds.midnight, duration_sec: 199, cover_url: coverImages[2], audio_url: sampleAudioUrls[2], play_count: 45123, created_at: '2024-03-03T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000004', title: 'Folded', artist_id: artistIds.kehlani, album_id: albumIds.blueMoon, duration_sec: 238, cover_url: coverImages[3], audio_url: sampleAudioUrls[3], play_count: 67890, created_at: '2024-03-04T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000005', title: 'Manchild', artist_id: artistIds.sabrina, album_id: albumIds.emails, duration_sec: 213, cover_url: coverImages[4], audio_url: sampleAudioUrls[4], play_count: 34567, created_at: '2024-03-05T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000006', title: 'MUTT', artist_id: artistIds.leon, album_id: albumIds.genesis, duration_sec: 193, cover_url: coverImages[5], audio_url: sampleAudioUrls[5], play_count: 23456, created_at: '2024-03-06T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000007', title: 'Ordinary', artist_id: artistIds.djo, album_id: albumIds.decide, duration_sec: 186, cover_url: coverImages[6], audio_url: sampleAudioUrls[6], play_count: 78901, created_at: '2024-03-07T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000008', title: 'Man I Need', artist_id: artistIds.kehlani, album_id: albumIds.blueMoon, duration_sec: 184, cover_url: coverImages[7], audio_url: sampleAudioUrls[7], play_count: 56789, created_at: '2024-03-08T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000009', title: 'Starlight', artist_id: artistIds.huntrx, album_id: albumIds.kpopDemon, duration_sec: 224, cover_url: coverImages[8], audio_url: sampleAudioUrls[0], play_count: 12345, created_at: '2024-03-09T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000010', title: 'Electric Dreams', artist_id: artistIds.sombr, album_id: albumIds.midnight, duration_sec: 201, cover_url: coverImages[9], audio_url: sampleAudioUrls[1], play_count: 89012, created_at: '2024-03-10T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000011', title: 'Neon Nights', artist_id: artistIds.sabrina, album_id: albumIds.emails, duration_sec: 178, cover_url: coverImages[10], audio_url: sampleAudioUrls[2], play_count: 43210, created_at: '2024-03-11T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000012', title: 'Cosmic Dance', artist_id: artistIds.leon, album_id: albumIds.genesis, duration_sec: 245, cover_url: coverImages[11], audio_url: sampleAudioUrls[3], play_count: 65432, created_at: '2024-03-12T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000013', title: 'Waves', artist_id: artistIds.djo, album_id: albumIds.decide, duration_sec: 167, cover_url: coverImages[12], audio_url: sampleAudioUrls[4], play_count: 21098, created_at: '2024-03-13T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000014', title: 'Aurora', artist_id: artistIds.kehlani, album_id: albumIds.blueMoon, duration_sec: 234, cover_url: coverImages[13], audio_url: sampleAudioUrls[5], play_count: 87654, created_at: '2024-03-14T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000015', title: 'Pulse', artist_id: artistIds.huntrx, album_id: albumIds.kpopDemon, duration_sec: 189, cover_url: coverImages[14], audio_url: sampleAudioUrls[6], play_count: 32109, created_at: '2024-03-15T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000016', title: 'Echo', artist_id: artistIds.sombr, album_id: albumIds.midnight, duration_sec: 212, cover_url: coverImages[15], audio_url: sampleAudioUrls[7], play_count: 54321, created_at: '2024-03-16T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000017', title: 'Drift Away', artist_id: artistIds.sabrina, album_id: albumIds.emails, duration_sec: 198, cover_url: coverImages[16], audio_url: null, play_count: 76543, created_at: '2024-03-17T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000018', title: 'Spark', artist_id: artistIds.leon, album_id: albumIds.genesis, duration_sec: 176, cover_url: coverImages[17], audio_url: null, play_count: 98765, created_at: '2024-03-18T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000019', title: 'Bloom', artist_id: artistIds.djo, album_id: albumIds.decide, duration_sec: 221, cover_url: coverImages[18], audio_url: sampleAudioUrls[0], play_count: 10987, created_at: '2024-03-19T00:00:00Z' },
  { id: 't1000000-0000-0000-0000-000000000020', title: 'Twilight Zone', artist_id: artistIds.kehlani, album_id: albumIds.blueMoon, duration_sec: 203, cover_url: coverImages[19], audio_url: sampleAudioUrls[1], play_count: 43218, created_at: '2024-03-20T00:00:00Z' },
];

// Helper to get artist by ID
export const getArtistById = (id) => artists.find(a => a.id === id);

// Helper to get album by ID
export const getAlbumById = (id) => albums.find(a => a.id === id);

// Helper to get track with artist and album info
export const getTrackWithDetails = (track) => {
  const artist = getArtistById(track.artist_id);
  const album = getAlbumById(track.album_id);
  return {
    ...track,
    artist_name: artist?.name || 'Unknown Artist',
    album_title: album?.title || 'Unknown Album',
  };
};

// Get all tracks with details
export const getTracksWithDetails = () => tracks.map(getTrackWithDetails);
