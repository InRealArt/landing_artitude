# GMB RegisterSection — Design Spec

**Date:** 2026-06-29  
**Feature:** Création automatique d'établissement Google Business Profile depuis le formulaire d'inscription Artitude

---

## Objectif

Transformer `RegisterSection.tsx` en un formulaire multi-étapes (3 steps) qui, à la soumission, crée automatiquement une fiche Google Business Profile (GMB) dans le compte admin InRealArt, avec upload de 4 photos (1 intérieur, 2 extérieur, 1 propriétaire).

---

## Authentification

**Approche : Token admin statique**

- Un refresh token OAuth2 est obtenu une fois manuellement pour le compte GMB admin InRealArt
- Stocké en variable d'environnement `GOOGLE_REFRESH_TOKEN`
- Chaque appel API échange le refresh token contre un access token via `https://oauth2.googleapis.com/token`
- L'artiste ne se connecte pas à Google — il remplit simplement le formulaire

**Variables d'environnement requises :**
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_GMB_ACCOUNT_ID=   # format: accounts/XXXXXXXXXX
```

**Scope OAuth2 :** `https://www.googleapis.com/auth/business.manage`

---

## Formulaire multi-étapes

### Step 1 — Informations de base

| Champ | Type | GMB field | Requis |
|-------|------|-----------|--------|
| Nom & Prénom | text | (contact info) | oui |
| Email | email | (contact info) | oui |
| Téléphone | tel | `phoneNumbers.primaryPhone` | oui |
| Nom de l'atelier | text | `title` | oui |
| Site web | url | `websiteUri` | non |
| Discipline artistique | select | (metadata) | oui |

### Step 2 — Localisation & Horaires

| Champ | Type | GMB field | Requis |
|-------|------|-----------|--------|
| Adresse (rue + numéro) | text | `storefrontAddress.addressLines[0]` | oui |
| Code postal | text | `storefrontAddress.postalCode` | oui |
| Ville | text | `storefrontAddress.locality` | oui |
| Pays | select (défaut: FR) | `storefrontAddress.regionCode` | oui |
| Description atelier | textarea (max 750 chars) | `profile.description` | non |
| Horaires lun-dim | grille (open/close/fermé) | `regularHours.periods` | non |

### Step 3 — Photos

| Zone | Catégorie GMB | Quantité | Requis |
|------|---------------|----------|--------|
| Photo intérieur | `INTERIOR` | 1 | oui |
| Photo extérieur 1 | `EXTERIOR` | 1 | oui |
| Photo extérieur 2 | `EXTERIOR` | 1 | oui |
| Photo propriétaire | `OWNER` | 1 | oui |

**Contraintes photo :** JPG/PNG/WebP, max 10 MB par fichier, min 250px par côté.

---

## API GMB utilisées

### 1. Création de location

```
POST https://mybusinessbusinessinformation.googleapis.com/v1/{accountId}/locations
```

Payload minimal :
```json
{
  "languageCode": "fr",
  "title": "Atelier Boyer Art",
  "phoneNumbers": { "primaryPhone": "0600000000" },
  "storefrontAddress": {
    "addressLines": ["48 rue des Artistes"],
    "locality": "Nice",
    "postalCode": "06000",
    "administrativeArea": "",
    "regionCode": "FR"
  },
  "websiteUri": "https://...",
  "regularHours": { "periods": [...] },
  "categories": { "primaryCategory": { "name": "gcid:art_studio" } },
  "profile": { "description": "..." }
}
```

### 2. Upload photo (bytes)

**Étape A — Initier l'upload :**
```
POST https://mybusiness.googleapis.com/v4/{accountId}/{locationName}/media:startUpload
```
Retourne `{ resourceName: "media/..." }`

**Étape B — Envoyer les bytes :**
```
POST https://mybusinessmedia.googleapis.com/upload/v1/media/{resourceName}?upload_type=media
Content-Type: image/jpeg
[bytes de l'image]
```

**Étape C — Finaliser :**
```
POST https://mybusiness.googleapis.com/v4/{accountId}/{locationName}/media
{
  "mediaFormat": "PHOTO",
  "locationAssociation": { "category": "INTERIOR" },
  "dataRef": { "resourceName": "GoogleProvidedValue" }
}
```

Catégories utilisées : `INTERIOR`, `EXTERIOR`, `OWNER`

---

## Architecture fichiers

```
lib/
  gmb-client.ts                          — OAuth2 refresh + helpers fetch GMB

app/
  api/
    gmb/
      create-location/
        route.ts                         — POST: crée la location GMB
      upload-media/
        route.ts                         — POST: upload 1 photo vers GMB

components/
  sections/
    RegisterSection.tsx                  — Formulaire multi-steps (refactorisé)
  ui/
    PhotoUploadZone.tsx                  — Zone drag-and-drop photo réutilisable
    HoursGrid.tsx                        — Grille horaires lun-dim

dictionaries/
  fr.json                                — Clés i18n enrichies (register.*)
  en.json                                — Clés i18n enrichies (register.*)
```

---

## Flow de soumission

```
Submit (Step 3)
  → POST /api/gmb/create-location
       body: { formData step1+step2 }
       → gmb-client.getAccessToken() — refresh token → access token
       → accounts.locations.create
       → retourne { locationName: "accounts/.../locations/..." }

  → Pour chaque photo (4 appels séquentiels) :
       POST /api/gmb/upload-media
       body: FormData { file: File, category: string, locationName: string }
       → gmb-client.getAccessToken()
       → startUpload → obtenir resourceName
       → PUT bytes
       → POST media.create avec dataRef

  → success === true → affichage overlay succès (comportement actuel conservé)
  → error → message d'erreur inline sous le bouton submit
```

---

## UI — Stepper

- Indicateur de progression : 3 pastilles numérotées en haut du formulaire (style gold/dark existant)
- Navigation : bouton "Suivant" valide le step courant avant de passer au suivant
- Bouton "Précédent" disponible sur steps 2 et 3
- Validation par step (pas de soumission globale avant step 3)
- État de chargement sur le bouton submit final (spinner + "Création en cours...")

---

## Internationalisation

Nouvelles clés à ajouter dans `register.*` pour fr.json et en.json :
- Labels de chaque nouveau champ
- Labels des étapes du stepper
- Messages d'erreur de validation
- Labels zones photos
- Labels jours de la semaine pour la grille horaires
- Message d'erreur GMB API générique

---

## Ce qui est hors-scope

- OAuth utilisateur (chaque artiste connecte son propre compte)
- Vérification automatique de la fiche GMB (nécessite intervention manuelle Google)
- Stockage des données en base de données
- Emails de confirmation
