# Landing Artitude — Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `templates/page.html` en application Next.js 14 App Router TypeScript/Tailwind/GSAP avec la DA du design-system IRA (dark `#131313`, or `#b89c72`, Cormorant + Montserrat + Unbounded).

**Architecture:** App Router Next.js 14 à la racine du repo. Composants UI atomiques dans `components/ui/`, sections de page dans `components/sections/`, layout dans `components/layout/`. GSAP chargé côté client via un hook `useGsapReveal` réutilisable et un module `lib/gsap.ts`.

**Tech Stack:** Next.js 14, TypeScript strict, Tailwind CSS v3, GSAP + ScrollTrigger, Google Fonts (Cormorant Garamond + Montserrat + Unbounded), next/image.

## Global Constraints

- Next.js 14.2+ avec App Router uniquement (pas de Pages Router)
- TypeScript strict (`"strict": true` dans tsconfig)
- Tailwind CSS v3 (pas v4)
- GSAP free tier (ScrollTrigger inclus, pas SplitText premium — simuler avec spans)
- Pas de backend, pas de Server Actions pour ce sprint
- Images via URLs Unsplash + `next/image` avec `unoptimized` ou domaine configuré
- Formulaire : simulé côté client uniquement (overlay succès)
- DA : dark `#131313` global, sections light `#ffffff` pour Problem/Solution/Register/FAQ/Catalog
- Accent or : `#b89c72` sur tous les hovers de boutons `btn-action` et liens `btn-mag`
- Polices : Cormorant Garamond (titres), Montserrat (corps), Unbounded (UI labels)
- Commits fréquents après chaque tâche

---

## Task 1: Scaffolding Next.js + Config

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.gitignore` (update)

**Interfaces:**
- Produces: projet Next.js bootable sur `http://localhost:3000`

- [ ] **Step 1: Initialiser le projet Next.js**

```bash
cd /home/gilles/DEV/IN_REAL_ART/landing_artitude
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```
Répondre `Yes` à toutes les prompts. Cela crée `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `postcss.config.js`, `app/`, `public/`.

- [ ] **Step 2: Configurer next.config.ts pour autoriser les images Unsplash**

Remplacer le contenu de `next.config.ts` par :

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Installer GSAP**

```bash
npm install gsap
```

- [ ] **Step 4: Vérifier que le projet démarre**

```bash
npm run dev
```
Ouvrir `http://localhost:3000` — la page Next.js par défaut doit s'afficher sans erreur.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 App Router with Tailwind + GSAP"
```

---

## Task 2: Tokens DA + globals.css + tailwind.config

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: classes Tailwind `bg-background`, `text-gold`, `font-serif`, `font-sans`, `font-display` + variables CSS `--gold-accent`, `--background`, etc.

- [ ] **Step 1: Mettre à jour tailwind.config.ts**

Remplacer le contenu par :

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        card: '#1d1c1c',
        gold: '#b89c72',
        canvas: '#ffffff',
        inkBlack: '#000000',
        softGray: '#f8f8f8',
        borderLight: '#eeeeee',
        grayText: '#666666',
        purple: '#6052ff',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
        display: ['var(--font-unbounded)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Mettre à jour app/globals.css**

Remplacer le contenu par :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #131313;
  --text: #ffffff;
  --gold-accent: #b89c72;
  --canvas-bg: #ffffff;
  --ink-black: #000000;
  --soft-gray: #f8f8f8;
  --border-light: #eeeeee;
  --gray-text: #666666;
  --border-dark: rgba(255, 255, 255, 0.1);
  --card: #1d1c1c;
  --header-height: 90px;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--background);
  color: var(--text);
  font-family: var(--font-montserrat), sans-serif;
  font-weight: 300;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-cormorant), serif;
  font-weight: 300;
}

/* Boutons DA */
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
  cursor: pointer;
  font-family: var(--font-montserrat), sans-serif;
  color: var(--ink-black);
}
.btn-cta:hover {
  background: var(--ink-black);
  color: var(--canvas-bg);
}

.btn-cta-dark {
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff;
}
.btn-cta-dark:hover {
  background: #ffffff;
  color: #131313;
}

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
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
.btn-action:hover {
  background: var(--gold-accent);
}

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

/* Section dark-premium */
.section-dark-premium {
  background-color: #0f0f0f;
  color: #ffffff;
}

/* Scrollbar custom */
.custom-scrollbar::-webkit-scrollbar { width: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #888; }

/* Artwork cards */
.artwork-image img {
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.artwork-container:hover .artwork-image img {
  transform: scale(1.03);
}

/* Member portraits */
.member-image {
  filter: grayscale(100%);
  transition: filter 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
}
.member-card:hover .member-image {
  filter: grayscale(0%);
  transform: scale(1.08);
}

/* Advantage boxes */
.advantage-box {
  transition: all 0.5s ease;
  border-top: 1px solid var(--border-light);
}
.advantage-box:hover {
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
  border-top-color: var(--gold-accent);
}

/* No scrollbar utility */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 3: Vérifier compilation Tailwind**

```bash
npm run build 2>&1 | head -20
```
Attendu : pas d'erreur CSS/Tailwind.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: add DA tokens, CSS variables, Tailwind config"
```

---

## Task 3: Layout racine (RootLayout + fonts)

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `RootLayout` avec les 3 fonts Google injectées via `next/font/google`, variables CSS `--font-cormorant`, `--font-montserrat`, `--font-unbounded` disponibles globalement.

