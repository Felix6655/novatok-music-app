import { NextResponse } from 'next/server';

// Known NovaTok MusicGen worker (Hugging Face Space).
// Can be overridden via env if the worker moves.
const DEFAULT_WORKER_URL = 'https://fico2938-novatok-musicgen-worker.hf.space';
const WORKER_URL = (process.env.MUSICGEN_WORKER_URL || process.env.NEXT_PUBLIC_MUSICGEN_WORKER_URL || DEFAULT_WORKER_URL).replace(/\/$/, '');
const WORKER_TIMEOUT_MS = 45000;

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const resolveAudioUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('data:audio')) return value;
  return `${WORKER_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

// Extract an audio URL/base64 from whatever shape the worker responds with.
const extractAudioUrl = (payload) => {
  if (!payload) return null;
  const candidates = [
    payload.audio_url,
    payload.url,
    payload.output,
    payload.audio,
    Array.isArray(payload.data) ? payload.data[0] : null,
    Array.isArray(payload.data) && payload.data[0]?.name ? payload.data[0].name : null,
    Array.isArray(payload.data) && payload.data[0]?.url ? payload.data[0].url : null,
  ];
  for (const candidate of candidates) {
    const resolved = resolveAudioUrl(candidate);
    if (resolved) return resolved;
  }
  return null;
};

const callWorker = async (fullPrompt, duration) => {
  // Try the simple REST contract first.
  try {
    const res = await fetchWithTimeout(`${WORKER_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt, duration }),
    }, WORKER_TIMEOUT_MS);

    if (res.ok) {
      const data = await res.json();
      const audioUrl = extractAudioUrl(data);
      if (audioUrl) return audioUrl;
    }
  } catch {
    // fall through to Gradio-style contract
  }

  // Fall back to a Gradio-style predict contract.
  try {
    const res = await fetchWithTimeout(`${WORKER_URL}/run/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [fullPrompt, duration] }),
    }, WORKER_TIMEOUT_MS);

    if (res.ok) {
      const data = await res.json();
      const audioUrl = extractAudioUrl(data);
      if (audioUrl) return audioUrl;
    }
  } catch {
    // worker is unreachable or returned something we can't parse
  }

  return null;
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { prompt, mood, genre, duration } = body || {};

  if (!prompt || !prompt.trim()) {
    return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
  }

  const fullPrompt = [prompt.trim(), mood, genre].filter(Boolean).join(', ');

  try {
    const audioUrl = await callWorker(fullPrompt, duration || 15);

    if (audioUrl) {
      return NextResponse.json({
        success: true,
        demo: false,
        track: {
          audio_url: audioUrl,
          prompt: fullPrompt,
          mood: mood || null,
          genre: genre || null,
          duration_sec: duration || 15,
        },
      });
    }
  } catch (error) {
    console.error('MusicGen worker error:', error);
  }

  // Worker is down, sleeping, or returned an unexpected shape — don't show a dead error page.
  return NextResponse.json({
    success: false,
    demo: true,
    message: 'AI generation is in demo mode right now',
    prompt: fullPrompt,
  });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', worker: WORKER_URL });
}
