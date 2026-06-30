# GMB RegisterSection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer RegisterSection en un formulaire multi-steps 3 étapes qui crée automatiquement une fiche Google Business Profile avec 4 photos uploadées.

**Architecture:** Client GMB admin (refresh token statique en .env) — deux Route Handlers Next.js (create-location, upload-media) — formulaire multi-steps avec validation par étape et zones drag-and-drop photos.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS (tokens existants), Google Business Profile API v1 (businessinformation) + v4 (media), OAuth2 client credentials flow

## Global Constraints

- Tokens Tailwind existants : `background`, `card`, `gold`, `canvas`, `inkBlack`, `borderLight`, `grayText` — ne pas créer de nouvelles couleurs
- Fonts : `font-serif` (Cormorant), `font-sans` (Montserrat), `font-display` (Unbounded)
- Classes bouton existantes : `btn-action`, `btn-mag` — les réutiliser
- GMB API create-location endpoint : `https://mybusinessbusinessinformation.googleapis.com/v1/{accountId}/locations`
- GMB API media endpoint : `https://mybusiness.googleapis.com/v4/{accountId}/{locationName}/media`
- Catégorie GMB pour atelier d'art : `gcid:art_studio`
- i18n : toutes les chaînes UI passent par le dictionnaire `dict.register.*`
- Pas de librairie de formulaire tierce — gestion d'état React native (`useState`)
- Pas de base de données — pas de Prisma — pas de stockage persistant

---

## File Map

| Fichier | Action | Rôle |
|---------|--------|------|
| `lib/gmb-client.ts` | Créer | OAuth2 refresh + fetch helpers GMB |
| `app/api/gmb/create-location/route.ts` | Créer | Route Handler POST création location |
| `app/api/gmb/upload-media/route.ts` | Créer | Route Handler POST upload photo |
| `components/ui/HoursGrid.tsx` | Créer | Grille horaires lun-dim |
| `components/ui/PhotoUploadZone.tsx` | Créer | Zone drag-and-drop photo |
| `components/sections/RegisterSection.tsx` | Modifier | Formulaire multi-steps (3 étapes) |
| `dictionaries/fr.json` | Modifier | Nouvelles clés register.* |
| `dictionaries/en.json` | Modifier | Nouvelles clés register.* (EN) |
| `.env.local` | Modifier (manuel) | Variables GMB |

---

### Task 1: GMB OAuth2 Client (`lib/gmb-client.ts`)

**Files:**
- Create: `lib/gmb-client.ts`

**Interfaces:**
- Produces:
  - `getAccessToken(): Promise<string>` — échange refresh token → access token
  - `gmbFetch(url: string, options?: RequestInit, accessToken?: string): Promise<Response>` — fetch avec Authorization header automatique

- [ ] **Step 1: Créer `lib/gmb-client.ts`**

```typescript
// lib/gmb-client.ts

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GMB token refresh failed: ${err}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function gmbFetch(
  url: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  const token = accessToken ?? (await getAccessToken())
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}
```

