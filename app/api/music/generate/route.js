import { NextResponse } from 'next/server';

// Generation + queue wait on the worker can take well over a minute.
export const maxDuration = 280;

// Known NovaTok MusicGen worker (Hugging Face Space, Gradio 4.0.0).
// Can be overridden via env if the worker moves.
const DEFAULT_WORKER_URL = 'https://fico2938-novatok-musicgen-worker.hf.space';
const WORKER_URL = (process.env.MUSICGEN_WORKER_URL || process.env.NEXT_PUBLIC_MUSICGEN_WORKER_URL || DEFAULT_WORKER_URL).replace(/\/$/, '');
const WORKER_TIMEOUT_MS = 180000;

// The Space's "Duration (seconds)" slider only accepts 5-30 in steps of 5.
const clampDuration = (duration) => {
  const n = Number(duration) || 15;
  const stepped = Math.round(n / 5) * 5;
  return Math.min(30, Math.max(5, stepped));
};

// Calls the worker's Gradio queue API directly (POST /run or /call/* aren't
// supported by this Space's Gradio version - it requires joining the SSE
// queue at /queue/join, then posting the job to /queue/data, then reading
// the result off the same SSE stream). Verified against the live worker.
const callWorker = async (fullPrompt, duration) => {
  const sessionHash = `novatok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);

  try {
    const joinRes = await fetch(
      `${WORKER_URL}/queue/join?fn_index=0&session_hash=${sessionHash}`,
      { headers: { Accept: 'text/event-stream' }, signal: controller.signal }
    );

    if (!joinRes.ok || !joinRes.body) return null;

    const reader = joinRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let posted = false;
    let result = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop();

      for (const part of parts) {
        const line = part.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;

        let event;
        try {
          event = JSON.parse(line.slice(5).trim());
        } catch {
          continue;
        }

        if (event.msg === 'send_data' && !posted) {
          posted = true;
          await fetch(`${WORKER_URL}/queue/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [fullPrompt, duration],
              event_id: event.event_id,
              fn_index: 0,
              session_hash: sessionHash,
            }),
            signal: controller.signal,
          });
        }

        if (event.msg === 'process_completed') {
          const fileData = event.output?.data?.[0];
          if (fileData && event.success !== false) {
            result = fileData.url || (fileData.path ? `${WORKER_URL}/file=${fileData.path}` : null);
          }
          return result;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('MusicGen worker call failed:', error.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
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
  const clampedDuration = clampDuration(duration);

  try {
    const audioUrl = await callWorker(fullPrompt, clampedDuration);

    if (audioUrl) {
      return NextResponse.json({
        success: true,
        demo: false,
        track: {
          audio_url: audioUrl,
          prompt: fullPrompt,
          mood: mood || null,
          genre: genre || null,
          duration_sec: clampedDuration,
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
