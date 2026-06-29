import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/gmb-client'

const GMB_ACCOUNT_ID = process.env.GOOGLE_GMB_ACCOUNT_ID!

const VALID_CATEGORIES = ['INTERIOR', 'EXTERIOR', 'OWNER'] as const
type MediaCategory = typeof VALID_CATEGORIES[number]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null
    const locationName = formData.get('locationName') as string | null

    if (!file || !category || !locationName) {
      return NextResponse.json({ error: 'Missing file, category, or locationName' }, { status: 400 })
    }

    if (!VALID_CATEGORIES.includes(category as MediaCategory)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    // Step A: startUpload — obtenir un resourceName
    const startUploadUrl = `https://mybusiness.googleapis.com/v4/${GMB_ACCOUNT_ID}/${locationName}/media:startUpload`
    const startRes = await fetch(startUploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })

    if (!startRes.ok) {
      const err = await startRes.text()
      console.error('GMB startUpload error:', err)
      return NextResponse.json({ error: 'startUpload failed', detail: err }, { status: startRes.status })
    }

    const { resourceName } = await startRes.json()

    // Step B: upload bytes
    const fileBuffer = await file.arrayBuffer()
    const uploadUrl = `https://mybusinessmedia.googleapis.com/upload/v1/media/${resourceName}?upload_type=media`
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'image/jpeg',
        'Content-Length': String(fileBuffer.byteLength),
      },
      body: fileBuffer,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      console.error('GMB bytes upload error:', err)
      return NextResponse.json({ error: 'Bytes upload failed', detail: err }, { status: uploadRes.status })
    }

    // Step C: finaliser avec media.create
    const mediaCreateUrl = `https://mybusiness.googleapis.com/v4/${GMB_ACCOUNT_ID}/${locationName}/media`
    const mediaRes = await fetch(mediaCreateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaFormat: 'PHOTO',
        locationAssociation: { category },
        dataRef: { resourceName },
      }),
    })

    if (!mediaRes.ok) {
      const err = await mediaRes.text()
      console.error('GMB media.create error:', err)
      return NextResponse.json({ error: 'media.create failed', detail: err }, { status: mediaRes.status })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('upload-media exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
