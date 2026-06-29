# Spec — Landing Artitude Next.js

**Date:** 2026-06-29  
**Statut:** Approuvé

---

## 1. Périmètre

Conversion du fichier `templates/page.html` en application Next.js 14 (App Router) avec TypeScript strict, Tailwind CSS v3, et GSAP pour toutes les animations. Le projet est placé à la racine du repo `landing_artitude/`.

Formulaire d'inscription : simulé (overlay succès côté client uniquement, Server Action plus tard).  
Images : URLs Unsplash conservées (R2 plus tard).  
Backend : aucun pour ce sprint.

---

## 2. Stack technique

| Couche | Choix |
|---|---|
| Framework | Next.js 14 App Router |
| Langage | TypeScript strict |
| Styles | Tailwind CSS v3 + tokens custom |
| Animations | GSAP + ScrollTrigger |
| Fonts | Google Fonts (Cormorant Garamond, Montserrat, Unbounded) |
| Images | `next/image` + URLs Unsplash |

---

## 3. Direction artistique (DA)

Conforme à `docs/design-system-DA-report.md`.

### Palette

| Token | Valeur | Usage |
|---|---|---|
| `--background` | `#131313` | Fond dark principal |
| `--text` | `#ffffff` | Texte dark |
| `--gold-accent` | `#b89c72` | Accent premium, hovers |
| `--canvas-bg` | `#ffffff` | Sections light |
| `--ink-black` | `#000000` | Encre sections light |
| `--soft-gray` | `#f8f8f8` | Fonds cartes light |
| `--border-light` | `#eeeeee` | Bordures light |
| `--gray-text` | `#666666` | Texte muted |

Mode dark forcé globalement. Sections alternées light (`#ffffff`) pour Problem, Solution, Register.

### Typographie

| Rôle | Police | Poids |
|---|---|---|
| Titres éditoriaux | Cormorant Garamond | 300, italic |
| Corps / labels | Montserrat | 300 |
| UI / display technique | Unbounded | 200–600 |

### Boutons

- `btn-cta` : outline transparent → fill dark au hover
- `btn-action` : fill dark → gold au hover
- `btn-mag` : underline → gold au hover

### Composants

- Cards artwork : grayscale brightness, zoom `scale(1.03)` au hover
- Portraits équipe : `grayscale(100%)` → `grayscale(0%)` + `scale(1.08)` au hover
- Advantage boxes : `border-top` gold au hover

---

## 4. Structure de fichiers

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── SolutionSection.tsx
│   │   ├── IndexSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── CatalogSection.tsx
│   │   ├── RegisterSection.tsx
│   │   └── FaqSection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── SectionHeader.tsx
│       ├── StatCard.tsx
│       ├── FaqItem.tsx
│       ├── AtelierCard.tsx
│       └── AnnouncementBanner.tsx
├── lib/
│   └── gsap.ts
├── hooks/
│   └── useGsapReveal.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 5. Animations GSAP

| Élément | Animation |
|---|---|
| Hero h1 | SplitText fade-up stagger par mot |
| Hero sous-titre + CTA | fade-up avec delay |
| Toutes sections | `useGsapReveal` : fade + translateY(40px) → 0 au ScrollTrigger |
| Stats counters | Compteur numérique animé déclenché à l'entrée viewport |
| Map pins → card preview | opacity + translateY GSAP |
| FAQ accordion | Height tween GSAP (pas de max-height CSS) |
| Header | Backdrop + border-bottom au scroll |
| Portraits | CSS transition grayscale + scale |

Hook `useGsapReveal(ref, options?)` : attache un ScrollTrigger fade-up sur n'importe quel ref DOM. Options : `delay`, `duration`, `y`.

---

## 6. Composants réutilisables

### `SectionHeader`
Props : `eyebrow`, `title`, `titleItalic?`, `centered?`  
Génère : eyebrow text + h2 avec portion italic + divider `w-12 h-[1px]`.

### `Button`
Props : `variant: 'cta' | 'action' | 'mag'`, `href?`, `onClick?`, `children`  
Encapsule les 3 styles de boutons DA.

### `StatCard`
Props : `label`, `target`, `suffix`, `description`, `barWidth`  
Anime le chiffre de 0 à `target` via GSAP quand visible.

### `FaqItem`
Props : `question`, `answer`  
Accordion GSAP height tween, icône `+` rotate 45°.

### `AtelierCard`
Props : `name`, `role`, `service`, `description`, `imageSrc`  
Card équipe avec portrait grayscale → couleur au hover.

### `AnnouncementBanner`
Props : `text`, `highlight`  
Barre d'annonce top-page.

---

## 7. Page sections (ordre)

1. `AnnouncementBanner` (hors sections)
2. `HeroSection` — dark, Google mock widget
3. `ProblemSection` — light, 3 cards
4. `SolutionSection` — light, 3 steps
5. `IndexSection` — light, map interactif
6. `StatsSection` — dark-premium, 4 stats + 2 testimonials
7. `CatalogSection` — light, 4 colonnes équipe
8. `RegisterSection` — light, formulaire simulé
9. `FaqSection` — light, 5 accordions

---

## 8. Ce qui est hors scope

- Backend / Server Actions (formulaire simulé uniquement)
- Cloudflare R2 (images Unsplash pour l'instant)
- Dark mode toggle (dark forcé globalement)
- i18n
- Tests