- [ ] **Step 1: Réécrire app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat, Unbounded } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['200', '300', '400', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Artitude by InRealArt — L\'élégance de la visibilité',
  description: 'Référencez votre atelier sur Google et rejoignez la carte interactive InRealArt en 2 minutes. Gratuit, sans engagement.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${montserrat.variable} ${unbounded.variable} scroll-smooth`}
    >
      <body className="bg-background text-white font-sans overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Vérifier que le build passe**

```bash
npm run build 2>&1 | tail -10
```
Attendu : `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add RootLayout with Cormorant/Montserrat/Unbounded fonts"
```

---

## Task 4: Composants UI atomiques

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/SectionHeader.tsx`
- Create: `components/ui/AnnouncementBanner.tsx`

**Interfaces:**
- Produces:
  - `Button({ variant, href, onClick, children, className? })` — variants: `'cta' | 'cta-dark' | 'action' | 'mag'`
  - `SectionHeader({ eyebrow, title, titleItalic?, centered? })` — bloc eyebrow + h2 + divider
  - `AnnouncementBanner({ text, highlight })` — barre top-page

- [ ] **Step 1: Créer components/ui/Button.tsx**

```tsx
'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

type ButtonVariant = 'cta' | 'cta-dark' | 'action' | 'mag'

interface ButtonProps {
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  variant = 'action',
  href,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const cls = `${variant === 'cta' ? 'btn-cta' : variant === 'cta-dark' ? 'btn-cta btn-cta-dark' : variant === 'mag' ? 'btn-mag' : 'btn-action'} ${className}`

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Créer components/ui/SectionHeader.tsx**

```tsx
interface SectionHeaderProps {
  eyebrow: string
  title: string
  titleItalic?: string
  centered?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  titleItalic,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`space-y-4 ${centered ? 'text-center max-w-3xl mx-auto' : ''}`}>
      <span className="text-[10px] uppercase tracking-[0.3em] text-grayText font-semibold font-sans block">
        {eyebrow}
      </span>
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
        {title}
        {titleItalic && (
          <>
            {' '}
            <span className="italic text-grayText">{titleItalic}</span>
          </>
        )}
      </h2>
      <div className="w-12 h-[1px] bg-current mx-auto my-6 opacity-60" />
    </div>
  )
}
```

- [ ] **Step 3: Créer components/ui/AnnouncementBanner.tsx**

```tsx
interface AnnouncementBannerProps {
  text: string
  highlight: string
}

export default function AnnouncementBanner({ text, highlight }: AnnouncementBannerProps) {
  return (
    <div className="bg-[#1a1a1a] border-b border-white/10 text-center py-2.5 px-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-grayText font-light font-sans">
        {text}{' '}
        <span className="text-gold font-medium">{highlight}</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/
git commit -m "feat: add Button, SectionHeader, AnnouncementBanner UI components"
```

---

## Task 5: lib/gsap.ts + hook useGsapReveal

**Files:**
- Create: `lib/gsap.ts`
- Create: `hooks/useGsapReveal.ts`

**Interfaces:**
- Produces:
  - `registerGsap()` — enregistre ScrollTrigger (appelé une fois côté client)
  - `useGsapReveal(ref, options?)` — hook qui attache fade-up ScrollTrigger sur un ref DOM
  - Options type: `{ delay?: number; duration?: number; y?: number; stagger?: number }`

- [ ] **Step 1: Créer lib/gsap.ts**

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerGsap() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export { gsap, ScrollTrigger }
```

- [ ] **Step 2: Créer hooks/useGsapReveal.ts**

```ts
'use client'

import { useEffect, RefObject } from 'react'
import { gsap, ScrollTrigger, registerGsap } from '@/lib/gsap'

interface RevealOptions {
  delay?: number
  duration?: number
  y?: number
  stagger?: number
}

export function useGsapReveal(
  ref: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const { delay = 0, duration = 0.8, y = 40, stagger = 0 } = options

  useEffect(() => {
    registerGsap()
    if (!ref.current) return

    const targets = stagger > 0
      ? ref.current.children
      : ref.current

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [ref, delay, duration, y, stagger])
}
```

- [ ] **Step 3: Vérifier compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Attendu : aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add lib/gsap.ts hooks/useGsapReveal.ts
git commit -m "feat: add GSAP registration module and useGsapReveal hook"
```

---

## Task 6: Header

**Files:**
- Create: `components/layout/Header.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/Button`
- Produces: `Header` — nav sticky avec logo IRA, liens desktop, CTA "S'inscrire", scroll-aware shadow

- [ ] **Step 1: Créer components/layout/Header.tsx**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { registerGsap, gsap } from '@/lib/gsap'

const navLinks = [
  { href: '#problem', label: 'Le Défi' },
  { href: '#solution', label: 'La Solution' },
  { href: '#index', label: "L'Index" },
  { href: '#catalog', label: 'Services Accompagnement' },
  { href: '#faq', label: 'FAQ' },
]

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    registerGsap()

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
      )
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      ctx.revert()
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-[90px] flex items-center justify-between">
        {/* Logo */}
        <Link href="https://www.inrealart.com" className="flex items-center gap-3 group">
          <div className="h-9 w-9 border border-white/20 flex items-center justify-center bg-white/5 transition-all duration-300 group-hover:bg-gold group-hover:border-gold">
            <span className="text-white font-serif font-light text-base tracking-wider">I</span>
          </div>
          <div>
            <span className="font-serif text-lg font-light tracking-[0.3em] text-white uppercase">
              InRealArt
            </span>
            <span className="block text-[8px] uppercase tracking-[0.3em] text-grayText font-display">
              Artitude Network
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] uppercase tracking-[0.2em] text-grayText hover:text-gold transition-colors duration-200 font-display"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="#register"
          className="btn-action text-[10px] py-2.5 px-5"
        >
          S&apos;inscrire
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: add Header with GSAP entrance and scroll-aware styles"
```

---

## Task 7: Footer

**Files:**
- Create: `components/layout/Footer.tsx`

**Interfaces:**
- Produces: `Footer` — 4 colonnes (brand, nav, ecosystem, socials) + disclaimer

- [ ] **Step 1: Créer components/layout/Footer.tsx**

```tsx
import Link from 'next/link'

const discoverLinks = [
  { href: '#problem', label: 'Le Défi de l\'Artiste' },
  { href: '#solution', label: 'La Solution Artitude' },
  { href: '#index', label: 'L\'Index des Ateliers' },
  { href: '#catalog', label: 'Offres d\'Accompagnement' },
]

const ecoLinks = [
  { href: 'https://www.inrealart.com', label: 'Site principal InRealArt', external: true },
  { href: '#register', label: 'Candidatez aux Services d\'Ateliers', external: false },
  { href: '#register', label: 'Référencer un Atelier', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 py-16 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border border-white/20 flex items-center justify-center bg-white/5">
                <span className="text-white font-serif font-light text-sm">I</span>
              </div>
              <span className="font-serif text-base tracking-[0.3em] font-light uppercase">InRealArt</span>
            </div>
            <p className="text-[11px] text-grayText leading-relaxed font-light font-sans">
              Artitude est un écosystème créé par InRealArt pour dynamiser la mise en avant locale
              et l&apos;optimisation des ateliers d&apos;art de manière indépendante.
            </p>
          </div>

          {/* Découvrir */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-widest font-semibold text-white font-display">
              Découvrir
            </h5>
            <ul className="space-y-2">
              {discoverLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[11px] text-grayText hover:text-gold transition-colors duration-200 font-sans"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-widest font-semibold text-white font-display">
              Ecosystem IRA
            </h5>
            <ul className="space-y-2">
              {ecoLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[11px] text-grayText hover:text-gold transition-colors duration-200 font-sans flex items-center gap-1"
                    {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {l.label}
                    {l.external && <span className="text-[9px]">↗</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-widest font-semibold text-white font-display">
              Suivre
            </h5>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-grayText hover:text-gold transition-colors uppercase tracking-widest font-semibold font-display">
                Instagram
              </Link>
              <Link href="#" className="text-xs text-grayText hover:text-gold transition-colors uppercase tracking-widest font-semibold font-display">
                LinkedIn
              </Link>
            </div>
            <p className="text-[9px] text-grayText font-light pt-2 font-sans">
              Artitude by InRealArt. Tous droits réservés. © 2026.
            </p>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-[9px] text-grayText uppercase tracking-widest font-light font-sans">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gold transition-colors">Mentions Légales</Link>
            <Link href="#" className="hover:text-gold transition-colors">Données Personnelles</Link>
          </div>
          <div>Créé par et pour des artistes indépendants.</div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: add Footer with 4-column layout and DA styles"
```

---

## Task 8: HeroSection

**Files:**
- Create: `components/sections/HeroSection.tsx`

**Interfaces:**
- Consumes: `useGsapReveal`, `Button`, `registerGsap`, `gsap`
- Produces: `HeroSection` — section dark avec h1 animé GSAP, reassurance band, Google mock widget animé

- [ ] **Step 1: Créer components/sections/HeroSection.tsx**

```tsx
'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, registerGsap } from '@/lib/gsap'

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })
      tl.fromTo(
        contentRef.current?.querySelectorAll('.hero-animate') ?? [],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }
      )
      tl.fromTo(
        widgetRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.5'
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-120px)] flex items-center justify-center py-16 lg:py-28 overflow-hidden border-b border-white/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Content */}
          <div ref={contentRef} className="lg:col-span-7 space-y-8 text-left">
            <div className="hero-animate inline-flex items-center gap-2 border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-grayText font-display">
              <span className="h-1.5 w-1.5 bg-gold" />
              Initiative de soutien aux Ateliers 2026
            </div>

            <h1 className="hero-animate font-serif text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] text-white">
              Votre talent mérite <br />
              <span className="italic text-gold">d&apos;être trouvé.</span>
            </h1>

            <p className="hero-animate text-base sm:text-lg text-grayText font-light leading-relaxed max-w-xl font-sans">
              Notre catalogue d&apos;artistes principaux est actuellement clos. C&apos;est pourquoi nous offrons{' '}
              <strong className="text-white font-semibold">Artitude</strong> : un outil gratuit pour
              référencer votre atelier sur Google et rejoindre notre carte interactive en 2 minutes.
            </p>

            {/* Reassurance band */}
            <div className="hero-animate py-4 border-y border-white/10 max-w-xl grid grid-cols-3 gap-4 text-center sm:text-left">
              {[
                '100% Gratuit',
                'Sans Engagement',
                'Activé en 48h',
              ].map((label, i) => (
                <div
                  key={label}
                  className={`flex flex-col sm:flex-row items-center gap-2 ${i === 1 ? 'border-x border-white/10 px-4' : ''}`}
                >
                  <span className="text-gold text-base">✦</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-grayText font-display">{label}</span>
                </div>
              ))}
            </div>

            <div className="hero-animate space-y-4 pt-2">
              <Link
                href="#register"
                className="btn-action inline-flex items-center gap-3 w-full sm:w-auto px-8 py-4 text-xs"
              >
                <span>Rejoindre Artitude Gratuitement</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <p className="text-[11px] text-grayText tracking-[0.1em] pl-1 font-light font-sans">
                Déjà plus de <span className="text-white font-semibold">420 ateliers</span> référencés.
              </p>
            </div>
          </div>

          {/* Right: Google Mock Widget */}
          <div ref={widgetRef} className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] bg-[#1a1a1a] border border-white/10 overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop"
                alt="Atelier d'artiste"
                fill
                className="object-cover grayscale brightness-75"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />

              {/* Widget Google */}
              <div className="absolute bottom-6 left-5 right-5 bg-canvas text-inkBlack rounded-none p-5 shadow-2xl border border-borderLight">
                <div className="absolute -top-3 right-4 bg-background text-gold font-semibold text-[8px] uppercase tracking-[0.25em] px-2.5 py-1 flex items-center gap-1.5 border border-white/10">
                  <span className="h-1.5 w-1.5 bg-gold animate-ping" />
                  OPTIMISÉ ARTITUDE
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-softGray p-2 border border-borderLight">
                    <svg className="w-6 h-6 fill-current text-inkBlack" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.3-.176-1.855H12.24z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-inkBlack tracking-wide">
                      Atelier Catherine Sénéchal
                    </h4>
                    <p className="text-[10px] uppercase tracking-wider text-grayText font-display">
                      Peinture & Plasticienne • Lyon
                    </p>
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-inkBlack font-bold text-xs">4.9</span>
                      <div className="flex text-inkBlack text-[10px]">★ ★ ★ ★ ★</div>
                      <span className="text-[10px] text-grayText font-light">(48 avis)</span>
                    </div>
                  </div>
                </div>

                <hr className="my-4 border-borderLight" />

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-grayText uppercase tracking-wider font-display">
                  {['Appel', 'Adresse', 'Site'].map((label) => (
                    <div
                      key={label}
                      className="py-1 border border-borderLight hover:bg-softGray transition-colors cursor-pointer hover:text-gold"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/HeroSection.tsx
git commit -m "feat: add HeroSection with GSAP stagger and Google mock widget"
```

---

## Task 9: ProblemSection + SolutionSection

**Files:**
- Create: `components/sections/ProblemSection.tsx`
- Create: `components/sections/SolutionSection.tsx`

**Interfaces:**
- Consumes: `SectionHeader`, `useGsapReveal`
- Produces: sections light avec cards problèmes (3) et étapes solution (3)

- [ ] **Step 1: Créer components/sections/ProblemSection.tsx**

```tsx
'use client'

import { useRef } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const problems = [
  {
    icon: '🔍',
    title: 'Vous n\'avez pas de fiche Google à jour',
    desc: 'Sans présence optimisée sur Maps et Search, vous restez invisible pour 85% des amateurs d\'art locaux recherchant des galeries près de chez eux.',
  },
  {
    icon: '⏱️',
    title: 'Vous n\'avez pas le temps de vous en occuper',
    desc: 'Mots-clés SEO, mises à jour, gestion d\'avis... Référencer correctement son travail demande des heures complexes que vous préférez passer à créer.',
  },
  {
    icon: '📍',
    title: 'Vos concurrents, eux, sont visibles',
    desc: 'D\'autres créateurs captent l\'attention immédiate des collectionneurs urbains simplement parce qu\'ils se positionnent stratégiquement sur les recherches locales.',
  },
]

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(cardsRef as React.RefObject<HTMLElement>, { stagger: 0.15, delay: 0.2 })

  return (
    <section id="problem" className="relative py-20 lg:py-28 bg-canvas border-b border-borderLight">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={sectionRef} className="mb-20">
          <SectionHeader
            eyebrow="Le défi de l'artiste"
            title="Vos clients vous cherchent."
            titleItalic="Ils ne vous trouvent pas."
          />
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div
              key={p.title}
              className="advantage-box bg-softGray p-8 flex flex-col items-center text-center space-y-5 border border-borderLight hover:border-gold transition-all duration-300"
            >
              <div className="h-12 w-12 border border-borderLight flex items-center justify-center text-inkBlack text-xl">
                {p.icon}
              </div>
              <h3 className="font-serif text-lg text-inkBlack font-medium">{p.title}</h3>
              <p className="text-xs text-grayText leading-relaxed font-light font-sans">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="py-6 border-y border-borderLight bg-canvas">
            <p className="font-serif text-lg italic text-inkBlack">
              &ldquo;Ce n&apos;est pas un manque de talent. C&apos;est un manque d&apos;outil.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Créer components/sections/SolutionSection.tsx**

```tsx
'use client'

import { useRef } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const steps = [
  {
    number: '01',
    label: 'INSCRIPTION',
    title: 'Vous vous inscrivez (2 min)',
    desc: 'Remplissez vos informations d\'atelier en 2 minutes chrono. Pas de processus complexe, nous récupérons uniquement l\'essentiel.',
    meta: 'Temps requis : 2 minutes',
  },
  {
    number: '02',
    label: 'OPTIMISATION',
    title: 'On optimise votre fiche Google',
    desc: 'Nos experts structurent votre fiche d\'atelier Google : intégration esthétique de vos photos, définition de mots-clés et configuration des horaires.',
    meta: 'Délai : sous 48 Heures',
  },
  {
    number: '03',
    label: 'EXPOSITION',
    title: 'Vous êtes visible sur Maps & l\'Index',
    desc: 'Votre atelier devient repérable sur Google Search, Google Maps, et rejoint instantanément notre Index des Ateliers pour capter une audience d\'esthètes.',
    meta: 'Visibilité Google + InRealArt',
  },
]

export default function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(stepsRef as React.RefObject<HTMLElement>, { stagger: 0.15, delay: 0.2 })

  return (
    <section id="solution" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={sectionRef} className="mb-20">
          <SectionHeader
            eyebrow="Une offre clé en main"
            title="Artitude, votre vitrine numérique gérée pour vous."
          />
        </div>

        <div ref={stepsRef} className="grid lg:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div
              key={s.number}
              className="bg-softGray p-8 border border-borderLight flex flex-col justify-between h-full min-h-[220px] hover:border-gold transition-colors duration-300"
            >
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-grayText font-display">
                  {s.number} // {s.label}
                </div>
                <h4 className="font-serif text-xl text-inkBlack">{s.title}</h4>
                <p className="text-xs text-grayText leading-relaxed font-light font-sans">{s.desc}</p>
              </div>
              <div className="pt-4 text-[9px] uppercase tracking-wider text-gold font-semibold font-display">
                {s.meta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-softGray border border-borderLight px-6 py-3">
            <span className="text-xs text-inkBlack font-medium font-sans">
              Mise à jour mensuelle gratuite incluse
            </span>
            <span className="h-1.5 w-1.5 bg-grayText rounded-full" />
            <span className="text-[11px] text-grayText font-sans">
              Modifiez vos photos, horaires ou actualités en 1 clic
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/ProblemSection.tsx components/sections/SolutionSection.tsx
git commit -m "feat: add ProblemSection and SolutionSection with GSAP reveals"
```

---

## Task 10: IndexSection (carte interactive)

**Files:**
- Create: `components/sections/IndexSection.tsx`

**Interfaces:**
- Consumes: `useGsapReveal`, `SectionHeader`
- Produces: `IndexSection` — section light avec compteur 45k visiteurs et carte interactive avec 3 pins + card preview animée GSAP

- [ ] **Step 1: Créer components/sections/IndexSection.tsx**

```tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { gsap, registerGsap } from '@/lib/gsap'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import SectionHeader from '@/components/ui/SectionHeader'

type AtelierKey = 'ronan' | 'senechal' | 'boyer'

interface AtelierData {
  title: string
  desc: string
  tag: string
  loc: string
  img: string
}

const ateliers: Record<AtelierKey, AtelierData> = {
  ronan: {
    title: 'Atelier Ronan Martin',
    desc: 'Espace de création contemporaine de résines d\'art et d\'œuvres lumineuses.',
    tag: 'Résines',
    loc: 'Paris, France',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150&auto=format&fit=crop',
  },
  senechal: {
    title: 'Atelier Catherine Sénéchal',
    desc: 'Visites d\'atelier régulières et expositions temporaires de peintures abstraites.',
    tag: 'Peinture',
    loc: 'Lyon, France',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=150&auto=format&fit=crop',
  },
  boyer: {
    title: 'Atelier Jean-Paul Boyer',
    desc: 'Sculptures contemporaines en bois nobles et métaux de récupération.',
    tag: 'Sculpture',
    loc: 'Nice, France',
    img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=150&auto=format&fit=crop',
  },
}

const pins: { key: AtelierKey; top: string; left: string; number: string }[] = [
  { key: 'ronan', top: '35%', left: '25%', number: '01' },
  { key: 'senechal', top: '60%', left: '55%', number: '02' },
  { key: 'boyer', top: '45%', left: '75%', number: '03' },
]

export default function IndexSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<AtelierKey>('senechal')

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  useEffect(() => {
    registerGsap()
  }, [])

  const selectAtelier = (key: AtelierKey) => {
    if (!cardRef.current) return

    gsap.to(cardRef.current, {
      opacity: 0,
      y: 8,
      duration: 0.15,
      onComplete: () => {
        setActive(key)
        gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      },
    })
  }

  const data = ateliers[active]

  return (
    <section id="index" className="relative py-20 lg:py-28 bg-canvas border-b border-borderLight">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div ref={sectionRef} className="lg:col-span-5 space-y-6 text-left">
            <SectionHeader
              eyebrow="Bénéfice différenciant"
              title="Et votre atelier rejoint aussi notre Index des Ateliers."
              centered={false}
            />
            <p className="text-grayText text-xs leading-relaxed font-light font-sans">
              Chaque artiste référencé sur Artitude apparaît automatiquement dans l&apos;Index des Ateliers IRA
              — notre annuaire en ligne, avec carte interactive, consulté par les visiteurs du site InRealArt.
            </p>

            <div className="p-6 bg-softGray border border-borderLight flex items-center gap-5">
              <div className="h-10 w-10 border border-borderLight flex items-center justify-center text-gold font-mono font-semibold">
                ✦
              </div>
              <div>
                <div className="text-2xl font-serif font-light text-inkBlack tracking-tight">+ de 45 000</div>
                <div className="text-[10px] uppercase tracking-wider text-grayText font-light font-display">
                  Visiteurs uniques par mois sur le site InRealArt
                </div>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-7">
            <div className="bg-canvas border border-borderLight overflow-hidden shadow-sm">
              <div className="bg-softGray px-6 py-4 border-b border-borderLight flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 bg-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-grayText font-semibold font-display">
                    Index Interactif (Démonstration)
                  </span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-grayText font-display">
                  Cliquez pour explorer
                </div>
              </div>

              <div className="relative bg-softGray h-96 p-6 overflow-hidden">
                {/* Grid dots */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* SVG lines */}
                <svg className="absolute inset-0 w-full h-full text-inkBlack/10 pointer-events-none" fill="none" viewBox="0 0 600 400">
                  <path d="M50,150 Q120,50 300,100 T550,250" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M100,350 Q220,180 400,280 T500,50" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="180" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
                </svg>

                {/* Pins */}
                {pins.map((pin) => (
                  <button
                    key={pin.key}
                    onClick={() => selectAtelier(pin.key)}
                    className="absolute group flex flex-col items-center"
                    style={{ top: pin.top, left: pin.left }}
                  >
                    <div className={`h-6 w-6 border border-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow ${active === pin.key ? 'bg-gold' : 'bg-inkBlack'}`}>
                      <span className="text-[9px] font-bold text-white font-display">{pin.number}</span>
                    </div>
                    {active === pin.key && (
                      <span className="absolute h-6 w-6 bg-gold/20 -z-10 animate-ping" />
                    )}
                  </button>
                ))}

                {/* Preview Card */}
                <div
                  ref={cardRef}
                  className="absolute bottom-4 left-4 right-4 bg-canvas border border-borderLight p-4 shadow-xl"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 flex-shrink-0 border border-borderLight overflow-hidden">
                      <Image
                        src={data.img}
                        alt={data.title}
                        fill
                        className="object-cover grayscale"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-inkBlack text-sm">{data.title}</h4>
                        <span className="border border-borderLight text-inkBlack text-[8px] uppercase tracking-widest px-2 py-0.5 font-semibold font-display">
                          {data.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-grayText font-light line-clamp-1 font-sans">{data.desc}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-grayText uppercase tracking-wider font-display">📍 {data.loc}</span>
                        <a href="#register" className="text-[9px] text-gold hover:underline tracking-wider font-semibold uppercase font-display">
                          Rejoindre l&apos;index
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/IndexSection.tsx
git commit -m "feat: add IndexSection with interactive map pins and GSAP card transitions"
```

---

## Task 11: StatCard + StatsSection

**Files:**
- Create: `components/ui/StatCard.tsx`
- Create: `components/sections/StatsSection.tsx`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`, `registerGsap`
- Produces:
  - `StatCard({ label, target, suffix, description, barWidth })` — counter animé GSAP
  - `StatsSection` — section dark-premium avec 4 stats + 2 testimonials

- [ ] **Step 1: Créer components/ui/StatCard.tsx**

```tsx
'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger, registerGsap } from '@/lib/gsap'

interface StatCardProps {
  label: string
  target: number
  suffix: string
  description: string
  barWidth: number
}

export default function StatCard({ label, target, suffix, description, barWidth }: StatCardProps) {
  const numRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    if (!numRef.current || !barRef.current) return

    const obj = { val: 0 }
    const isDecimal = target % 1 !== 0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: numRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              if (numRef.current) {
                numRef.current.textContent = isDecimal
                  ? obj.val.toFixed(1) + suffix
                  : Math.floor(obj.val).toLocaleString() + suffix
              }
            },
          })
          gsap.fromTo(
            barRef.current,
            { width: '0%' },
            { width: `${barWidth}%`, duration: 1.8, ease: 'power2.out' }
          )
        },
      })
    })

    return () => ctx.revert()
  }, [target, suffix, barWidth])

  return (
    <div className="bg-[#1a1a1a] p-6 border border-white/10 flex flex-col justify-between space-y-4">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-grayText font-display block">{label}</span>
        <div
          ref={numRef}
          className="text-4xl font-serif font-light text-white tracking-tight mt-2"
        >
          0{suffix}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] text-grayText font-sans">{description}</p>
        <div className="w-full bg-white/10 h-[1px]">
          <div ref={barRef} className="bg-gold h-[1px]" style={{ width: 0 }} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Créer components/sections/StatsSection.tsx**

