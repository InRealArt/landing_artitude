import { NextRequest, NextResponse } from 'next/server'
import { generateGmbExcel, GmbExcelData } from '@/lib/gmb-excel'
import { uploadToR2 } from '@/lib/r2-client'
import { addContactToBrevo } from '@/lib/brevo'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const RECIPIENT_EMAIL = 'teaminrealart@gmail.com'
const MAX_PHOTO_SIZE = 1 * 1024 * 1024 // 1 MB

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toTitleCase(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/[^\p{L}\p{N} -]/gu, '')
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer).toString('base64')
}

async function geocode(addressLine: string, postalCode: string, locality: string, regionCode: string): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(`${addressLine}, ${postalCode} ${locality}, ${regionCode}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Artitude/1.0 (teaminrealart@gmail.com)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json() as Array<{ lat: string; lon: string }>
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get('name') as string | null
    const email = formData.get('email') as string | null
    const language = (formData.get('language') as string | null) ?? 'fr'
    const title = formData.get('title') as string | null
    const phone = formData.get('phone') as string | null
    const addressLine = formData.get('addressLine') as string | null
    const postalCode = formData.get('postalCode') as string | null
    const locality = formData.get('locality') as string | null
    const regionCode = formData.get('regionCode') as string | null
    const websiteUri = formData.get('websiteUri') as string | null
    const description = formData.get('description') as string | null
    const hoursRaw = formData.get('hours') as string | null

    const photoCover = formData.get('photoCover') as File | null
    const photoExterior1 = formData.get('photoExterior1') as File | null
    const photoExterior2 = formData.get('photoExterior2') as File | null
    const photoExterior3 = formData.get('photoExterior3') as File | null
    const photoInterior1 = formData.get('photoInterior1') as File | null
    const photoInterior2 = formData.get('photoInterior2') as File | null
    const photoInterior3 = formData.get('photoInterior3') as File | null
    const photoInterior4 = formData.get('photoInterior4') as File | null
    const photoOwner = formData.get('photoOwner') as File | null
    const photoArtwork1 = formData.get('photoArtwork1') as File | null
    const photoArtwork2 = formData.get('photoArtwork2') as File | null
    const photoArtwork3 = formData.get('photoArtwork3') as File | null
    const photoArtwork4 = formData.get('photoArtwork4') as File | null
    const photoArtwork5 = formData.get('photoArtwork5') as File | null

    const consent = formData.get('consent') as string | null

    if (!name || !title || !phone || !addressLine || !postalCode || !locality || !regionCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (consent !== 'true') {
      return NextResponse.json({ error: 'Consent required' }, { status: 400 })
    }

    if (email) {
      addContactToBrevo(email, language, 'Artitude Register Form').catch((err) => {
        console.error('[create-location] Brevo contact sync failed:', err)
      })
    }

    if (websiteUri) {
      try {
        const parsed = new URL(websiteUri)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
      }
    }

    const hasInterior = [photoInterior1, photoInterior2, photoInterior3, photoInterior4].some(Boolean)
    if (!photoCover || !photoOwner || !hasInterior) {
      return NextResponse.json({ error: 'Main photo, at least one interior photo, and owner photo are required' }, { status: 400 })
    }

    const photos = [
      { key: 'cover', file: photoCover, label: 'Extérieur principale' },
      { key: 'exterior1', file: photoExterior1, label: 'Extérieur secondaire 1' },
      { key: 'exterior2', file: photoExterior2, label: 'Extérieur secondaire 2' },
      { key: 'exterior3', file: photoExterior3, label: 'Extérieur secondaire 3' },
      { key: 'interior1', file: photoInterior1, label: 'Intérieur 1' },
      { key: 'interior2', file: photoInterior2, label: 'Intérieur 2' },
      { key: 'interior3', file: photoInterior3, label: 'Intérieur 3' },
      { key: 'interior4', file: photoInterior4, label: 'Intérieur 4' },
      { key: 'owner', file: photoOwner, label: 'Propriétaire' },
      { key: 'artwork1', file: photoArtwork1, label: 'Œuvre 1' },
      { key: 'artwork2', file: photoArtwork2, label: 'Œuvre 2' },
      { key: 'artwork3', file: photoArtwork3, label: 'Œuvre 3' },
      { key: 'artwork4', file: photoArtwork4, label: 'Œuvre 4' },
      { key: 'artwork5', file: photoArtwork5, label: 'Œuvre 5' },
    ].filter((p): p is { key: string; file: File; label: string } => p.file !== null)

    const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

    for (const { file, label } of photos) {
      if (file.size > MAX_PHOTO_SIZE) {
        return NextResponse.json(
          { error: `Photo "${label}" dépasse 1 Mo (${(file.size / 1024 / 1024).toFixed(1)} Mo)` },
          { status: 400 }
        )
      }
      // Validate magic bytes (first 4 bytes) — file.type is browser-controlled and spoofable
      const header = Buffer.from(await file.slice(0, 4).arrayBuffer())
      const isJpeg = header[0] === 0xff && header[1] === 0xd8
      const isPng  = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47
      const isWebp = header.toString('ascii', 0, 4) === 'RIFF'
      if (!isJpeg && !isPng && !isWebp) {
        return NextResponse.json(
          { error: `Photo "${label}" : seuls JPEG, PNG et WebP sont acceptés` },
          { status: 400 }
        )
      }
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          { error: `Photo "${label}" : type de fichier non autorisé` },
          { status: 400 }
        )
      }
    }

    let hours: GmbExcelData['hours'] = []
    if (hoursRaw) {
      try {
        hours = JSON.parse(hoursRaw)
        if (!Array.isArray(hours)) {
          return NextResponse.json({ error: 'Invalid hours format' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid hours format' }, { status: 400 })
      }
    }

    const storeCode = toSlug(name)
    if (!storeCode || !/^[a-z0-9-]+$/.test(storeCode)) {
      return NextResponse.json({ error: 'Invalid artist name' }, { status: 400 })
    }
    const r2FolderName = toTitleCase(name)
    if (!r2FolderName) {
      return NextResponse.json({ error: 'Invalid artist name' }, { status: 400 })
    }

    // Upload photos to R2 and geocode in parallel
    const getExt = (file: File) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type] ?? 'jpg')

    const R2_FOLDERS: Record<string, string> = {
      cover: 'cover/main', exterior1: 'exterior/1', exterior2: 'exterior/2', exterior3: 'exterior/3',
      interior1: 'interior/1', interior2: 'interior/2', interior3: 'interior/3', interior4: 'interior/4',
      owner: 'owner/main',
      artwork1: 'artworks/1', artwork2: 'artworks/2', artwork3: 'artworks/3', artwork4: 'artworks/4', artwork5: 'artworks/5',
    }

    const [uploadResults, coords] = await Promise.all([
      Promise.all(photos.map(async ({ key, file }) => {
        const buf = Buffer.from(await file.arrayBuffer())
        const url = await uploadToR2({ key: `ARTITUDE/${r2FolderName}/${R2_FOLDERS[key]}.${getExt(file)}`, body: buf, contentType: file.type })
        return [key, url] as const
      })),
      geocode(addressLine, postalCode, locality, regionCode),
    ])

    const urlByKey = new Map(uploadResults)
    const photoCoverUrl = urlByKey.get('cover') as string
    const photoExterior1Url = urlByKey.get('exterior1')
    const photoExterior2Url = urlByKey.get('exterior2')
    const photoExterior3Url = urlByKey.get('exterior3')
    const photoInterior1Url = urlByKey.get('interior1')
    const photoInterior2Url = urlByKey.get('interior2')
    const photoInterior3Url = urlByKey.get('interior3')
    const photoInterior4Url = urlByKey.get('interior4')
    const photoOwnerUrl = urlByKey.get('owner') as string
    const photoArtwork1Url = urlByKey.get('artwork1')
    const photoArtwork2Url = urlByKey.get('artwork2')
    const photoArtwork3Url = urlByKey.get('artwork3')
    const photoArtwork4Url = urlByKey.get('artwork4')
    const photoArtwork5Url = urlByKey.get('artwork5')

    // Generate Excel with real photo URLs, lat/lng and correct hours
    const excelData: GmbExcelData = {
      storeCode,
      businessName: title,
      addressLine,
      locality,
      regionCode,
      postalCode,
      phone,
      websiteUri: websiteUri || undefined,
      hours,
      latitude: coords?.lat,
      longitude: coords?.lng,
      photoCoverUrl,
      photoOtherUrls: [
        photoExterior1Url, photoExterior2Url, photoExterior3Url,
        photoInterior1Url, photoInterior2Url, photoInterior3Url, photoInterior4Url,
        photoOwnerUrl, photoArtwork1Url, photoArtwork2Url, photoArtwork3Url, photoArtwork4Url, photoArtwork5Url,
      ].filter((url): url is string => Boolean(url)).join(','),
    }

    const excelBuffer = await generateGmbExcel(excelData)
    const excelBase64 = excelBuffer.toString('base64')

    const photoLinks = [
      { label: 'Extérieur principale', url: photoCoverUrl },
      { label: 'Extérieur secondaire 1', url: photoExterior1Url },
      { label: 'Extérieur secondaire 2', url: photoExterior2Url },
      { label: 'Extérieur secondaire 3', url: photoExterior3Url },
      { label: 'Intérieur 1', url: photoInterior1Url },
      { label: 'Intérieur 2', url: photoInterior2Url },
      { label: 'Intérieur 3', url: photoInterior3Url },
      { label: 'Intérieur 4', url: photoInterior4Url },
      { label: 'Propriétaire', url: photoOwnerUrl },
      { label: 'Œuvre 1', url: photoArtwork1Url },
      { label: 'Œuvre 2', url: photoArtwork2Url },
      { label: 'Œuvre 3', url: photoArtwork3Url },
      { label: 'Œuvre 4', url: photoArtwork4Url },
      { label: 'Œuvre 5', url: photoArtwork5Url },
    ].filter((p): p is { label: string; url: string } => Boolean(p.url))
    const emailSubject = `[ ARTITUDE - DEMANDE DE CREATION D'ATELIER ] ${escapeHtml(name)}`

    const brevoPayload = {
      sender: { name: 'Artitude', email: 'teaminrealart@gmail.com' },
      to: [{ email: RECIPIENT_EMAIL, name: 'Team InRealArt' }],
      subject: emailSubject,
      htmlContent: `<p>Bonjour,</p>
<p>Veuillez trouver en pièce jointe le fichier Excel formaté pour l'import Google Business Profile. Les photos de l'atelier sont disponibles via les liens ci-dessous.</p>
<ul>
  <li><strong>Demandeur :</strong> ${escapeHtml(name)}</li>
  <li><strong>Atelier :</strong> ${escapeHtml(title)}</li>
  <li><strong>Téléphone :</strong> ${escapeHtml(phone)}</li>
  <li><strong>Adresse :</strong> ${escapeHtml(addressLine)}, ${escapeHtml(postalCode)} ${escapeHtml(locality)}</li>
</ul>
${description ? `<p><strong>Description :</strong><br/>${escapeHtml(description).replace(/\n/g, '<br/>')}</p>` : ''}
<p><strong>Photos :</strong></p>
<ul>
${photoLinks.map((p) => `  <li>${escapeHtml(p.label)} : <a href="${escapeHtml(p.url)}">${escapeHtml(p.url)}</a></li>`).join('\n')}
</ul>
<p>Cordialement,<br/>Artitude</p>`,
      attachment: [
        {
          content: excelBase64,
          name: `gmb-import-${storeCode}.xlsx`,
        },
      ],
    }

    const brevoApiKey = process.env.BREVO_API_KEY
    if (!brevoApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const brevoRes = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    })

    if (!brevoRes.ok) {
      const brevoError = await brevoRes.text()
      console.error('Brevo error:', brevoError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('create-location exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
