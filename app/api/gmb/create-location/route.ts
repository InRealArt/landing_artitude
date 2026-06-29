import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/gmb-client'

const GMB_ACCOUNT_ID = process.env.GOOGLE_GMB_ACCOUNT_ID!
const CREATE_URL = `https://mybusinessbusinessinformation.googleapis.com/v1/${GMB_ACCOUNT_ID}/locations`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      phone,
      addressLine,
      postalCode,
      locality,
      regionCode,
      websiteUri,
      description,
      hours,
    } = body as {
      title: string
      phone: string
      addressLine: string
      postalCode: string
      locality: string
      regionCode: string
      websiteUri?: string
      description?: string
      hours?: Array<{
        openDay: string
        closeDay: string
        openTime: string
        closeTime: string
      }>
    }

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
    if (hours && hours.length > 0) {
      locationPayload.regularHours = { periods: hours }
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
    return NextResponse.json({ locationName: location.name })
  } catch (e) {
    console.error('create-location exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
