# Artitude

Landing page du programme **Artitude** d'[InRealArt](https://www.inrealart.com) : un service gratuit qui rend les ateliers d'artistes visibles sur Google, sans qu'ils aient à s'en occuper.

**Production :** [artitude.inrealart.com](https://artitude.inrealart.com)

## Le cas d'usage

Beaucoup d'artistes n'ont pas de fiche Google à jour, et donc pas de présence sur les recherches locales. Le site leur présente l'offre et recueille en quelques minutes ce dont l'équipe a besoin pour créer leur fiche.

1. **L'artiste s'inscrit** via le formulaire de la section `#register` : coordonnées, adresse, horaires et photos.
2. **Le site prépare le dossier :** les photos partent sur Cloudflare R2, l'adresse est géocodée et un fichier Excel d'import Google Business Profile est généré.
3. **L'équipe reçoit le dossier par e-mail** avec l'Excel en pièce jointe et les liens vers les photos, puis se charge de la fiche.
4. **L'artiste est enregistré en base** (`Artist`, `ArtitudeArtist`, `ArtitudeArtistImages`).

> La fiche n'est pas créée automatiquement sur Google : le site s'arrête à l'envoi du dossier à l'équipe.

## Fonctionnalités

- **Page d'accueil multilingue** en français et en anglais (`/fr`, `/en`), avec une redirection selon la langue du navigateur (`proxy.ts`).
- **Carte interactive des ateliers** (Leaflet et fonds de carte CARTO). Elle affiche les fiches Google Business Profile si l'API répond, sinon une liste de démonstration.
- **Formulaire d'inscription** avec envoi des photos : photo principale, au moins une photo d'intérieur et photo du propriétaire obligatoires, 1 Mo maximum par photo.
- **Inscription à la newsletter** via Brevo.
- **Page de mentions légales** (`/[lang]/legal-notice`).

## Stack

| Domaine | Technologie |
|---|---|
| Framework | Next.js 16 (App Router), React 18, TypeScript |
| Interface | Tailwind CSS, GSAP, Leaflet |
| Données | Prisma 7, PostgreSQL |
| Stockage des photos | Cloudflare R2 |
| E-mails et newsletter | Brevo |
| Fichiers et images | ExcelJS, sharp |
| Hébergement | Vercel |

## Installation

**Prérequis :** Node.js, pnpm et un jeton GitHub *classic* avec le droit `read:packages`. Ce jeton est indispensable, car `@InRealArt/prisma-schema` est un paquet privé hébergé sur GitHub Packages.

```bash
# 1. Créer les fichiers d'environnement (voir le tableau ci-dessous)
cp .env.local.example .env.local
echo "GITHUB_TOKEN=votre_jeton" >> .env

# 2. Installer les dépendances avec le jeton chargé
npx dotenv-cli -e .env -- pnpm install

# 3. Générer le client Prisma
npx prisma generate

# 4. Lancer le site sur http://localhost:3000
pnpm dev
```

## Variables d'environnement

| Variable | Rôle | Fichier en local |
|---|---|---|
| `GITHUB_TOKEN` | Téléchargement du paquet privé `@InRealArt/prisma-schema` | `.env` |
| `DATABASE_URL` | Connexion PostgreSQL | `.env` |
| `NEXT_PUBLIC_CARTO_API_KEY` | Fonds de carte CARTO, visible dans le navigateur | `.env.local` |
| `BREVO_API_KEY` | E-mails transactionnels et newsletter | `.env.local` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Stockage des photos | `.env.local` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_GMB_ACCOUNT_ID` | Lecture des fiches Google pour la carte | `.env.local` |

Toutes ces variables doivent aussi être définies sur Vercel.

**Clés CARTO :** CARTO impose une clé distincte pour `localhost`. Utilisez donc la clé limitée à `localhost` dans `.env.local` et celle limitée à `artitude.inrealart.com` sur Vercel. Les [clés se créent ici](https://carto.com/basemaps/apikey/), et l'attribution OpenStreetMap / CARTO doit rester visible sur la carte.

## Commandes

| Commande | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Génère le client Prisma, puis compile le site avec webpack |
| `pnpm start` | Lance le site compilé |
| `pnpm update:schema:inrealart` | Met à jour `@InRealArt/prisma-schema`, remplace `prisma/schema.prisma` et régénère le client |

## Structure du projet

```text
app/[lang]/               Pages localisées (accueil, mentions légales)
app/api/gmb/              Inscription des ateliers et lecture des fiches Google
app/api/newsletter/       Inscription à la newsletter
components/sections/      Sections de la landing page
components/ui/            Composants réutilisables, dont LeafletMap
dictionaries/             Textes français et anglais
lib/                      Clients Brevo, R2, Google et Prisma, génération de l'Excel
prisma/schema.prisma      Copie du schéma partagé InRealArt, à ne pas modifier à la main
templates/GMB/            Modèle Excel d'import Google Business Profile
docs/superpowers/         Spécifications et plans de développement
```

## Bon à savoir

- **Build webpack :** `next build --webpack` est volontaire. Avec Turbopack, le binaire natif de `sharp` provoquait une erreur `dlopen` sur Vercel.
- **Erreur `ERR_PNPM_FETCH_401` au build :** le `GITHUB_TOKEN` est expiré ou révoqué. Remplacez-le sur Vercel et dans `.env`.
- **Filigrane « API KEY REQUIRED » sur la carte :** `NEXT_PUBLIC_CARTO_API_KEY` est absente, ou la clé n'autorise pas le domaine utilisé. Cette variable est lue au build : redéployez après l'avoir modifiée.
- **Destinataire des inscriptions :** l'adresse est définie par `RECIPIENT_EMAIL` dans `app/api/gmb/create-location/route.ts`.
- **Échec de l'enregistrement en base :** l'inscription reste valide, car l'e-mail est déjà parti. Une alerte est envoyée par e-mail à l'équipe.
