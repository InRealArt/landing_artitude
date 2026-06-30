# GMB Excel Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** À la soumission du formulaire RegisterSection, uploader les photos sur Cloudflare R2 (compressées via sharp), puis générer un fichier Excel GMB pré-rempli (basé sur le template existant) avec les URLs R2 des photos, et le proposer au téléchargement immédiat.

**Architecture:** Route Handler unique `POST /api/gmb/create-location` reçoit le FormData (champs texte + 4 fichiers) — compresse et upload chaque photo sur R2 sous `/artitude/ateliers/<prénom> <nom>/` — génère le Excel via `exceljs` en remplissant la ligne 2 du template — upload le Excel sur R2 — retourne l'URL publique du Excel pour téléchargement côté client.

**Tech Stack:** Next.js 16 App Router, TypeScript, `exceljs` (lecture/écriture xlsx), `sharp` (compression images WebP), `@aws-sdk/client-s3` (upload R2), Cloudflare R2

## Global Constraints

- Compression photos : WebP, qualité 85, max 1920px sur le grand côté — via `sharp`
- Chemin R2 photos : `/artitude/ateliers/<prénom> <nom>/<slug>.webp` (prénom + nom = champ `name` du formulaire)
- Chemin R2 Excel : `/artitude/ateliers/<prénom> <nom>/gmb-import.xlsx`
- Template source : `templates/GMB/Google-Business-Profile-Template-fr.xlsx` (ligne 1 = headers, ligne 2 = données)
- Format horaires GMB : `HH:MM-HH:MM` si ouvert, `Closed` si fermé
- Catégorie GMB fixe : `gcid:art_studio`
- Code de magasin (col A) : slug kebab-case du nom de l'artiste, ex `jean-luc-boyer`
- Tokens Tailwind existants uniquement — pas de nouvelles couleurs
- Variables d'env R2 : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Colonne → Champ mapping (template GMB)

| Col | Header GMB | Source |
|-----|-----------|--------|
| A | Code de magasin | slug kebab du champ `name` |
| B | Nom de l'entreprise | `atelierName` |
| C | Ligne d'adresse 1 | `addressLine` |
| I | Localité | `locality` |
| K | Pays/Région | `regionCode` |
| L | Code postal | `postalCode` |
| O | Numéro principal | `phone` |
| Q | Site Web | `websiteUri` |
| R | Catégorie principale | `gcid:art_studio` |
| T | Horaires dimanche | hours SUNDAY |
| U | Horaires lundi | hours MONDAY |
| V | Horaires mardi | hours TUESDAY |
| W | Horaires mercredi | hours WEDNESDAY |
| X | Horaires jeudi | hours THURSDAY |
| Y | Horaires vendredi | hours FRIDAY |
| Z | Horaires samedi | hours SATURDAY |
| AD | Photo du logo | URL R2 `owner.webp` |
| AE | Photo de couverture | URL R2 `exterior-1.webp` |
| AF | Autres photos | URL R2 `interior.webp,exterior-2.webp` (virgule) |

---

## File Map

| Fichier | Action | Rôle |
|---------|--------|------|
| `lib/r2-client.ts` | Créer | Client S3/R2 + fonction `uploadToR2` |
| `lib/gmb-excel.ts` | Créer | Génération du fichier Excel GMB depuis le template |
| `app/api/gmb/create-location/route.ts` | Modifier | Orchestration : compress → R2 upload → Excel → retour URL |
| `components/sections/RegisterSection.tsx` | Modifier | Success overlay : téléchargement du Excel + message adapté |
| `.env.local.example` | Modifier | Ajouter variables R2 |

---

### Task 1: Client Cloudflare R2 (`lib/r2-client.ts`)

**Files:**
- Create: `lib/r2-client.ts`

**Interfaces:**
- Produces:
  ```typescript
  uploadToR2(params: {
    key: string           // chemin dans le bucket, ex: "artitude/ateliers/jean luc/interior.webp"
    body: Buffer
    contentType: string   // "image/webp" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }): Promise<string>     // retourne l'URL publique complète
  ```