- [ ] **Step 2: Vérifier que le fichier est correct (pas de test automatisé — vérification manuelle)**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude
npx tsc --noEmit
```

Attendu : 0 erreurs TypeScript

- [ ] **Step 3: Commit**

```bash
git add lib/gmb-client.ts
git commit -m "feat: add GMB OAuth2 client helper"
```

---

### Task 2: Route Handler — Création de location GMB

**Files:**
- Create: `app/api/gmb/create-location/route.ts`

**Interfaces:**
- Consumes: `getAccessToken()` depuis `@/lib/gmb-client`
- Produces:
  - `POST /api/gmb/create-location` — body JSON → `{ locationName: string }` | `{ error: string }`

**Body JSON attendu :**
```typescript
{
  title: string          // nom de l'atelier
  phone: string          // téléphone primaire
  addressLine: string    // rue + numéro
  postalCode: string
  locality: string       // ville
  regionCode: string     // 'FR', 'BE', etc.
  websiteUri?: string
  description?: string
  hours?: Array<{
    openDay: string      // 'MONDAY' | 'TUESDAY' | ...
    closeDay: string
    openTime: string     // 'HH:MM'
    closeTime: string
  }>
}
```

- [ ] **Step 1: Créer le dossier et le fichier route**

```bash
mkdir -p /home/gilles/DEV/IN_REAL_ART/landing_artitude/app/api/gmb/create-location
```

- [ ] **Step 2: Écrire `app/api/gmb/create-location/route.ts`**

```typescript
// app/api/gmb/create-location/route.ts
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
```

- [ ] **Step 3: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 4: Commit**

```bash
git add app/api/gmb/create-location/route.ts
git commit -m "feat: add GMB create-location Route Handler"
```

---

### Task 3: Route Handler — Upload photo GMB

**Files:**
- Create: `app/api/gmb/upload-media/route.ts`

**Interfaces:**
- Consumes: `getAccessToken()` depuis `@/lib/gmb-client`
- Produces:
  - `POST /api/gmb/upload-media` — FormData `{ file: File, category: string, locationName: string }` → `{ success: true }` | `{ error: string }`

**Catégories valides :** `INTERIOR`, `EXTERIOR`, `OWNER`

- [ ] **Step 1: Créer le dossier et fichier route**

```bash
mkdir -p /home/gilles/DEV/IN_REAL_ART/landing_artitude/app/api/gmb/upload-media
```

- [ ] **Step 2: Écrire `app/api/gmb/upload-media/route.ts`**

```typescript
// app/api/gmb/upload-media/route.ts
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
```

- [ ] **Step 3: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 4: Commit**

```bash
git add app/api/gmb/upload-media/route.ts
git commit -m "feat: add GMB upload-media Route Handler"
```

---

### Task 4: Composant HoursGrid

**Files:**
- Create: `components/ui/HoursGrid.tsx`

**Interfaces:**
- Produces:
  ```typescript
  type DayHours = {
    day: string        // 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
    open: boolean
    openTime: string   // 'HH:MM'
    closeTime: string  // 'HH:MM'
  }
  interface HoursGridProps {
    value: DayHours[]
    onChange: (hours: DayHours[]) => void
    labels: {
      monday: string; tuesday: string; wednesday: string; thursday: string;
      friday: string; saturday: string; sunday: string;
      closed: string; openTime: string; closeTime: string;
    }
  }
  export default function HoursGrid(props: HoursGridProps): JSX.Element
  ```

- [ ] **Step 1: Écrire `components/ui/HoursGrid.tsx`**

```typescript
// components/ui/HoursGrid.tsx
'use client'

export type DayHours = {
  day: string
  open: boolean
  openTime: string
  closeTime: string
}

interface HoursGridProps {
  value: DayHours[]
  onChange: (hours: DayHours[]) => void
  labels: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
    closed: string
    openTime: string
    closeTime: string
  }
}

const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const

const DAY_LABEL_KEYS: Record<string, keyof HoursGridProps['labels']> = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
}

export function defaultHours(): DayHours[] {
  return DAYS.map((day) => ({
    day,
    open: day !== 'SUNDAY',
    openTime: '10:00',
    closeTime: '18:00',
  }))
}