```tsx
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import StatCard from '@/components/ui/StatCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const stats = [
  { label: '+131% de recherches', target: 131, suffix: '%', description: 'Progression des ateliers référencés après optimisation de leur fiche.', barWidth: 75 },
  { label: '+116% de vues', target: 116, suffix: '%', description: 'Visibilité moyenne accrue sur Google Maps et l\'Index IRA.', barWidth: 68 },
  { label: 'Actions générées', target: 816418, suffix: '', description: 'Appels directes, demandes d\'itinéraires et clics vers sites web.', barWidth: 90 },
  { label: 'Note Google Moyenne', target: 4.9, suffix: ' / 5', description: 'Évaluation moyenne des ateliers accompagnés par notre réseau.', barWidth: 98 },
]

const testimonials = [
  {
    quote: 'Mes visites d\'atelier physiques à Lyon ont doublé en trois mois. Mes collectionneurs me trouvent directement via Google Maps.',
    name: 'Charlotte D., Artiste Peintre',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    alt: 'Charlotte Dupuis',
  },
  {
    quote: 'Je n\'avais pas le temps de m\'en occuper. L\'équipe d\'Artitude a tout structuré pour moi en 48h. C\'est simple, efficace et totalement transparent.',
    name: 'Pierre-Antoine M., Sculpteur',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    alt: 'Pierre-Antoine',
  },
]

export default function StatsSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(testimonialsRef as React.RefObject<HTMLElement>, { stagger: 0.2, delay: 0.1 })

  return (
    <section id="stats" className="section-dark-premium relative py-20 lg:py-28 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader
            eyebrow="Preuves par les chiffres"
            title="Les chiffres ne mentent pas."
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div
          ref={testimonialsRef}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-8 border-t border-white/10"
        >
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative w-16 h-16 flex-shrink-0 border border-white/10 overflow-hidden">
                <Image
                  src={t.img}
                  alt={t.alt}
                  fill
                  className="object-cover grayscale"
                  unoptimized
                />
              </div>
              <div className="space-y-2">
                <div className="flex text-gold text-xs">★ ★ ★ ★ ★</div>
                <p className="text-xs italic text-white/80 font-light font-serif">&ldquo;{t.quote}&rdquo;</p>
                <span className="block text-[10px] uppercase tracking-wider text-gold font-semibold font-display">
                  — {t.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/StatCard.tsx components/sections/StatsSection.tsx
git commit -m "feat: add StatCard with GSAP counter and StatsSection dark-premium"
```

