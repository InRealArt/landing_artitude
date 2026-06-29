# Rapport de Direction Artistique — In Real Art

> Document destiné à être fourni à une IA pour recréer un site avec la même identité visuelle.

---

## 1. Palette de couleurs

### Tokens CSS (variables globales)

```css
:root {
  /* Fondation */
  --background: #131313;        /* Noir charbon — fond principal dark */
  --card: #1d1c1c;              /* Carte en dark */
  --text: #ffffff;              /* Texte principal dark */
  --purple: #6052ff;            /* Accent tech / blockchain */

  /* Palette Galerie */
  --gold-accent: #b89c72;       /* Or doux — accent principal premium */
  --canvas-bg: #ffffff;         /* Fond blanc galerie (light) */
  --ink-black: #000000;         /* Encre noire (light) / blanc (dark) */
  --soft-gray: #f8f8f8;         /* Gris doux pour fonds de cartes */
  --border-light: #eeeeee;      /* Bordures légères */

  /* Layout */
  --header-height: 90px;
  --footer-height: 300px;
}
```

### Mode clair (`[data-theme='light']`)

```css
[data-theme='light'] {
  --background: #ffffff;
  --background-rgb: 255 255 255;
  --text: #000000;
  --card: #fbfbfb;
  --purple: #6052ff;
  --gradient-start: rgba(255, 255, 255, 0.9);
  --gradient-end: rgba(255, 255, 255, 0);
  --border-color: #eeeeee;
  --stroke-color: rgba(0, 0, 0, 0.3);
  --shadow-color: rgba(0, 0, 0, 0.08);
  --gradient-from: #f8f8f8;
  --gradient-to: #eeeeee;
  --gray-text: #666666;
  --background-grey: #fbfbfb;
  --canvas-bg: #ffffff;
  --gold-accent: #b89c72;
  --ink-black: #000000;
  --soft-gray: #f8f8f8;
  --border-light: #eeeeee;
}
```

### Mode sombre (`[data-theme='dark']`)

```css
[data-theme='dark'] {
  --background: #131313;
  --background-rgb: 19 19 19;
  --text: #ffffff;
  --card: #1d1c1c;
  --purple: #6052ff;
  --gradient-start: rgba(0, 0, 0, 0.9);
  --gradient-end: rgba(255, 255, 255, 0);
  --border-color: rgba(255, 255, 255, 0.1);
  --stroke-color: rgba(255, 255, 255, 0.3);
  --shadow-color: rgba(255, 255, 255, 0.08);
  --gradient-from: #111827;
  --gradient-to: #1f2937;
  --gray-text: #9ca3af;
  --background-grey: #1a1a1a;
  --canvas-bg: #131313;
  --soft-gray: #1f1f1f;
  --border-light: #2a2a2a;
  --ink-black: #ffffff;   /* Inversé en dark */
}
```

### Section premium dark (noir forcé même en light mode)

```css
.section-dark-premium {
  background-color: #0f0f0f;
  color: #ffffff;
}

[data-theme='dark'] .section-dark-premium {
  background-color: var(--background);
  color: var(--text);
}
```

---

## 2. Typographie

### 4 polices principales (Google Fonts)

| Rôle | Police | Variable CSS | Poids |
|---|---|---|---|
| Titres galerie / éditorial | **Cormorant Garamond** | `--font-cormorant` | 300, souvent italic |
| Corps de texte | **Montserrat** | `--font-montserrat` | 300 (light) |
| Titres techniques / display | **Unbounded** | `--font-unbounded` | 200–900 |
| Corps alternatif | **Bricolage Grotesque** | `--font-bricolage` | 200–800 |

### Règles CSS globales

```css
/* Titres = Cormorant, poids léger */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-cormorant), serif;
  font-weight: 300;
  font-style: normal; /* souvent italic en contexte éditorial */
}

/* Corps de texte = Montserrat léger */
p, span, body {
  font-family: var(--font-montserrat), sans-serif;
  font-weight: 300;
  font-optical-sizing: auto;
}

/* Classe utilitaire serif (titres galerie) */
.serif {
  font-family: var(--font-cormorant), serif;
  font-weight: 300;
}
```

