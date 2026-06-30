import { NextRequest, NextResponse } from 'next/server'
import { generateGmbExcel, GmbExcelData } from '@/lib/gmb-excel'

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get('name') as string | null
    const title = formData.get('title') as string | null
    const phone = formData.get('phone') as string | null
    const addressLine = formData.get('addressLine') as string | null
    const postalCode = formData.get('postalCode') as string | null
    const locality = formData.get('locality') as string | null
    const regionCode = formData.get('regionCode') as string | null
    const websiteUri = formData.get('websiteUri') as string | null
    const hoursRaw = formData.get('hours') as string | null

    const photoInterior = formData.get('photoInterior') as File | null
    const photoExterior1 = formData.get('photoExterior1') as File | null
    const photoExterior2 = formData.get('photoExterior2') as File | null
    const photoOwner = formData.get('photoOwner') as File | null

    const consent = formData.get('consent') as string | null

    if (!name || !title || !phone || !addressLine || !postalCode || !locality || !regionCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (consent !== 'true') {
      return NextResponse.json({ error: 'Consent required' }, { status: 400 })
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

    if (!photoInterior || !photoExterior1 || !photoExterior2 || !photoOwner) {
      return NextResponse.json({ error: 'All 4 photos are required' }, { status: 400 })
    }

    const photos = [
      { file: photoInterior, label: 'Intérieur' },
      { file: photoExterior1, label: 'Extérieur 1' },
      { file: photoExterior2, label: 'Extérieur 2' },
      { file: photoOwner, label: 'Propriétaire' },
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

    // Generate Excel
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
      photoLogoUrl: '',
      photoCoverUrl: '',
      photoOtherUrls: '',
    }

    const excelBuffer = await generateGmbExcel(excelData)
    const excelBase64 = excelBuffer.toString('base64')

    // Convert photos to base64
    const [interiorB64, exterior1B64, exterior2B64, ownerB64] = await Promise.all([
      fileToBase64(photoInterior),
      fileToBase64(photoExterior1),
      fileToBase64(photoExterior2),
      fileToBase64(photoOwner),
    ])

    const getExt = (file: File) => {
      const mime: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      }
      return mime[file.type] ?? 'jpg'
    }

    const emailSubject = `[ ARTITUDE - DEMANDE DE CREATION D'ATELIER ] ${escapeHtml(name)}`

    const brevoPayload = {
      sender: { name: 'Artitude', email: 'teaminrealart@gmail.com' },
      to: [{ email: RECIPIENT_EMAIL, name: 'Team InRealArt' }],
      subject: emailSubject,
      htmlContent: `<p>Bonjour,</p>
<p>Veuillez trouver en pièces jointes les photos de l'atelier ainsi que le fichier Excel formaté pour l'import Google Business Profile.</p>
<ul>
  <li><strong>Demandeur :</strong> ${escapeHtml(name)}</li>
  <li><strong>Atelier :</strong> ${escapeHtml(title)}</li>
  <li><strong>Téléphone :</strong> ${escapeHtml(phone)}</li>
  <li><strong>Adresse :</strong> ${escapeHtml(addressLine)}, ${escapeHtml(postalCode)} ${escapeHtml(locality)}</li>
</ul>
<p>Cordialement,<br/>Artitude</p>`,
      attachment: [
        {
          content: interiorB64,
          name: `photo-interieur.${getExt(photoInterior)}`,
        },
        {
          content: exterior1B64,
          name: `photo-exterieur-1.${getExt(photoExterior1)}`,
        },
        {
          content: exterior2B64,
          name: `photo-exterieur-2.${getExt(photoExterior2)}`,
        },
        {
          content: ownerB64,
          name: `photo-proprietaire.${getExt(photoOwner)}`,
        },
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