---

## Task 12: AtelierCard + CatalogSection

**Files:**
- Create: `components/ui/AtelierCard.tsx`
- Create: `components/sections/CatalogSection.tsx`

**Interfaces:**
- Consumes: `useGsapReveal`
- Produces:
  - `AtelierCard({ name, role, service, description, imageSrc })` — card équipe grayscale → couleur
  - `CatalogSection` — 4 colonnes équipe + CTA

- [ ] **Step 1: Créer components/ui/AtelierCard.tsx**

```tsx
import Image from 'next/image'

interface AtelierCardProps {
  name: string
  role: string
  service: string
  description: string
  imageSrc: string
}

export default function AtelierCard({ name, role, service, description, imageSrc }: AtelierCardProps) {
  return (
    <div className="member-card bg-softGray border border-borderLight p-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="border-b border-borderLight pb-4 space-y-4">
          <div className="aspect-square w-full bg-neutral-200 overflow-hidden border border-borderLight artwork-image">
            <Image
              src={imageSrc}
              alt={name}
              width={300}
              height={300}
              className="member-image w-full h-full object-cover brightness-95"
              unoptimized
            />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-inkBlack">{name}</h4>
            <p className="text-[10px] uppercase tracking-wider text-grayText font-display">{role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-xs uppercase tracking-widest text-inkBlack font-semibold font-display">
            Service Dédié :
          </h5>
          <p className="text-sm font-serif italic text-inkBlack font-semibold">{service}</p>
          <p className="text-[11px] text-grayText font-light leading-relaxed font-sans">{description}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Créer components/sections/CatalogSection.tsx**

```tsx
'use client'