### Patterns typographiques récurrents

```css
/* Eyebrow / numéro de section */
.section-number {
  font-size: 0.6rem;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: #aaa;
  font-family: var(--font-montserrat), sans-serif;
  margin-bottom: 1.5rem;
  display: block;
}

/* Navigation links */
font-size: 13px;
text-transform: uppercase;
letter-spacing: 0.25em;

/* Labels / tags / figcaptions */
font-size: 0.65–0.7rem;
text-transform: uppercase;
letter-spacing: 0.2–0.3em;

/* Chiffres décoratifs (steps, processus) */
.step-number {
  font-family: var(--font-cormorant), serif;
  font-size: 3rem;
  color: var(--gold-accent);
  opacity: 0.5;
  line-height: 1;
}
```

---

## 3. Boutons

### `btn-cta` — Bouton principal galerie (outline)

```css
.btn-cta {
  padding: 0.9rem 1.8rem;
  border: 1px solid var(--ink-black);
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  background: transparent;
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  cursor: pointer;
  font-family: var(--font-montserrat), sans-serif;
}

.btn-cta:hover {
  background: var(--ink-black);
  color: var(--background);
}

/* Dans une section dark-premium */
.section-dark-premium .btn-cta {
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff;
}
.section-dark-premium .btn-cta:hover {
  background: #ffffff;
  color: #0f0f0f;
}
```

### `btn-action` — Bouton CTA rempli (fill → gold au hover)

```css
.btn-action {
  background: var(--ink-black);
  color: var(--canvas-bg);
  padding: 1rem 2rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  transition: background 0.3s ease;
  cursor: pointer;
  font-family: var(--font-montserrat), sans-serif;
  display: inline-block;
}

.btn-action:hover {
  background: var(--gold-accent);
}
```

### `btn-mag` — Lien magazine (soulignement doré)

```css
.btn-mag {
  border-bottom: 1.5px solid var(--ink-black);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
  transition: color 0.3s ease, border-color 0.3s ease;
  display: inline-block;
  font-family: var(--font-montserrat), sans-serif;
}

.btn-mag:hover {
  color: var(--gold-accent);
  border-color: var(--gold-accent);
}
```

### Bouton pill header (Artitude Join)

```css
/* Dark fill → gold au hover */
background: var(--text);
color: var(--background);
font-size: 10px;
font-family: var(--font-unbounded), sans-serif;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
padding: 8px 12px;
border-radius: 8px;
transition: background 0.2s ease, color 0.2s ease;

/* hover */
background: var(--gold-accent);
color: #ffffff;
```

---

## 4. Composants UI

### Header

```css
/* Barre fixe */
position: fixed;
top: 0; left: 0; right: 0;
height: 90px;                              /* mobile: 64px */
background: rgba(var(--background-rgb) / 0.95);
backdrop-filter: blur(12px);
border-bottom: 1px solid var(--border-color);
z-index: 50;
max-width: 1536px; margin: 0 auto;
padding: 0 2.5rem;                         /* mobile: 0.75rem */

/* Logo */
font-family: var(--font-cormorant), serif;
font-weight: 300;
text-transform: uppercase;
letter-spacing: 0.4em;
font-size: 1.25rem;                        /* responsive: 0.875rem → 1.25rem */

/* Nav links */
font-size: 13px;
text-transform: uppercase;
letter-spacing: 0.25em;
color: var(--text);
transition: color 0.2s;
/* Active / hover: color = var(--gold-accent) */
/* Active underline: position absolute, bottom, 1px, bg gold */
```

### Cards artwork (galerie)

```css
.artwork-image {
  background-color: #f9f9f9;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.artwork-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.artwork-container {
  transition: opacity 0.4s ease;
}

.artwork-container:hover { opacity: 0.9; }
.artwork-container:hover .artwork-image img { transform: scale(1.03); }
```

### Portraits d'équipe (grayscale → couleur)

```css
.member-image {
  filter: grayscale(100%);
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.member-card:hover .member-image {
  filter: grayscale(0%);
  transform: scale(1.08);
}
```