export default function HoursGrid({ value, onChange, labels }: HoursGridProps) {
  const update = (index: number, patch: Partial<DayHours>) => {
    const next = value.map((h, i) => (i === index ? { ...h, ...patch } : h))
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {value.map((dayHours, i) => {
        const labelKey = DAY_LABEL_KEYS[dayHours.day]
        return (
          <div key={dayHours.day} className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dayHours.open}
                onChange={(e) => update(i, { open: e.target.checked })}
                className="h-3.5 w-3.5 accent-inkBlack"
              />
              <span className="text-[10px] uppercase tracking-wider font-display text-inkBlack">
                {labels[labelKey]}
              </span>
            </label>

            {dayHours.open ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={dayHours.openTime}
                  onChange={(e) => update(i, { openTime: e.target.value })}
                  className="bg-white border border-borderLight px-2 py-1.5 text-xs text-inkBlack font-sans outline-none focus:border-inkBlack transition-colors"
                />
                <span className="text-[10px] text-grayText">→</span>
                <input
                  type="time"
                  value={dayHours.closeTime}
                  onChange={(e) => update(i, { closeTime: e.target.value })}
                  className="bg-white border border-borderLight px-2 py-1.5 text-xs text-inkBlack font-sans outline-none focus:border-inkBlack transition-colors"
                />
              </div>
            ) : (
              <span className="text-[10px] text-grayText font-sans italic">{labels.closed}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 3: Commit**

```bash
git add components/ui/HoursGrid.tsx
git commit -m "feat: add HoursGrid component for GMB opening hours"
```

---

### Task 5: Composant PhotoUploadZone

**Files:**
- Create: `components/ui/PhotoUploadZone.tsx`

**Interfaces:**
- Produces:
  ```typescript
  interface PhotoUploadZoneProps {
    label: string        // ex: "1 photo intérieur"
    hint?: string        // ex: "JPG, PNG ou WebP · max 10 Mo"
    onChange: (file: File | null) => void
    value: File | null
  }
  export default function PhotoUploadZone(props: PhotoUploadZoneProps): JSX.Element
  ```

- [ ] **Step 1: Écrire `components/ui/PhotoUploadZone.tsx`**

```typescript
// components/ui/PhotoUploadZone.tsx
'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface PhotoUploadZoneProps {
  label: string
  hint?: string
  onChange: (file: File | null) => void
  value: File | null
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 10

export default function PhotoUploadZone({ label, hint, onChange, value }: PhotoUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-1">
      <span className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
        {label}
      </span>

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="w-full h-40 object-cover border border-borderLight"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white/90 border border-borderLight px-2 py-1 text-[9px] font-display uppercase tracking-wider text-inkBlack hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            h-40 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer gap-2 transition-colors
            ${dragOver ? 'border-gold bg-gold/5' : 'border-borderLight hover:border-inkBlack/30'}
          `}
        >
          <span className="text-2xl text-grayText">+</span>
          <span className="text-[10px] text-grayText font-sans text-center px-4">{hint ?? 'JPG, PNG ou WebP · max 10 Mo'}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 3: Commit**

```bash
git add components/ui/PhotoUploadZone.tsx
git commit -m "feat: add PhotoUploadZone drag-and-drop component"
```

---

### Task 6: Mise à jour des dictionnaires i18n

**Files:**
- Modify: `dictionaries/fr.json` (section `register`)
- Modify: `dictionaries/en.json` (section `register`)

**Nouvelles clés à ajouter** (dans `register`) :

```json
"stepLabels": ["Informations", "Localisation & Horaires", "Photos"],
"fieldPhone": "Téléphone *",
"fieldPhonePlaceholder": "+33 6 00 00 00 00",
"fieldWebsite": "Site web",
"fieldWebsitePlaceholder": "https://monatelier.fr",
"fieldAddress": "Adresse *",
"fieldAddressPlaceholder": "48 rue des Artistes",
"fieldPostalCode": "Code postal *",
"fieldPostalCodePlaceholder": "06000",
"fieldCountry": "Pays *",
"fieldDescription": "Description de l'atelier",
"fieldDescriptionPlaceholder": "Décrivez votre atelier en quelques mots... (max 750 caractères)",
"fieldHours": "Horaires d'ouverture",
"hoursLabels": {
  "monday": "Lun",
  "tuesday": "Mar",
  "wednesday": "Mer",
  "thursday": "Jeu",
  "friday": "Ven",
  "saturday": "Sam",
  "sunday": "Dim",
  "closed": "Fermé",
  "openTime": "Ouverture",
  "closeTime": "Fermeture"
},
"countries": [
  { "value": "FR", "label": "France" },
  { "value": "BE", "label": "Belgique" },
  { "value": "CH", "label": "Suisse" },
  { "value": "LU", "label": "Luxembourg" },
  { "value": "CA", "label": "Canada" }
],
"photosTitle": "Photos de votre atelier",
"photosSubtitle": "Ces photos seront publiées sur votre fiche Google.",
"photoInterior": "Photo intérieur *",
"photoExterior1": "Photo extérieur 1 *",
"photoExterior2": "Photo extérieur 2 *",
"photoOwner": "Photo du propriétaire *",
"photoHint": "JPG, PNG ou WebP · max 10 Mo",
"btnNext": "Suivant",
"btnPrev": "Retour",
"btnSubmitting": "Création en cours...",
"errorGeneric": "Une erreur est survenue. Veuillez réessayer.",
"errorPhotos": "Veuillez ajouter toutes les photos requises."
```

- [ ] **Step 1: Ouvrir `dictionaries/fr.json` et ajouter les nouvelles clés dans la section `register`, après `"successReset"`**

Les clés ci-dessous sont à insérer dans l'objet `register` (avant la fermeture `}`), dans `dictionaries/fr.json` :

```json
"stepLabels": ["Informations", "Localisation & Horaires", "Photos"],
"fieldPhone": "Téléphone *",
"fieldPhonePlaceholder": "+33 6 00 00 00 00",
"fieldWebsite": "Site web",
"fieldWebsitePlaceholder": "https://monatelier.fr",
"fieldAddress": "Adresse *",
"fieldAddressPlaceholder": "48 rue des Artistes",
"fieldPostalCode": "Code postal *",
"fieldPostalCodePlaceholder": "06000",
"fieldCountry": "Pays *",
"fieldDescription": "Description de l'atelier",
"fieldDescriptionPlaceholder": "Décrivez votre atelier en quelques mots... (max 750 caractères)",
"fieldHours": "Horaires d'ouverture",
"hoursLabels": {
  "monday": "Lun",
  "tuesday": "Mar",
  "wednesday": "Mer",
  "thursday": "Jeu",
  "friday": "Ven",
  "saturday": "Sam",
  "sunday": "Dim",
  "closed": "Fermé",
  "openTime": "Ouverture",
  "closeTime": "Fermeture"
},
"countries": [
  { "value": "FR", "label": "France" },
  { "value": "BE", "label": "Belgique" },
  { "value": "CH", "label": "Suisse" },
  { "value": "LU", "label": "Luxembourg" },
  { "value": "CA", "label": "Canada" }
],
"photosTitle": "Photos de votre atelier",
"photosSubtitle": "Ces photos seront publiées sur votre fiche Google.",
"photoInterior": "Photo intérieur *",
"photoExterior1": "Photo extérieur 1 *",
"photoExterior2": "Photo extérieur 2 *",
"photoOwner": "Photo du propriétaire *",
"photoHint": "JPG, PNG ou WebP · max 10 Mo",
"btnNext": "Suivant",
"btnPrev": "Retour",
"btnSubmitting": "Création en cours...",
"errorGeneric": "Une erreur est survenue. Veuillez réessayer.",
"errorPhotos": "Veuillez ajouter toutes les photos requises."
```

- [ ] **Step 2: Faire la même chose dans `dictionaries/en.json` avec les traductions anglaises**

```json
"stepLabels": ["Information", "Location & Hours", "Photos"],
"fieldPhone": "Phone *",
"fieldPhonePlaceholder": "+1 555 000 0000",
"fieldWebsite": "Website",
"fieldWebsitePlaceholder": "https://mystudio.com",
"fieldAddress": "Address *",
"fieldAddressPlaceholder": "48 Artists Street",
"fieldPostalCode": "Postal code *",
"fieldPostalCodePlaceholder": "10001",
"fieldCountry": "Country *",
"fieldDescription": "Studio description",
"fieldDescriptionPlaceholder": "Describe your studio in a few words... (max 750 characters)",
"fieldHours": "Opening hours",
"hoursLabels": {
  "monday": "Mon",
  "tuesday": "Tue",
  "wednesday": "Wed",
  "thursday": "Thu",
  "friday": "Fri",
  "saturday": "Sat",
  "sunday": "Sun",
  "closed": "Closed",
  "openTime": "Open",
  "closeTime": "Close"
},
"countries": [
  { "value": "US", "label": "United States" },
  { "value": "GB", "label": "United Kingdom" },
  { "value": "CA", "label": "Canada" },
  { "value": "AU", "label": "Australia" },
  { "value": "FR", "label": "France" }
],
"photosTitle": "Studio photos",
"photosSubtitle": "These photos will be published on your Google listing.",
"photoInterior": "Interior photo *",
"photoExterior1": "Exterior photo 1 *",
"photoExterior2": "Exterior photo 2 *",
"photoOwner": "Owner photo *",
"photoHint": "JPG, PNG or WebP · max 10 MB",
"btnNext": "Next",
"btnPrev": "Back",
"btnSubmitting": "Creating listing...",
"errorGeneric": "An error occurred. Please try again.",
"errorPhotos": "Please add all required photos."
```

- [ ] **Step 3: Vérifier que le JSON est valide**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude
node -e "require('./dictionaries/fr.json'); console.log('fr.json OK')"
node -e "require('./dictionaries/en.json'); console.log('en.json OK')"
```

Attendu : `fr.json OK` et `en.json OK`

- [ ] **Step 4: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 5: Commit**

```bash
git add dictionaries/fr.json dictionaries/en.json
git commit -m "feat: add i18n keys for GMB multi-step registration form"
```

---

### Task 7: Refonte de RegisterSection.tsx — Formulaire multi-steps

**Files:**
- Modify: `components/sections/RegisterSection.tsx`

**Interfaces:**
- Consumes:
  - `HoursGrid`, `defaultHours`, `DayHours` depuis `@/components/ui/HoursGrid`
  - `PhotoUploadZone` depuis `@/components/ui/PhotoUploadZone`
  - `dict.register.*` avec toutes les nouvelles clés (Task 6)
  - `POST /api/gmb/create-location` (Task 2)
  - `POST /api/gmb/upload-media` (Task 3)

**Step 1 fields state:**
```typescript
name, email, phone, atelierName, website, discipline
```

**Step 2 fields state:**
```typescript
address, postalCode, city, country ('FR'), description, hours: DayHours[]
```

**Step 3 files state:**
```typescript
photoInterior: File | null
photoExterior1: File | null
photoExterior2: File | null
photoOwner: File | null
```

- [ ] **Step 1: Réécrire `components/sections/RegisterSection.tsx`**

```typescript
'use client'

import { useRef, useState } from 'react'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'
import HoursGrid, { defaultHours, DayHours } from '@/components/ui/HoursGrid'
import PhotoUploadZone from '@/components/ui/PhotoUploadZone'

export default function RegisterSection({ dict }: { dict: Dictionary }) {
  const d = dict.register
  const sectionRef = useRef<HTMLDivElement>(null)
  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [atelierName, setAtelierName] = useState('')
  const [website, setWebsite] = useState('')
  const [discipline, setDiscipline] = useState('')

  // Step 2
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('FR')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState<DayHours[]>(defaultHours())

  // Step 3
  const [photoInterior, setPhotoInterior] = useState<File | null>(null)
  const [photoExterior1, setPhotoExterior1] = useState<File | null>(null)
  const [photoExterior2, setPhotoExterior2] = useState<File | null>(null)
  const [photoOwner, setPhotoOwner] = useState<File | null>(null)

  const inputCls = 'w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display'

  const handleNext = () => setStep((s) => Math.min(s + 1, 3))
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!photoInterior || !photoExterior1 || !photoExterior2 || !photoOwner) {
      setErrorMsg(d.errorPhotos)
      return
    }

    setSubmitting(true)

    try {
      // 1. Créer la location GMB
      const openPeriods = hours
        .filter((h) => h.open)
        .map((h) => ({
          openDay: h.day,
          closeDay: h.day,
          openTime: h.openTime,
          closeTime: h.closeTime,
        }))

      const createRes = await fetch('/api/gmb/create-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: atelierName,
          phone,
          addressLine: address,
          postalCode,
          locality: city,
          regionCode: country,
          websiteUri: website || undefined,
          description: description || undefined,
          hours: openPeriods.length > 0 ? openPeriods : undefined,
        }),
      })

      if (!createRes.ok) {
        setErrorMsg(d.errorGeneric)
        setSubmitting(false)
        return
      }

      const { locationName } = await createRes.json()

      // 2. Uploader les 4 photos
      const photoUploads: Array<{ file: File; category: string }> = [
        { file: photoInterior, category: 'INTERIOR' },
        { file: photoExterior1, category: 'EXTERIOR' },
        { file: photoExterior2, category: 'EXTERIOR' },
        { file: photoOwner, category: 'OWNER' },
      ]

      for (const { file, category } of photoUploads) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('category', category)
        fd.append('locationName', locationName)

        const uploadRes = await fetch('/api/gmb/upload-media', {
          method: 'POST',
          body: fd,
        })

        if (!uploadRes.ok) {
          // Upload échoué non bloquant — la fiche est créée
          console.warn(`Photo upload failed for category ${category}`)
        }
      }

      setSuccess(true)
    } catch {
      setErrorMsg(d.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setStep(1)
    setName(''); setEmail(''); setPhone(''); setAtelierName(''); setWebsite(''); setDiscipline('')
    setAddress(''); setPostalCode(''); setCity(''); setCountry('FR'); setDescription(''); setHours(defaultHours())
    setPhotoInterior(null); setPhotoExterior1(null); setPhotoExterior2(null); setPhotoOwner(null)
    setErrorMsg(null)
  }

  return (
    <section id="register" className="relative py-20 lg:py-28 bg-background border-b border-white/10 text-white">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header section */}
        <div className="text-center mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-display block">{d.eyebrow}</span>
          <p className="text-white/50 text-xs font-light font-sans">{d.subtitle}</p>
        </div>

        <div ref={sectionRef} className="bg-canvas border border-borderLight p-8 sm:p-12 shadow-2xl space-y-8 relative text-inkBlack">

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-0">
            {(d.stepLabels as string[]).map((label: string, i: number) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`h-7 w-7 flex items-center justify-center text-[10px] font-display border transition-colors
                    ${step === i + 1 ? 'bg-inkBlack text-white border-inkBlack' : step > i + 1 ? 'bg-gold text-white border-gold' : 'bg-white text-grayText border-borderLight'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-display hidden sm:block transition-colors
                    ${step === i + 1 ? 'text-inkBlack' : 'text-grayText'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`w-16 h-px mx-2 mb-4 transition-colors ${step > i + 1 ? 'bg-gold' : 'bg-borderLight'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit} className="space-y-6">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-grayText font-display block">{d.formEyebrow}</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-light text-inkBlack">{d.formTitle}</h2>
                  <p className="text-xs text-grayText max-w-md mx-auto font-light font-sans">{d.formSubtitle}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldName}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldEmail}</label>
                    <input type="email" required className={inputCls} placeholder={d.fieldEmailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldAtelier}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldAtelierPlaceholder} value={atelierName} onChange={(e) => setAtelierName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldPhone}</label>
                    <input type="tel" required className={inputCls} placeholder={d.fieldPhonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldDiscipline}</label>
                    <select required className={inputCls} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                      <option value="">{d.fieldDisciplinePlaceholder}</option>
                      {d.disciplines.map((disc: { value: string; label: string }) => (
                        <option key={disc.value} value={disc.value}>{disc.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldWebsite}</label>
                    <input type="url" className={inputCls} placeholder={d.fieldWebsitePlaceholder} value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-inkBlack border-borderLight" />
                  <span className="text-[11px] text-grayText font-light leading-snug font-sans">{d.consent}</span>
                </label>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className={labelCls}>{d.fieldAddress}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldAddressPlaceholder} value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldPostalCode}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldPostalCodePlaceholder} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldCity}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldCityPlaceholder} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>{d.fieldCountry}</label>
                  <select required className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
                    {(d.countries as Array<{ value: string; label: string }>).map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>{d.fieldDescription}</label>
                  <textarea
                    className={`${inputCls} resize-none h-24`}
                    placeholder={d.fieldDescriptionPlaceholder}
                    maxLength={750}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <span className="text-[9px] text-grayText font-sans">{description.length}/750</span>
                </div>

                <div className="space-y-3">
                  <label className={labelCls}>{d.fieldHours}</label>
                  <HoursGrid value={hours} onChange={setHours} labels={d.hoursLabels as Parameters<typeof HoursGrid>[0]['labels']} />
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-light text-inkBlack">{d.photosTitle}</h3>
                  <p className="text-xs text-grayText font-sans">{d.photosSubtitle}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <PhotoUploadZone label={d.photoInterior} hint={d.photoHint} value={photoInterior} onChange={setPhotoInterior} />
                  <PhotoUploadZone label={d.photoExterior1} hint={d.photoHint} value={photoExterior1} onChange={setPhotoExterior1} />
                  <PhotoUploadZone label={d.photoExterior2} hint={d.photoHint} value={photoExterior2} onChange={setPhotoExterior2} />
                  <PhotoUploadZone label={d.photoOwner} hint={d.photoHint} value={photoOwner} onChange={setPhotoOwner} />
                </div>

                {errorMsg && (
                  <p className="text-center text-xs text-red-600 font-sans">{errorMsg}</p>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className={`flex gap-4 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button type="button" onClick={handlePrev} className="btn-mag">
                  {d.btnPrev}
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-action justify-center py-4 text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? d.btnSubmitting : step < 3 ? d.btnNext : d.submit}
              </button>
            </div>

            {step === 1 && (
              <div className="text-center pt-2">
                <span className="text-[9px] text-grayText tracking-wider block font-sans">{d.privacy}</span>
              </div>
            )}
          </form>

          {/* Success overlay */}
          {success && (
            <div className="absolute inset-0 bg-canvas/95 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="h-14 w-14 border border-inkBlack flex items-center justify-center text-inkBlack text-2xl">✓</div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-inkBlack">{d.successTitle}</h3>
                <p className="text-xs text-grayText max-w-md mx-auto font-sans">{d.successDesc}</p>
              </div>
              <button onClick={handleReset} className="btn-mag">{d.successReset}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude && npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 3: Lancer le serveur dev et tester visuellement**

```bash
pnpm dev
```

Vérifier dans le navigateur :
1. Le stepper s'affiche avec 3 étapes
2. Step 1 → clic "Suivant" → Step 2 s'affiche
3. Step 2 → clic "Retour" → retour Step 1
4. Step 3 → zones photo drag-and-drop fonctionnelles (preview s'affiche)
5. Submit sans photos → message d'erreur s'affiche

- [ ] **Step 4: Commit**

```bash
git add components/sections/RegisterSection.tsx
git commit -m "feat: refactor RegisterSection into 3-step GMB form with photo uploads"
```

---

### Task 8: Variables d'environnement (documentation manuelle)

**Files:**
- Modify: `.env.local` (manuel — ne pas committer)
- Create: `.env.local.example` (à committer)

- [ ] **Step 1: Créer `.env.local.example`**

```bash
cat > /home/gilles/DEV/IN_REAL_ART/landing_artitude/.env.local.example << 'EOF'
# Google Business Profile API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_GMB_ACCOUNT_ID=accounts/XXXXXXXXXX
EOF
```

- [ ] **Step 2: Vérifier que `.env.local` est dans `.gitignore`**

```bash
grep -n "\.env\.local" /home/gilles/DEV/IN_REAL_ART/landing_artitude/.gitignore
```

Attendu : une ligne avec `.env.local`

- [ ] **Step 3: Commit**

```bash
git add .env.local.example
git commit -m "docs: add .env.local.example for GMB API credentials"
```

---

### Task 9: Test end-to-end (avec vraies credentials GMB)

> Prérequis : `.env.local` configuré avec les vraies valeurs GMB

- [ ] **Step 1: Obtenir le refresh token manuellement (si pas déjà fait)**

```
1. Aller sur https://console.cloud.google.com
2. Activer "Google Business Profile API"
3. Créer OAuth2 credentials (Web application)
4. Ajouter redirect URI: http://localhost:3000/api/auth/callback
5. Générer l'URL d'autorisation :
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID&
     redirect_uri=http://localhost:3000&
     response_type=code&
     scope=https://www.googleapis.com/auth/business.manage&
     access_type=offline&
     prompt=consent
6. Récupérer le code dans l'URL de retour
7. Échanger contre un refresh token :
   POST https://oauth2.googleapis.com/token
   { code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code' }
8. Copier refresh_token dans .env.local
```

- [ ] **Step 2: Lancer le serveur et remplir le formulaire complet**

```bash
pnpm dev
```

- Remplir Step 1 (infos + téléphone)
- Remplir Step 2 (adresse complète + horaires)
- Uploader 4 photos au Step 3
- Soumettre

- [ ] **Step 3: Vérifier dans Google Business Profile**

Aller sur https://business.google.com → vérifier que la nouvelle fiche apparaît avec les photos.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: complete GMB RegisterSection — 3-step form with location creation and photo upload"
```

---

## Self-Review

### Spec coverage check

| Requirement spec | Task couvrant |
|-----------------|---------------|
| Token admin statique (refresh token .env) | Task 1 — `getAccessToken()` |
| Créer location via `accounts.locations.create` | Task 2 — Route Handler |
| Upload 4 photos (INTERIOR ×1, EXTERIOR ×2, OWNER ×1) | Task 3 — Route Handler |
| Formulaire multi-steps 3 étapes | Task 7 — RegisterSection |
| Step 1 : name, email, phone, atelier, website, discipline | Task 7 |
| Step 2 : address, postalCode, city, country, description, hours | Task 7 |
| Step 3 : 4 zones photo drag-and-drop | Task 7 + Task 5 |
| Grille horaires lun-dim avec open/close/fermé | Task 4 — HoursGrid |
| Zone drag-and-drop avec preview | Task 5 — PhotoUploadZone |
| i18n FR + EN toutes nouvelles clés | Task 6 |
| Variables d'environnement documentées | Task 8 |
| Test end-to-end | Task 9 |

### Vérifications types

- `DayHours` défini dans Task 4, consommé dans Task 7 ✓
- `defaultHours()` défini dans Task 4, appelé dans Task 7 ✓
- `PhotoUploadZoneProps.onChange: (file: File | null) => void` défini Task 5, appelé Task 7 ✓
- `HoursGridProps.labels` typé exactement, passé avec cast Task 7 ✓
- Route Handler Task 2 retourne `{ locationName: string }`, consommé dans Task 7 ✓
- Route Handler Task 3 attend `FormData { file, category, locationName }`, envoyé Task 7 ✓

### Placeholders scan

Aucun TBD, TODO ou placeholder détecté.