import { useRef } from 'react'
import Link from 'next/link'
import AtelierCard from '@/components/ui/AtelierCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const team = [
  {
    name: 'Thomas Laurent',
    role: 'Directeur Juridique & Propriété Intellectuelle',
    service: 'Kit juridique pour structurer sa carrière',
    description: 'Statuts d\'artiste, contrats types de galerie, gestion du droit de suite et de la propriété intellectuelle.',
    imageSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Sophie Dumont',
    role: 'Consultante en Stratégie de Carrière d\'Artistes',
    service: 'Kit Audit et structuration de carrière',
    description: 'Analyse globale de votre positionnement, audit de pricing d\'ateliers et plan d\'actions stratégiques.',
    imageSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Marc-Antoine Becker',
    role: 'Mentor Artistique & Curateur Principal',
    service: 'Accompagnement personnalisé',
    description: 'Suivi individuel récurrent pour développer votre signature, votre catalogue et optimiser vos relations collectionneurs.',
    imageSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Elena Rostova',
    role: 'Scénographe & Directrice d\'Expositions',
    service: 'Accompagnement expo',
    description: 'Préparation logistique de vos vernissages, conception de catalogues de ventes d\'exposition et scénographie d\'espace.',
    imageSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
  },
]

export default function CatalogSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(gridRef as React.RefObject<HTMLElement>, { stagger: 0.12, delay: 0.15 })

  return (
    <section id="catalog" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader
            eyebrow="Notre Accompagnement"
            title="L'Équipe & Vos Services Structurés"
          />
          <p className="text-xs text-grayText max-w-lg mx-auto font-light font-sans text-center mt-4">
            Notre catalogue d&apos;artistes principaux est complet, mais notre équipe d&apos;experts est à
            votre disposition pour vous aider à structurer et propulser votre carrière d&apos;artiste indépendant.
          </p>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <AtelierCard key={member.name} {...member} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="#register"
            className="btn-action inline-flex items-center gap-3 px-8 py-4 text-xs"
          >
            <span>Solliciter un accompagnement professionnel</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/AtelierCard.tsx components/sections/CatalogSection.tsx
git commit -m "feat: add AtelierCard with grayscale hover and CatalogSection"
```

---

## Task 13: RegisterSection

**Files:**
- Create: `components/sections/RegisterSection.tsx`

**Interfaces:**
- Consumes: `useGsapReveal`
- Produces: `RegisterSection` — formulaire simulé avec overlay succès géré en state React

- [ ] **Step 1: Créer components/sections/RegisterSection.tsx**

```tsx
'use client'

import { useRef, useState } from 'react'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const disciplines = [
  { value: 'peinture', label: 'Peinture / Dessin' },
  { value: 'sculpture', label: 'Sculpture / Céramique' },
  { value: 'photographie', label: 'Photographie' },
  { value: 'art_digital', label: 'Art Numérique / Nouveaux Médias' },
  { value: 'autre', label: 'Autre discipline d\'artisanat d\'art' },
]

export default function RegisterSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [success, setSuccess] = useState(false)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(true)
  }

  const handleReset = () => {
    setSuccess(false)
    const form = document.getElementById('artitude-form') as HTMLFormElement
    form?.reset()
  }

  return (
    <section id="register" className="relative py-20 lg:py-28 bg-canvas border-b border-borderLight">
      <div className="max-w-3xl mx-auto px-6">
        <div ref={sectionRef} className="bg-[#FCFAF6] border border-borderLight p-8 sm:p-12 shadow-sm space-y-8 relative">

          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-grayText font-display block">
              DÉMARRER AUJOURD&apos;HUI
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-inkBlack">
              Activez votre Artitude, gratuitement.
            </h2>
            <p className="text-xs text-grayText max-w-md mx-auto font-light font-sans">
              Remplissez ce formulaire d&apos;inscription rapide. Notre équipe d&apos;experts prendra en
              charge l&apos;optimisation de votre profil sous 48 heures.
            </p>
          </div>

          {/* Form */}
          <form id="artitude-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="Jean-Luc Boyer"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="jeanluc@boyer.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Nom de l&apos;atelier / Activité *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="Atelier Boyer Art"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Ville de l&apos;atelier *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="Nice, France"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                Médium artistique principal *
              </label>
              <select
                required
                className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
              >
                <option value="">Sélectionnez votre discipline...</option>
                {disciplines.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-4 w-4 accent-inkBlack border-borderLight"
              />
              <span className="text-[11px] text-grayText font-light leading-snug font-sans">
                Je souhaite recevoir les actualités InRealArt pour activer mon compte Artitude et être
                alerté des opportunités de services d&apos;accompagnement.
              </span>
            </label>

            <button
              type="submit"
              className="w-full btn-action justify-center py-4 text-[11px]"
            >
              Activer mon Artitude gratuit
            </button>

            <div className="text-center pt-2">
              <span className="text-[9px] text-grayText tracking-wider block font-sans">
                🔒 Vos données ne sont jamais revendues. Désinscription en un clic.
              </span>
            </div>
          </form>

          {/* Success Overlay */}
          {success && (
            <div className="absolute inset-0 bg-canvas/95 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="h-14 w-14 border border-inkBlack flex items-center justify-center text-inkBlack text-2xl">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-inkBlack">Demande d&apos;inscription reçue.</h3>
                <p className="text-xs text-grayText max-w-md mx-auto font-sans">
                  Merci d&apos;avoir activé votre profil. Un membre de l&apos;équipe d&apos;InRealArt va
                  procéder à l&apos;évaluation et la configuration de votre atelier sous 48 heures.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="btn-mag"
              >
                Inscrire un autre atelier
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/RegisterSection.tsx
git commit -m "feat: add RegisterSection with simulated form and success overlay"
```

---

## Task 14: FaqItem + FaqSection

**Files:**
- Create: `components/ui/FaqItem.tsx`
- Create: `components/sections/FaqSection.tsx`

**Interfaces:**
- Consumes: `gsap`, `registerGsap`
- Produces:
  - `FaqItem({ question, answer })` — accordion GSAP height tween, icône rotate 45°
  - `FaqSection` — 5 FAQs

- [ ] **Step 1: Créer components/ui/FaqItem.tsx**

```tsx
'use client'

import { useRef, useState } from 'react'
import { gsap, registerGsap } from '@/lib/gsap'

interface FaqItemProps {
  question: string
  answer: string
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  const toggle = () => {
    registerGsap()
    if (!contentRef.current || !iconRef.current) return

    if (!open) {
      gsap.set(contentRef.current, { height: 'auto', display: 'block' })
      const h = contentRef.current.offsetHeight
      gsap.fromTo(contentRef.current, { height: 0 }, { height: h, duration: 0.35, ease: 'power2.out' })
      gsap.to(iconRef.current, { rotation: 45, duration: 0.3, ease: 'power2.out' })
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => gsap.set(contentRef.current, { display: 'none' }),
      })
      gsap.to(iconRef.current, { rotation: 0, duration: 0.3, ease: 'power2.in' })
    }
    setOpen(!open)
  }

  return (
    <div className="border border-borderLight bg-softGray transition-all duration-300 hover:border-gold">
      <button
        onClick={toggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-serif text-base sm:text-lg text-inkBlack font-semibold">{question}</span>
        <span ref={iconRef} className="text-base text-gold ml-4 flex-shrink-0 font-display font-light">+</span>
      </button>
      <div ref={contentRef} className="overflow-hidden" style={{ height: 0, display: 'none' }}>
        <p className="px-6 pb-6 text-xs text-grayText leading-relaxed font-light font-sans">{answer}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Créer components/sections/FaqSection.tsx**

```tsx
'use client'

import { useRef } from 'react'
import FaqItem from '@/components/ui/FaqItem'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const faqs = [
  {
    question: 'C\'est vraiment gratuit ?',
    answer: 'Oui, l\'inscription et la création de votre profil Artitude sont gratuites à 100%, aujourd\'hui et demain. Aucune carte bancaire n\'est requise. Ce service est offert par InRealArt pour soutenir la visibilité numérique des ateliers d\'artistes locaux.',
  },
  {
    question: 'Je n\'ai pas de site internet, ça fonctionne quand même ?',
    answer: 'Oui absolument. C\'est tout l\'intérêt d\'Artitude. Vous n\'avez pas besoin d\'un site web lourd et complexe : nous configurons votre fiche de façon optimale directement sur Google et au sein de notre Index des Ateliers.',
  },
  {
    question: 'Qu\'est-ce que l\'Index des Ateliers exactement ?',
    answer: 'C\'est un annuaire interactif public intégré au site InRealArt. Il regroupe l\'ensemble des créateurs référencés par notre réseau et affiche votre atelier sur notre propre carte pour vous faire profiter de notre audience d\'esthètes.',
  },
  {
    question: 'Combien de temps avant de voir des résultats ?',
    answer: 'Les premiers résultats en recherche locale sur Google et Google Maps sont visibles dès l\'activation de la fiche (environ 48 heures). L\'impact réel et les contacts d\'esthètes via l\'Index d\'Ateliers se manifestent dans les semaines suivantes.',
  },
  {
    question: 'Dois-je m\'occuper de la mise à jour de ma fiche ?',
    answer: 'Non. Dans le cadre de notre offre gratuite, vous bénéficiez de mises à jour mensuelles incluses. Il vous suffit d\'envoyer vos nouvelles œuvres d\'ateliers ou changements d\'horaires à nos équipes, et nous faisons le nécessaire.',
  },
]

export default function FaqSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const faqsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(faqsRef as React.RefObject<HTMLElement>, { stagger: 0.1, delay: 0.1 })

  return (
    <section id="faq" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas">
      <div className="max-w-4xl mx-auto px-6">
        <div ref={headerRef} className="mb-20">
          <SectionHeader
            eyebrow="Des Réponses Claires"
            title="Les questions qu'on nous pose le plus."
          />
        </div>

        <div ref={faqsRef} className="space-y-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/FaqItem.tsx components/sections/FaqSection.tsx
git commit -m "feat: add FaqItem with GSAP accordion and FaqSection"
```

---

## Task 15: Page principale (assemblage)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: tous les composants sections + layout + ui
- Produces: page complète assemblée et fonctionnelle

- [ ] **Step 1: Réécrire app/page.tsx**

```tsx
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnnouncementBanner from '@/components/ui/AnnouncementBanner'
import HeroSection from '@/components/sections/HeroSection'
import ProblemSection from '@/components/sections/ProblemSection'
import SolutionSection from '@/components/sections/SolutionSection'
import IndexSection from '@/components/sections/IndexSection'
import StatsSection from '@/components/sections/StatsSection'
import CatalogSection from '@/components/sections/CatalogSection'
import RegisterSection from '@/components/sections/RegisterSection'
import FaqSection from '@/components/sections/FaqSection'

export default function Home() {
  return (
    <>
      <Header />
      <AnnouncementBanner
        text="📢 Catalogue d'artistes principaux complet."
        highlight="Artitude reste ouvert gratuitement à tous les créateurs."
      />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <IndexSection />
        <StatsSection />
        <CatalogSection />
        <RegisterSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Vérifier le build complet**

```bash
npm run build 2>&1 | tail -20
```
Attendu : `✓ Compiled successfully` sans erreurs TypeScript.

- [ ] **Step 3: Vérifier en dev**

```bash
npm run dev
```
Ouvrir `http://localhost:3000` et vérifier :
- Header sticky visible avec logo IRA
- AnnouncementBanner en haut avec accent or
- Hero avec texte animé et widget Google
- Sections Problem/Solution/Index en blanc
- Stats dark avec counters animés
- Catalog avec 4 cartes équipe
- Register avec formulaire simulé
- FAQ avec accordions GSAP
- Footer 4 colonnes

- [ ] **Step 4: Commit final**

```bash
git add app/page.tsx
git commit -m "feat: assemble full landing page — all sections integrated"
```
