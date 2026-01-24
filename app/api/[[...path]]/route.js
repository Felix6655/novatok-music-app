import { NextResponse } from 'next/server';

// Simple API route handler
// Most data operations are handled client-side with Supabase or localStorage
// This can be extended for server-side operations if needed

export async function GET(request) {
  return NextResponse.json({ 
    status: 'ok', 
    app: 'NovaTok Music',
    version: '1.0.0',
    mode: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'supabase' : 'guest'
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ received: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