- [ ] **Step 1: Installer les dépendances**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude
pnpm add @aws-sdk/client-s3 sharp exceljs
pnpm add -D @types/sharp
```

Attendu : packages installés sans erreur

- [ ] **Step 2: Créer `lib/r2-client.ts`**

```typescript
// lib/r2-client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  throw new Error('Missing R2 environment variables')
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadToR2({
  key,
  body,
  contentType,
}: {
  key: string
  body: Buffer
  contentType: string
}): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return `${R2_PUBLIC_URL}/${key}`
}
```

- [ ] **Step 3: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit 2>&1
```

Attendu : 0 erreurs

- [ ] **Step 4: Commit**

```bash
git add lib/r2-client.ts pnpm-lock.yaml package.json
git commit -m "feat: add Cloudflare R2 upload client"
```

---

### Task 2: Générateur Excel GMB (`lib/gmb-excel.ts`)

**Files:**
- Create: `lib/gmb-excel.ts`

**Interfaces:**
- Consumes: rien (lit le template depuis le filesystem)
- Produces:
  ```typescript
  interface GmbExcelData {
    storeCode: string       // slug kebab du nom artiste
    businessName: string    // nom de l'atelier
    addressLine: string
    locality: string
    regionCode: string
    postalCode: string
    phone: string
    websiteUri?: string
    hours: Array<{ day: string; open: boolean; openTime: string; closeTime: string }>
    photoLogoUrl: string    // URL R2 owner.webp
    photoCoverUrl: string   // URL R2 exterior-1.webp
    photoOtherUrls: string  // URLs R2 séparées par virgule
  }

  generateGmbExcel(data: GmbExcelData): Promise<Buffer>
  ```

- [ ] **Step 1: Créer `lib/gmb-excel.ts`**

```typescript
// lib/gmb-excel.ts
import ExcelJS from 'exceljs'
import path from 'path'

export interface GmbExcelData {
  storeCode: string
  businessName: string
  addressLine: string
  locality: string
  regionCode: string
  postalCode: string
  phone: string
  websiteUri?: string
  hours: Array<{ day: string; open: boolean; openTime: string; closeTime: string }>
  photoLogoUrl: string
  photoCoverUrl: string
  photoOtherUrls: string
}

const TEMPLATE_PATH = path.join(process.cwd(), 'templates/GMB/Google-Business-Profile-Template-fr.xlsx')

const DAY_TO_COL: Record<string, string> = {
  SUNDAY: 'T',
  MONDAY: 'U',
  TUESDAY: 'V',
  WEDNESDAY: 'W',
  THURSDAY: 'X',
  FRIDAY: 'Y',
  SATURDAY: 'Z',
}

function formatHours(day: string, hours: GmbExcelData['hours']): string {
  const entry = hours.find((h) => h.day === day)
  if (!entry || !entry.open) return 'Closed'
  return `${entry.openTime}-${entry.closeTime}`
}

export async function generateGmbExcel(data: GmbExcelData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(TEMPLATE_PATH)

  const sheet = workbook.worksheets[0]

  // Row 2 = data row (row 1 = headers)
  const row = sheet.getRow(2)

  row.getCell('A').value = data.storeCode
  row.getCell('B').value = data.businessName
  row.getCell('C').value = data.addressLine
  row.getCell('I').value = data.locality
  row.getCell('K').value = data.regionCode
  row.getCell('L').value = data.postalCode
  row.getCell('O').value = data.phone
  if (data.websiteUri) row.getCell('Q').value = data.websiteUri
  row.getCell('R').value = 'gcid:art_studio'

  for (const day of Object.keys(DAY_TO_COL)) {
    row.getCell(DAY_TO_COL[day]).value = formatHours(day, data.hours)
  }

  row.getCell('AD').value = data.photoLogoUrl
  row.getCell('AE').value = data.photoCoverUrl
  row.getCell('AF').value = data.photoOtherUrls

  row.commit()

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit 2>&1
```

Attendu : 0 erreurs

- [ ] **Step 3: Commit**

```bash
git add lib/gmb-excel.ts
git commit -m "feat: add GMB Excel generator from template"
```

---

### Task 3: Route Handler — orchestration complète

**Files:**
- Modify: `app/api/gmb/create-location/route.ts`

**Interfaces:**
- Consumes:
  - `uploadToR2({ key, body, contentType }): Promise<string>` depuis `@/lib/r2-client`
  - `generateGmbExcel(data: GmbExcelData): Promise<Buffer>` depuis `@/lib/gmb-excel`
- Produces:
  - `POST /api/gmb/create-location` → `{ excelUrl: string }` | `{ error: string }`