### Advantage boxes (sections processus)

```css
.advantage-box {
  padding: 3rem;
  background: var(--soft-gray);
  border-top: 1px solid var(--border-light);
  transition: all 0.5s ease;
}

.advantage-box:hover {
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
  border-top-color: var(--gold-accent);
}
```

### Tags / badges pill

```css
.tag-badge {
  padding: 0.25rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--text);
  background: transparent;
}
```

### Footer links

```css
.footer-link {
  font-size: 0.8rem;
  color: var(--gray-text);
  transition: color 0.3s, transform 0.3s;
  display: block;
  margin-bottom: 0.6rem;
  font-family: var(--font-montserrat), sans-serif;
}

.footer-link:hover {
  color: var(--ink-black);
  transform: translateX(5px);
}
```

### Artist list items

```css
.artist-list-item {
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  color: var(--gray-text);
  margin-bottom: 0.4rem;
  display: block;
  font-family: var(--font-montserrat), sans-serif;
}

.artist-list-item:hover {
  color: var(--gold-accent);
}
```

---

## 5. Animations & transitions

### Easings signatures

```css
/* "Expo out" — tous les grands mouvements UI */
cubic-bezier(0.19, 1, 0.22, 1)

/* "Back out" — zooms image */
cubic-bezier(0.16, 1, 0.3, 1)

/* Standard */
0.3s ease
0.5s ease
```

### Keyframes CSS

```css
/* Entrée de bas en haut */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* usage: 0.8s ease-out, delay 0.2s–0.38s */

/* Entrée de droite */
@keyframes fade-right {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
/* usage: 0.9s ease-out, delay 0.38s */

/* Marquee infini */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
/* usage: 18s linear infinite */

/* Révélation clip-path */
@keyframes revealTopToBottom {
  from { clip-path: inset(0 0 100% 0); }
  to   { clip-path: inset(0 0 0% 0); }
}
```

### GSAP (HomeHero)

- Timeline sur changement de persona : fade + translateY sur headline / subheadline / CTA
- Hover sur cards : `scale(1.02–1.05)`
- Kill de la timeline à chaque changement de persona pour éviter les overlaps

---

## 6. Effets texte & décoratifs

```css
/* Texte outlined */
.stroke {
  -webkit-text-stroke: 1px var(--stroke-color);
  text-stroke: 1px var(--stroke-color);
  text-shadow: 0 0 13px var(--shadow-color);
}

/* Ligne de roadmap verticale (gradient violet) */
.roadmap-line::before {
  content: '';
  width: 100%;
  height: 3%;
  position: absolute;
  top: 0;
  background: linear-gradient(#131313 0%, #6052ff 100%);
  z-index: 20;
}

/* Point circulaire violet */
.roadmap-line::after {
  content: '';
  width: 30px;
  height: 30px;
  position: absolute;
  top: 3%;
  left: -11px;
  background: #6052ff;
  border-radius: 50%;
  z-index: 20;
}
```

---

## 7. Layout & grille

```css
/* Conteneurs max */
max-width: 1536px;   /* header / footer (screen-2xl) */
max-width: 1440px;   /* images pleine largeur */

/* Padding horizontal standard */
/* mobile: px-3, sm: px-6, lg: px-10 */

/* Grille cards (spacing Tailwind custom) */
--card:       calc(100% / 4 - 1rem);         /* 4 colonnes desktop */
--cardLarge:  calc(100% / 3 - 1rem);         /* 3 colonnes */
--cardMobile: calc(100% / 2 - 0.5rem);       /* 2 colonnes mobile */

/* Body */
width: 100%;
overflow-x: hidden;
scroll-behavior: smooth;
```

---

## 8. Gradients de fondu (carrousels)

