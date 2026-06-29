import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/gmb-client'

const GMB_ACCOUNT_ID = process.env.GOOGLE_GMB_ACCOUNT_ID!
const CREATE_URL = `https://mybusinessbusinessinformation.googleapis.com/v1/${GMB_ACCOUNT_ID}/locations`

const VALID_PHOTO_CATEGORIES = ['INTERIOR', 'EXTERIOR', 'OWNER'] as const
type PhotoCategory = typeof VALID_PHOTO_CATEGORIES[number]

async function uploadPhoto(
  locationName: string,
  file: File,
  category: PhotoCategory,
  accessToken: string
): Promise<void> {
  const startUploadUrl = `https://mybusiness.googleapis.com/v4/${GMB_ACCOUNT_ID}/${locationName}/media:startUpload`
  const startRes = await fetch(startUploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!startRes.ok) {
    console.warn(`startUpload failed for ${category}: ${await startRes.text()}`)
    return
  }
  const { resourceName } = await startRes.json()

  const fileBuffer = await file.arrayBuffer()
  const uploadRes = await fetch(
    `https://mybusinessmedia.googleapis.com/upload/v1/media/${resourceName}?upload_type=media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'image/jpeg',
        'Content-Length': String(fileBuffer.byteLength),
      },
      body: fileBuffer,
    }
  )
  if (!uploadRes.ok) {
    console.warn(`bytes upload failed for ${category}: ${await uploadRes.text()}`)
    return
  }

  const mediaRes = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_ACCOUNT_ID}/${locationName}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mediaFormat: 'PHOTO',
      locationAssociation: { category },
      dataRef: { resourceName },
    }),
  })
  if (!mediaRes.ok) {
    console.warn(`media.create failed for ${category}: ${await mediaRes.text()}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Accept multipart/form-data so photos are uploaded in one server-side call,
    // preventing the client from ever supplying a locationName.
    const formData = await req.formData()

    const title = formData.get('title') as string | null
    const phone = formData.get('phone') as string | null
    const addressLine = formData.get('addressLine') as string | null
    const postalCode = formData.get('postalCode') as string | null
    const locality = formData.get('locality') as string | null
    const regionCode = formData.get('regionCode') as string | null
    const websiteUri = formData.get('websiteUri') as string | null
    const description = formData.get('description') as string | null
    const hoursRaw = formData.get('hours') as string | null

    const photoInterior = formData.get('photoInterior') as File | null
    const photoExterior1 = formData.get('photoExterior1') as File | null
    const photoExterior2 = formData.get('photoExterior2') as File | null
    const photoOwner = formData.get('photoOwner') as File | null

    if (!title || !phone || !addressLine || !postalCode || !locality || !regionCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    const locationPayload: Record<string, unknown> = {
      languageCode: 'fr',
      title,
      phoneNumbers: { primaryPhone: phone },
      storefrontAddress: {
        addressLines: [addressLine],
        locality,
        postalCode,
        administrativeArea: '',
        regionCode,
      },
      categories: {
        primaryCategory: { name: 'gcid:art_studio' },
      },
    }

    if (websiteUri) locationPayload.websiteUri = websiteUri
    if (description) locationPayload.profile = { description }
    if (hoursRaw) {
      const hours = JSON.parse(hoursRaw) as Array<{
        openDay: string; closeDay: string; openTime: string; closeTime: string
      }>
      if (hours.length > 0) locationPayload.regularHours = { periods: hours }
    }

    const res = await fetch(CREATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationPayload),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('GMB create-location error:', err)
      return NextResponse.json({ error: 'GMB API error', detail: err }, { status: res.status })
    }

    const location = await res.json()
    const locationName = location.name as string

    // Upload all photos server-side — locationName never touches the client
    const photos: Array<{ file: File | null; category: PhotoCategory }> = [
      { file: photoInterior, category: 'INTERIOR' },
      { file: photoExterior1, category: 'EXTERIOR' },
      { file: photoExterior2, category: 'EXTERIOR' },
      { file: photoOwner, category: 'OWNER' },
    ]
    for (const { file, category } of photos) {
      if (file) await uploadPhoto(locationName, file, category, accessToken)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('create-location exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