Le handler remplace entièrement l'ancienne logique GMB API (désormais inutile en attente d'approbation). Il :
1. Parse le FormData
2. Compresse chaque photo via `sharp` → WebP qualité 85, max 1920px
3. Upload chaque photo sur R2 sous `artitude/ateliers/<name>/`
4. Génère le Excel avec `generateGmbExcel`
5. Upload le Excel sur R2
6. Retourne `{ excelUrl }`

- [ ] **Step 1: Réécrire `app/api/gmb/create-location/route.ts`**

```typescript
// app/api/gmb/create-location/route.ts
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
      } catch {
        return NextResponse.json({ error: 'Invalid hours format' }, { status: 400 })
      }
    }

    const artistSlug = name // "Jean-Luc Boyer" → folder name as-is for readability
    const r2Prefix = `artitude/ateliers/${artistSlug}`
    const storeCode = toSlug(name)

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
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit 2>&1
```

Attendu : 0 erreurs

- [ ] **Step 3: Commit**

```bash
git add app/api/gmb/create-location/route.ts
git commit -m "feat: replace GMB API call with R2 upload + Excel generation"
```

---

### Task 4: Mise à jour RegisterSection — FormData + success overlay

**Files:**
- Modify: `components/sections/RegisterSection.tsx`

**Interfaces:**
- Consumes: `POST /api/gmb/create-location` → `{ excelUrl: string }`
- Le FormData doit inclure le champ `name` (prénom + nom de l'artiste) en plus des champs existants

**Changements :**
1. Ajouter `name` dans le FormData envoyé (déjà collecté en state `name`)
2. Stocker `excelUrl` dans le state après succès
3. Success overlay : afficher bouton "Télécharger ma fiche GMB" + instructions

- [ ] **Step 1: Lire le fichier actuel**

```bash
grep -n "fd.append\|setSuccess\|excelUrl\|const \[success" /home/gilles/DEV/IN_REAL_ART/landing_artitude/components/sections/RegisterSection.tsx
```

- [ ] **Step 2: Ajouter le state `excelUrl` et modifier le submit**

Localiser dans `RegisterSection.tsx` la section `const [success` et ajouter :

```typescript
const [excelUrl, setExcelUrl] = useState<string | null>(null)
```

- [ ] **Step 3: Ajouter `name` dans le FormData et récupérer `excelUrl`**

Remplacer dans `handleSubmit` :

```typescript
      const fd = new FormData()
      fd.append('name', name)          // ← ajouter cette ligne
      fd.append('title', atelierName)
      fd.append('phone', phone)
      fd.append('addressLine', address)
      fd.append('postalCode', postalCode)
      fd.append('locality', city)
      fd.append('regionCode', country)
      fd.append('consent', String(consent))
      if (website) fd.append('websiteUri', website)
      if (description) fd.append('description', description)
      if (openPeriods.length > 0) fd.append('hours', JSON.stringify(openPeriods))
      fd.append('photoInterior', photoInterior)
      fd.append('photoExterior1', photoExterior1)
      fd.append('photoExterior2', photoExterior2)
      fd.append('photoOwner', photoOwner)

      const createRes = await fetch('/api/gmb/create-location', {
        method: 'POST',
        body: fd,
      })

      if (!createRes.ok) {
        setErrorMsg(d.errorGeneric)
        setSubmitting(false)
        return
      }

      const { excelUrl: url } = await createRes.json()
      setExcelUrl(url)
      setSuccess(true)
```

- [ ] **Step 4: Mettre à jour le success overlay**

Remplacer le bloc `{success && (...)}` par :

```tsx
          {success && (
            <div className="absolute inset-0 bg-canvas/95 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="h-14 w-14 border border-inkBlack flex items-center justify-center text-inkBlack text-2xl">✓</div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-inkBlack">{d.successTitle}</h3>
                <p className="text-xs text-grayText max-w-md mx-auto font-sans">{d.successDesc}</p>
              </div>
              {excelUrl && (
                <a
                  href={excelUrl}
                  download="gmb-import.xlsx"
                  className="btn-action justify-center py-3 text-[11px]"
                >
                  {d.successDownload}
                </a>
              )}
              <p className="text-[10px] text-grayText max-w-sm mx-auto font-sans leading-relaxed">
                {d.successInstructions}
              </p>
              <button onClick={handleReset} className="btn-mag">{d.successReset}</button>
            </div>
          )}
```

- [ ] **Step 5: Ajouter `excelUrl` au handleReset**

```typescript
  const handleReset = () => {
    setSuccess(false)
    setExcelUrl(null)   // ← ajouter
    setStep(1)
    // ... reste inchangé
```

- [ ] **Step 6: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit 2>&1
```

Attendu : 0 erreurs

- [ ] **Step 7: Commit**

```bash
git add components/sections/RegisterSection.tsx
git commit -m "feat: handle excelUrl in success overlay with download button"
```

---

### Task 5: Nouvelles clés i18n + variables d'env

**Files:**
- Modify: `dictionaries/fr.json`
- Modify: `dictionaries/en.json`
- Modify: `.env.local.example`

**Nouvelles clés à ajouter dans `register` (fr.json) :**

```json
"successDownload": "Télécharger ma fiche Google (Excel)",
"successInstructions": "Importez ce fichier dans Google Business Profile : business.google.com → Établissements → Importer des établissements. Vos photos sont déjà hébergées et référencées dans le fichier."
```

**Nouvelles clés (en.json) :**

```json
"successDownload": "Download my Google listing (Excel)",
"successInstructions": "Import this file in Google Business Profile: business.google.com → Businesses → Import businesses. Your photos are already hosted and referenced in the file."
```

**Variables à ajouter dans `.env.local.example` :**

```env
# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=https://<votre-domaine-r2-public>
```

- [ ] **Step 1: Ajouter les clés i18n dans `dictionaries/fr.json`**

Localiser `"successReset"` dans la section `register` et ajouter après :

```json
"successDownload": "Télécharger ma fiche Google (Excel)",
"successInstructions": "Importez ce fichier dans Google Business Profile : business.google.com → Établissements → Importer des établissements. Vos photos sont déjà hébergées et référencées dans le fichier."
```

- [ ] **Step 2: Ajouter les clés dans `dictionaries/en.json`**

```json
"successDownload": "Download my Google listing (Excel)",
"successInstructions": "Import this file in Google Business Profile: business.google.com → Businesses → Import businesses. Your photos are already hosted and referenced in the file."
```

- [ ] **Step 3: Valider le JSON**

```bash
node -e "require('./dictionaries/fr.json'); console.log('fr OK')"
node -e "require('./dictionaries/en.json'); console.log('en OK')"
```

Attendu : `fr OK` et `en OK`

- [ ] **Step 4: Mettre à jour `.env.local.example`**

```env
# Google Business Profile API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_GMB_ACCOUNT_ID=accounts/XXXXXXXXXX

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=https://<votre-domaine-r2-public>
```

- [ ] **Step 5: Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1
```

Attendu : 0 erreurs

- [ ] **Step 6: Commit**

```bash
git add dictionaries/fr.json dictionaries/en.json .env.local.example
git commit -m "feat: add i18n keys for Excel download + R2 env vars"
```

---

## Self-Review

### Spec coverage

| Requirement | Task |
|-------------|------|
| Upload photos R2, chemin `/artitude/ateliers/<name>/` | Task 3 |
| Compression WebP qualité 85 max 1920px via sharp | Task 3 (`compressImage`) |
| Génération Excel depuis template existant | Task 2 (`generateGmbExcel`) |
| Mapping tous les champs formulaire → colonnes GMB | Task 2 (tableau DAY_TO_COL + row.getCell) |
| URLs R2 photos dans colonnes AD, AE, AF | Task 2 |
| Excel uploadé sur R2 et URL retournée | Task 3 |
| Téléchargement automatique côté client | Task 4 (lien `<a download>`) |
| Success overlay avec instructions import GMB | Task 4 + Task 5 |
| i18n FR + EN | Task 5 |
| Variables d'env R2 documentées | Task 5 |

### Type consistency

- `GmbExcelData` définie Task 2, importée Task 3 ✓
- `uploadToR2({ key, body, contentType })` définie Task 1, appelée Task 3 ✓
- `excelUrl` state ajouté Task 4, `setExcelUrl` appelé dans handleSubmit Task 4 ✓
- `d.successDownload` et `d.successInstructions` ajoutés Task 5, utilisés Task 4 ✓

### Placeholder scan

Aucun TBD, TODO ou placeholder détecté. Tous les steps contiennent du code complet.
