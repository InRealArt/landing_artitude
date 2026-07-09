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

    if (
      !photoCover || !photoExterior1 || !photoExterior2 || !photoExterior3 ||
      !photoInterior1 || !photoInterior2 || !photoInterior3 || !photoInterior4 ||
      !photoOwner || !photoArtwork1 || !photoArtwork2 || !photoArtwork3 || !photoArtwork4 || !photoArtwork5
    ) {
      return NextResponse.json({ error: 'All 14 photos are required' }, { status: 400 })
    }

    const photos = [
      { file: photoCover, label: 'Extérieur principale' },
      { file: photoExterior1, label: 'Extérieur secondaire 1' },
      { file: photoExterior2, label: 'Extérieur secondaire 2' },
      { file: photoExterior3, label: 'Extérieur secondaire 3' },
      { file: photoInterior1, label: 'Intérieur 1' },
      { file: photoInterior2, label: 'Intérieur 2' },
      { file: photoInterior3, label: 'Intérieur 3' },
      { file: photoInterior4, label: 'Intérieur 4' },
      { file: photoOwner, label: 'Propriétaire' },
      { file: photoArtwork1, label: 'Œuvre 1' },
      { file: photoArtwork2, label: 'Œuvre 2' },
      { file: photoArtwork3, label: 'Œuvre 3' },
      { file: photoArtwork4, label: 'Œuvre 4' },
      { file: photoArtwork5, label: 'Œuvre 5' },
    ]

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

    // Upload photos to R2 and geocode in parallel
    const getExt = (file: File) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type] ?? 'jpg')

    const toBuffer = async (file: File) => Buffer.from(await file.arrayBuffer())

    const [
      coverBuf, exterior1Buf, exterior2Buf, exterior3Buf,
      interior1Buf, interior2Buf, interior3Buf, interior4Buf,
      ownerBuf, artwork1Buf, artwork2Buf, artwork3Buf, artwork4Buf, artwork5Buf,
      coords,
    ] = await Promise.all([
      toBuffer(photoCover),
      toBuffer(photoExterior1),
      toBuffer(photoExterior2),
      toBuffer(photoExterior3),
      toBuffer(photoInterior1),
      toBuffer(photoInterior2),
      toBuffer(photoInterior3),
      toBuffer(photoInterior4),
      toBuffer(photoOwner),
      toBuffer(photoArtwork1),
      toBuffer(photoArtwork2),
      toBuffer(photoArtwork3),
      toBuffer(photoArtwork4),
      toBuffer(photoArtwork5),
      geocode(addressLine, postalCode, locality, regionCode),
    ])

    const [
      photoCoverUrl, photoExterior1Url, photoExterior2Url, photoExterior3Url,
      photoInterior1Url, photoInterior2Url, photoInterior3Url, photoInterior4Url,
      photoOwnerUrl, photoArtwork1Url, photoArtwork2Url, photoArtwork3Url, photoArtwork4Url, photoArtwork5Url,
    ] = await Promise.all([
      uploadToR2({ key: `gmb/${storeCode}/cover/main.${getExt(photoCover)}`, body: coverBuf, contentType: photoCover.type }),
      uploadToR2({ key: `gmb/${storeCode}/exterior/1.${getExt(photoExterior1)}`, body: exterior1Buf, contentType: photoExterior1.type }),
      uploadToR2({ key: `gmb/${storeCode}/exterior/2.${getExt(photoExterior2)}`, body: exterior2Buf, contentType: photoExterior2.type }),
      uploadToR2({ key: `gmb/${storeCode}/exterior/3.${getExt(photoExterior3)}`, body: exterior3Buf, contentType: photoExterior3.type }),
      uploadToR2({ key: `gmb/${storeCode}/interior/1.${getExt(photoInterior1)}`, body: interior1Buf, contentType: photoInterior1.type }),
      uploadToR2({ key: `gmb/${storeCode}/interior/2.${getExt(photoInterior2)}`, body: interior2Buf, contentType: photoInterior2.type }),
      uploadToR2({ key: `gmb/${storeCode}/interior/3.${getExt(photoInterior3)}`, body: interior3Buf, contentType: photoInterior3.type }),
      uploadToR2({ key: `gmb/${storeCode}/interior/4.${getExt(photoInterior4)}`, body: interior4Buf, contentType: photoInterior4.type }),
      uploadToR2({ key: `gmb/${storeCode}/owner/main.${getExt(photoOwner)}`, body: ownerBuf, contentType: photoOwner.type }),
      uploadToR2({ key: `gmb/${storeCode}/artworks/1.${getExt(photoArtwork1)}`, body: artwork1Buf, contentType: photoArtwork1.type }),
      uploadToR2({ key: `gmb/${storeCode}/artworks/2.${getExt(photoArtwork2)}`, body: artwork2Buf, contentType: photoArtwork2.type }),
      uploadToR2({ key: `gmb/${storeCode}/artworks/3.${getExt(photoArtwork3)}`, body: artwork3Buf, contentType: photoArtwork3.type }),
      uploadToR2({ key: `gmb/${storeCode}/artworks/4.${getExt(photoArtwork4)}`, body: artwork4Buf, contentType: photoArtwork4.type }),
      uploadToR2({ key: `gmb/${storeCode}/artworks/5.${getExt(photoArtwork5)}`, body: artwork5Buf, contentType: photoArtwork5.type }),
    ])

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
      ].join(','),
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
    ]
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
