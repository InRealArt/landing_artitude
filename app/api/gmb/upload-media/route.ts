import { NextResponse } from 'next/server'

// Photo uploads are handled server-side inside /api/gmb/create-location.
// This endpoint is intentionally disabled to prevent unauthenticated media injection.
export async function POST() {
  return NextResponse.json({ error: 'Use /api/gmb/create-location for photo uploads' }, { status: 405 })
}