```css
/* Fondu bord gauche */
.bg-gradient::before {
  content: '';
  height: 100%;
  width: 10%;
  position: absolute;
  left: -3px; top: 0;
  background: linear-gradient(90deg, var(--gradient-start) 0%, var(--gradient-end) 50%);
  z-index: 20;
  pointer-events: none;
}

/* Fondu bord droit */
.bg-gradient::after {
  content: '';
  height: 100%;
  width: 10%;
  position: absolute;
  right: -3px; top: 0;
  background: linear-gradient(90deg, var(--gradient-end) 50%, var(--gradient-start) 100%);
  z-index: 20;
  pointer-events: none;
}
```

---

## 9. Typographie blog / éditorial

```css
/* Conteneur article */
#blog-content-container {
  font-family: var(--font-montserrat), sans-serif;
  font-weight: 300;
  line-height: 1.8;
  color: var(--ink-black);
  font-size: 0.875rem;
}

/* H1 éditorial */
h1 {
  font-family: var(--font-cormorant), serif;
  font-size: 3rem;           /* mobile: 1.875rem */
  font-weight: 300;
  font-style: italic;
  line-height: 1.1;
  margin-bottom: 2rem;
}

/* H2 éditorial */
h2 {
  font-family: var(--font-cormorant), serif;
  font-size: 1.75rem;
  font-weight: 300;
  font-style: italic;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.75rem;
  margin-top: 3rem;
}

/* H3 */
h3 {
  font-family: var(--font-cormorant), serif;
  font-size: 1.3rem;
  font-weight: 300;
  font-style: italic;
}

/* Blockquote */
blockquote {
  border-left: 2px solid var(--gold-accent);
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  font-family: var(--font-cormorant), serif;
  font-size: 1.3rem;
  background: var(--soft-gray);
}

/* Paragraph intro */
.article-intro {
  font-size: 1rem;
  line-height: 1.9;
  color: var(--gray-text);
  border-left: 2px solid var(--gold-accent);
  padding-left: 1.5rem;
}

/* Figcaption */
figcaption {
  font-style: italic;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gray-text);
  border-top: 1px solid var(--border-light);
  padding: 0.75rem 1rem;
}

/* Meta (date, auteur) */
.article-meta {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gray-text);
}

/* Links dans article */
a {
  color: var(--ink-black);
  border-bottom: 1px solid var(--border-light);
  text-decoration: none;
  transition: border-color 0.3s;
}
a:hover { border-bottom-color: var(--gold-accent); }
```

---

## 10. Scrollbar custom

```css
.custom-scrollbar::-webkit-scrollbar       { width: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #888; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
```

---

## 11. Section dark-premium — helpers internes

```css
/* Texte principal */
.section-dark-premium .section-dark-text    { color: #ffffff; }

/* Texte secondaire */
.section-dark-premium .section-dark-muted   { color: rgba(255, 255, 255, 0.5); }

/* Cartes internes */
.section-dark-premium .section-dark-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

/* Bordure */
.section-dark-premium .section-dark-border  { border-color: rgba(255, 255, 255, 0.1); }

/* Input underline */
.section-dark-premium .section-dark-input-border { border-color: rgba(255, 255, 255, 0.2); }

/* Gap row entre cartes */
.section-dark-premium .section-dark-gap-bg  { background-color: rgba(255, 255, 255, 0.08); }
```

---

## 12. Résumé — Règles DA essentielles

| Principe | Valeur |
|---|---|
| Fond dark par défaut | `#131313` |
| Accent premium | Or `#b89c72` |
| Accent tech | Violet `#6052ff` |
| Police titre | Cormorant Garamond 300, souvent italic |
| Police corps | Montserrat 300 |
| Police UI / labels | Montserrat uppercase, letter-spacing large |
| Police heading display | Unbounded (sections techniques) |
| Bordures dark | `rgba(255, 255, 255, 0.1)` |
| Bordures light | `#eeeeee` |
| Transition principale | `0.5s cubic-bezier(0.19, 1, 0.22, 1)` |
| Zoom image | `scale(1.03–1.08)` + `cubic-bezier(0.16, 1, 0.3, 1)` |
| CTA style | Outline transparent → fill au hover |
| Hover couleur | Toujours `var(--gold-accent)` |
| Portraits | Grayscale par défaut → couleur au hover |
| Tone général | Galerie d'art contemporaine haut de gamme, minimaliste, épuré |
