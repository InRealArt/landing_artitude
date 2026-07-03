import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/gmb-client'
import { getDictionary, hasLocale } from '@/lib/dictionaries'
import type { GmbLocation } from '@/types/gmb'

export type { GmbLocation }

const FALLBACK_BASE = [
  {
    id: 'florence-autelin',
    address: '18 Rue Lafaurie de Monbadon, 33000 Bordeaux',
    city: 'Bordeaux',
    lat: 44.8414,
    lng: -0.5736,
    imageUrl: '/images/ateliers/atelier_florence_autelin.webp',
  },
  {
    id: 'catherine-senechal',
    address: '12 Rue Dupleix, 75015 Paris',
    city: 'Paris',
    lat: 48.8504,
    lng: 2.2989,
    imageUrl: '/images/ateliers/atelier_catrherine_senechal.webp',
  },
  {
    id: 'sandrine-hirson',
    address: '10 Rue william Cliff, 02100 Saint-quentin',
    city: 'Saint-quentin',
    lat: 49.854683  ,
    lng: 3.286795,
    imageUrl: '/images/ateliers/atelier_sandrine_hirson.webp',
  },
  {
    id: 'francois-poulat',
    address: '18 Rue Lafaurie de Monbadon, 33000 Bordeaux',
    city: 'Bordeaux',
    lat: 44.843817,
    lng: -0.579622,
    imageUrl: '/images/ateliers/atelier_francois_poulat.webp',
  },
  {
    id: 'franck-alagna',
    address: '3 bis rue des Aires, 13840 Rogne',
    city: 'Rogne',
    lat: 43.666180,
    lng: 5.348585,
    imageUrl: '/images/ateliers/atelier_franck_alagna.webp',
  },
  {
    id: 'eaudalix',
    address: '24 Quai Eole, 44560 Paimbœuf',
    city: 'Paimbœuf',
    lat: 47.288994,
    lng: -2.037900,
    imageUrl: '/images/ateliers/atelier_eaudalix.webp',
  }

]

async function buildFallback(locale: string): Promise<GmbLocation[]> {
  const dict = await getDictionary(hasLocale(locale) ? locale : 'fr')
  const artists = dict.index.artists as Record<string, { title: string; category: string; description: string }>

  return FALLBACK_BASE.map((base) => {
    const t = artists[base.id]
    return {
      ...base,
      title: t?.title ?? base.id,
      category: t?.category,
      description: t?.description,
    }
  })
}

async function fetchGmbLocations(): Promise<GmbLocation[] | null> {
  try {
    const accountId = process.env.GOOGLE_GMB_ACCOUNT_ID
    if (!accountId || accountId.includes('XXXXX')) return null

    const token = await getAccessToken()

    const res = await fetch(
      `https://mybusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storefrontAddress,latlng,websiteUri,categories&pageSize=10`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    )

    if (!res.ok) return null

    const data = await res.json() as {
      locations?: Array<{
        name: string
        title: string
        storefrontAddress?: { addressLines?: string[]; locality?: string }
        latlng?: { latitude: number; longitude: number }
        websiteUri?: string
        categories?: { primaryCategory?: { displayName?: string } }
      }>
    }

    if (!data.locations?.length) return null

    const validated = data.locations.filter(
      (l) => l.latlng?.latitude && l.latlng?.longitude
    )

    if (!validated.length) return null

    return validated.slice(0, 3).map((l) => ({
      id: l.name.split('/').pop() ?? l.name,
      title: l.title,
      address: [
        ...(l.storefrontAddress?.addressLines ?? []),
        l.storefrontAddress?.locality,
      ]
        .filter(Boolean)
        .join(', '),
      city: l.storefrontAddress?.locality ?? '',
      lat: l.latlng!.latitude,
      lng: l.latlng!.longitude,
      websiteUri: l.websiteUri,
      category: l.categories?.primaryCategory?.displayName,
    }))
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'fr'
  const live = await fetchGmbLocations()
  const locations = live ?? await buildFallback(locale)

  return NextResponse.json({ locations, source: live ? 'gmb' : 'fallback' })
}
