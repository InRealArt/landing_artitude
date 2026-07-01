# Legal Notice Page — Design

## Goal
Give the footer's "Mentions Légales" and "Données Personnelles" links a real destination, publishing the legal framework from `docs/Cadre_juridique_Artitude.docx` (CGA, mentions légales LCEN, politique de confidentialité RGPD).

## Route
`app/[lang]/legal-notice/page.tsx` — reachable as `/fr/legal-notice` and `/en/legal-notice`. Content is French-only in both locales (legal text for a French company); only the page chrome (breadcrumb/back link) may be translated later if needed. No dictionary entries are required for the legal body copy.

## Content scope
Single page containing all three parts of the source document, as final published copy (no internal drafting notes):
1. **CGA** (Conditions Générales d'Adhésion) — Articles 1–13
2. **Mentions légales** (LCEN) — Version B only (société en formation, Timothée Roy), since InRealArt is not yet incorporated. No mention of "Version A/B" on the page — just the applicable content.
3. **Politique de confidentialité** (RGPD) — sections 1–11

Excluded from the public page (stays only in the source .docx): §0 "Note de synthèse" (internal arbitrage notes), the closing "document rédigé comme premier jet..." disclaimer, and inline "à valider par l'avocat" remarks.

Unresolved placeholders (`[ADRESSE]`, `[NUMÉRO]`, `[NOM DE L'HÉBERGEUR]`, etc.) are kept visibly as bracketed placeholders — not fabricated — since real values aren't available yet.

## Structure
- Page intro: eyebrow + title, styled like `SectionHeader` (serif title, sans eyebrow, thin divider).
- Table of contents linking to 3 anchors: `#cga`, `#mentions-legales`, `#confidentialite`.
- Each part rendered as numbered articles/sections using serif sub-headings and sans body text, divided by `border-borderLight` rules.

## Visual design (DA)
Match the site's light-content-page style (as used in `FaqSection`):
- `bg-canvas text-inkBlack`
- `font-serif` headings, `font-sans` body, `text-grayText` for secondary/annotation text
- `gold` accent for TOC hover/active state and anchor links
- `max-w-4xl mx-auto` reading column, generous vertical spacing between articles

## Footer changes
In `components/layout/Footer.tsx`:
- `d.links.legal` → `Link href="/legal-notice#mentions-legales"`
- `d.links.privacy` → `Link href="/legal-notice#confidentialite"`

## Out of scope
- Translating legal content to English
- Resolving placeholders with real company data
- A separate page/route for CGA (they live inside the same page under their own anchor)
