import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { uploadToR2 } from '@/lib/r2-client'
import { generateGmbExcel, GmbExcelData } from '@/lib/gmb-excel'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function compressImage(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return sharp(Buffer.from(arrayBuffer))
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
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

    if (!name || !title || !phone || !addressLine || !postalCode || !locality || !regionCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!photoInterior || !photoExterior1 || !photoExterior2 || !photoOwner) {
      return NextResponse.json({ error: 'All 4 photos are required' }, { status: 400 })
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

    const r2Prefix = `artitude/ateliers/${storeCode}`

    // Compress and upload photos
    const [interiorBuf, exterior1Buf, exterior2Buf, ownerBuf] = await Promise.all([
      compressImage(photoInterior),
      compressImage(photoExterior1),
      compressImage(photoExterior2),
      compressImage(photoOwner),
    ])

    const [interiorUrl, exterior1Url, exterior2Url, ownerUrl] = await Promise.all([
      uploadToR2({ key: `${r2Prefix}/interior.webp`, body: interiorBuf, contentType: 'image/webp' }),
      uploadToR2({ key: `${r2Prefix}/exterior-1.webp`, body: exterior1Buf, contentType: 'image/webp' }),
      uploadToR2({ key: `${r2Prefix}/exterior-2.webp`, body: exterior2Buf, contentType: 'image/webp' }),
      uploadToR2({ key: `${r2Prefix}/owner.webp`, body: ownerBuf, contentType: 'image/webp' }),
    ])

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
      photoLogoUrl: ownerUrl,
      photoCoverUrl: exterior1Url,
      photoOtherUrls: [interiorUrl, exterior2Url].join(','),
    }

    const excelBuffer = await generateGmbExcel(excelData)
    const excelUrl = await uploadToR2({
      key: `${r2Prefix}/gmb-import.xlsx`,
      body: excelBuffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    return NextResponse.json({ excelUrl })
  } catch (e) {
    console.error('create-location exception:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
