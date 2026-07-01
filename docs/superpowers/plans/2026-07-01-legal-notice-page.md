# Legal Notice Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a `/legal-notice` page containing the CGA, mentions légales (LCEN), and politique de confidentialité (RGPD) from `docs/Cadre_juridique_Artitude.docx`, styled with the site's light-content DA, and wire the footer's "Mentions Légales" / "Données Personnelles" links to it.

**Architecture:** A single new App Router page at `app/[lang]/legal-notice/page.tsx` renders three static content sections (CGA, Mentions Légales, Confidentialité) inside the existing `Header`/`Footer` chrome, matching `FaqSection`'s light-theme styling. Content is hardcoded French JSX (not translated per-locale) since the legal text is authoritative in French only. A small reusable `LegalArticle` UI component renders one numbered article (heading + body) to avoid repeating heading/spacing markup ~40 times.

**Tech Stack:** Next.js App Router (Server Component, no client JS needed), Tailwind CSS with existing design tokens (`canvas`, `inkBlack`, `grayText`, `borderLight`, `gold`, `font-serif`/`font-sans`).

## Global Constraints

- Content is French-only on both `/fr/legal-notice` and `/en/legal-notice` — no dictionary translation of legal body text.
- Internal drafting notes (§0 "Note de synthèse", "à valider par l'avocat" remarks, closing disclaimer) are excluded from the published page.
- Use "Version B" (société en formation, Timothée Roy) mentions légales content only — no "Version A vs B" framing on the page.
- Keep unresolved placeholders (`[ADRESSE]`, `[NUMÉRO]`, `[NOM DE L'HÉBERGEUR]`, etc.) visible as bracketed text — do not invent values.
- Visual style must match `components/sections/FaqSection.tsx`: `bg-canvas text-inkBlack`, `max-w-4xl mx-auto`, `border-borderLight` dividers, `font-serif` headings, `font-sans` body, `grayText` secondary text, `gold` for links/accents.

---

### Task 1: `LegalArticle` UI component

**Files:**
- Create: `components/ui/LegalArticle.tsx`

**Interfaces:**
- Produces: `LegalArticle` component, props `{ id?: string; title: string; children: React.ReactNode }` — renders an `<article>` with an anchorable `id`, a serif `<h3>` title, and a `font-sans text-grayText` body wrapper for `children`. Later tasks (the page) import this as `import LegalArticle from '@/components/ui/LegalArticle'` and pass paragraph JSX as children.

- [ ] **Step 1: Create the component**

```tsx
interface LegalArticleProps {
  id?: string
  title: string
  children: React.ReactNode
}

export default function LegalArticle({ id, title, children }: LegalArticleProps) {
  return (
    <article id={id} className="py-8 border-b border-borderLight last:border-b-0 scroll-mt-24">
      <h3 className="font-serif text-xl sm:text-2xl font-light mb-4">{title}</h3>
      <div className="font-sans text-[13px] sm:text-sm text-grayText leading-relaxed space-y-3">
        {children}
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no errors referencing `components/ui/LegalArticle.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/LegalArticle.tsx
git commit -m "Add LegalArticle component for legal notice page"
```

---

### Task 2: Legal notice page — CGA section

**Files:**
- Create: `app/[lang]/legal-notice/page.tsx`

**Interfaces:**
- Consumes: `LegalArticle` from Task 1 (`import LegalArticle from '@/components/ui/LegalArticle'`); `getDictionary`, `hasLocale`, `type Locale` from `@/lib/dictionaries`; `Header` from `@/components/layout/Header`; `Footer` from `@/components/layout/Footer`.
- Produces: default-exported async `LegalNoticePage({ params }: { params: Promise<{ lang: string }> })` matching the signature used in `app/[lang]/page.tsx:16`. This task creates the file with the page shell, TOC, and the full CGA (Article 1–13) content. Task 3 appends Mentions Légales + Confidentialité to the same file.

This task's content, verbatim from the source docx (internal notes stripped, Version B only for company identity where CGA references it):

- [ ] **Step 1: Create the page file with shell, TOC, and CGA content**

```tsx
import { redirect } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LegalArticle from '@/components/ui/LegalArticle'

export default async function LegalNoticePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) redirect('/fr')

  const dict = await getDictionary(lang as Locale)

  return (
    <>
      <Header dict={dict} lang={lang} />
      <main className="bg-canvas text-inkBlack">
        <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
          <div className="mb-16 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-grayText font-semibold font-sans block mb-4">
              Artitude by InRealArt
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
              Mentions Légales & Conditions
            </h1>
            <div className="w-12 h-[1px] bg-current mx-auto my-6 opacity-60" />
          </div>

          <nav className="mb-16 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-[11px] uppercase tracking-widest font-sans">
            <a href="#cga" className="text-grayText hover:text-gold transition-colors">Conditions Générales d&apos;Adhésion</a>
            <a href="#mentions-legales" className="text-grayText hover:text-gold transition-colors">Mentions Légales</a>
            <a href="#confidentialite" className="text-grayText hover:text-gold transition-colors">Confidentialité</a>
          </nav>

          <section id="cga" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">Partie I — Conditions Générales d&apos;Adhésion au programme Artitude (CGA)</h2>
            <p className="font-sans text-[11px] text-grayText uppercase tracking-widest mb-8">En vigueur au [DATE]. Version [1.0].</p>

            <LegalArticle title="Article 1 — Objet et définitions">
              <p>1.1. Les présentes Conditions Générales d&apos;Adhésion (les « CGA ») régissent l&apos;inscription et la participation des artistes au programme « Artitude » (le « Programme »), édité par le projet Artitude porté par Timothée Roy, agissant au nom et pour le compte de la société [DÉNOMINATION] en cours de constitution, dont les actes ont vocation à être repris après immatriculation (« InRealArt » ou l&apos;« Éditeur »).</p>
              <p>1.2. Le Programme est un service gratuit consistant à créer, optimiser et maintenir une fiche de référencement de l&apos;atelier de l&apos;artiste (la « Fiche ») sur les moteurs et cartographies (Google Search, Google Maps) et à l&apos;intégrer à l&apos;Index des Ateliers publié sur le site InRealArt (l&apos;« Index »).</p>
              <p>1.3. Définitions :</p>
              <p>« Artiste » ou « Adhérent » : toute personne physique ou morale acceptant les présentes CGA et référencée au Programme.</p>
              <p>« Contenus » : photographies, visuels, textes, coordonnées et informations transmis par l&apos;Artiste.</p>
              <p>« Œuvres » : les créations de l&apos;Artiste représentées dans les Contenus.</p>
              <p>« Obligations mensuelles » : les obligations définies à l&apos;Article 5.</p>
            </LegalArticle>

            <LegalArticle title="Article 2 — Gratuité">
              <p>2.1. L&apos;adhésion et l&apos;optimisation de la Fiche par InRealArt sont fournies sans contrepartie financière. Le Programme est gratuit pour l&apos;Artiste : aucune somme n&apos;est due à InRealArt, et les Obligations mensuelles (Article 5) n&apos;entraînent par elles-mêmes aucun frais pour l&apos;Artiste.</p>
              <p>2.2. L&apos;adhésion n&apos;emporte aucun abonnement ni engagement financier. L&apos;« engagement » de l&apos;Artiste est exclusivement opérationnel, au sens de l&apos;Article 5.</p>
            </LegalArticle>

            <LegalArticle title="Article 3 — Conditions d'adhésion">
              <p>3.1. L&apos;adhésion s&apos;effectue via le formulaire en ligne. L&apos;Artiste garantit l&apos;exactitude des informations communiquées.</p>
              <p>3.2. L&apos;adhésion suppose l&apos;acceptation pleine et entière des présentes CGA, matérialisée par la validation du formulaire.</p>
              <p>3.3. InRealArt se réserve le droit de refuser ou de suspendre toute adhésion, sans avoir à en justifier, notamment en cas d&apos;informations inexactes, de Contenus illicites ou de saturation du réseau.</p>
            </LegalArticle>

            <LegalArticle title="Article 4 — Durée">
              <p>4.1. L&apos;adhésion est conclue pour une durée initiale de douze (12) mois à compter de l&apos;activation de la Fiche (durée correspondant à la durée moyenne de vie d&apos;une Fiche).</p>
              <p>4.2. À l&apos;échéance, l&apos;adhésion se renouvelle par tacite reconduction par périodes successives de douze (12) mois, sauf dénonciation par l&apos;une des parties dans les conditions des Articles 7, 8 et 9.</p>
              <p>4.3. Le maintien de la Fiche pendant toute la durée est conditionné au respect des Obligations mensuelles (Article 5).</p>
            </LegalArticle>

            <LegalArticle title="Article 5 — Obligations mensuelles de l'Artiste">
              <p>Pendant toute la durée de l&apos;adhésion, l&apos;Artiste s&apos;engage à réaliser, chaque mois calendaire, les deux obligations suivantes :</p>
              <p>5.1. Transmission de photographies. L&apos;Artiste transmet à InRealArt, au plus tard le dernier jour de chaque mois, un minimum de vingt (20) photographies de ses Œuvres, en respectant la nomenclature de fichiers suivante : Nomartiste_nomoeuvre. InRealArt appose ensuite son préfixe pour aboutir à la dénomination : InRealArt_Nomartiste_nomoeuvre. Les photographies doivent être de qualité suffisante pour une exploitation en ligne et libres de tout droit de tiers (cf. Article 6).</p>
              <p>5.2. Sollicitation d&apos;avis. L&apos;Artiste s&apos;engage, chaque mois calendaire, à solliciter des avis auprès de son entourage (proches, connaissances, visiteurs de l&apos;atelier) afin d&apos;alimenter et d&apos;animer sa fiche d&apos;atelier. Cette obligation est une obligation de moyens (démarche de sollicitation) et n&apos;impose ni note minimale ni nombre d&apos;avis obtenus. L&apos;Artiste veille à ce que les avis sollicités soient sincères et reflètent une opinion réelle. Sont strictement prohibés les avis fictifs, achetés, ou faussement présentés comme émanant de clients, conformément aux articles L.111-7-2 et L.121-4 du Code de la consommation et aux règles des plateformes d&apos;avis. Cette sollicitation n&apos;entraîne aucun coût pour l&apos;Artiste.</p>
              <p>5.3. Les Obligations mensuelles constituent des obligations essentielles et déterminantes du maintien de la Fiche. Leur inexécution déclenche la procédure de l&apos;Article 7.</p>
            </LegalArticle>

            <LegalArticle title="Article 6 — Propriété intellectuelle et licence">
              <p>6.1. Titularité. L&apos;Artiste demeure seul titulaire des droits de propriété intellectuelle sur ses Œuvres et sur les photographies transmises. Les présentes CGA n&apos;emportent aucune cession de propriété.</p>
              <p>6.2. Licence. L&apos;Artiste concède à InRealArt, pour les seuls besoins du Programme, une licence non exclusive, gratuite, mondiale, pour la durée de l&apos;adhésion, l&apos;autorisant à reproduire, représenter, adapter techniquement (recadrage, redimensionnement, renommage selon la nomenclature de l&apos;Article 5.1) et diffuser les Contenus sur la Fiche, l&apos;Index, Google et les partenaires techniques du Programme, avec faculté de sous-licence au profit de ces plateformes.</p>
              <p>6.3. Droit moral. Le droit moral de l&apos;Artiste est respecté ; en particulier, son nom reste associé à chaque Œuvre (la nomenclature préservant l&apos;attribution). Aucune modification portant atteinte à l&apos;intégrité de l&apos;Œuvre ne sera opérée.</p>
              <p>6.4. Garantie. L&apos;Artiste garantit qu&apos;il détient l&apos;ensemble des droits sur les Contenus, que les photographies ne portent atteinte à aucun droit de tiers (photographe, personnes représentées, marques) et il garantit InRealArt contre tout recours à ce titre.</p>
              <p>6.5. Cessation. À la fin de l&apos;adhésion, la licence prend fin et InRealArt cesse toute nouvelle exploitation des Contenus dans un délai raisonnable, sous réserve des copies de cache des moteurs tiers échappant à son contrôle.</p>
            </LegalArticle>

            <LegalArticle title="Article 7 — Procédure de rappel et de retrait pour manquement">
              <p>7.1. En cas d&apos;inexécution de l&apos;une des Obligations mensuelles (Article 5), InRealArt adresse à l&apos;Artiste un premier rappel par email, l&apos;invitant à régulariser sous huit (8) jours.</p>
              <p>7.2. À défaut de régularisation, InRealArt adresse un second (et dernier) rappel, ouvrant un ultime délai de huit (8) jours.</p>
              <p>7.3. À défaut de régularisation à l&apos;issue du second rappel, l&apos;adhésion est résiliée de plein droit et la Fiche est retirée du Programme et de l&apos;Index, sans indemnité et sans autre formalité, l&apos;Artiste en étant informé par email.</p>
              <p>7.4. Cette procédure ne fait pas obstacle à la faculté de retrait discrétionnaire prévue à l&apos;Article 8.</p>
            </LegalArticle>

            <LegalArticle title="Article 8 — Faculté de retrait à l'initiative d'InRealArt">
              <p>8.1. Le Programme étant un service gratuit d&apos;intérêt éditorial, InRealArt peut retirer une Fiche et mettre fin à une adhésion à tout moment, y compris en dehors de tout manquement, moyennant un préavis de [30] jours notifié par email.</p>
              <p>8.2. Ce délai de préavis n&apos;est pas requis en cas de manquement grave (Contenus illicites, atteinte à l&apos;image du réseau, fausses informations, atteinte aux droits de tiers), le retrait étant alors immédiat.</p>
              <p>8.3. Le retrait à l&apos;initiative d&apos;InRealArt n&apos;ouvre droit à aucune indemnité au profit de l&apos;Artiste.</p>
            </LegalArticle>

            <LegalArticle title="Article 9 — Résiliation à l'initiative de l'Artiste">
              <p>L&apos;Artiste peut résilier son adhésion à tout moment et sans motif, par simple demande écrite (email) ou via son espace, avec prise d&apos;effet sous [15] jours. Aucun frais n&apos;est dû.</p>
            </LegalArticle>

            <LegalArticle title="Article 9 bis — Droit de rétractation (artistes non professionnels)">
              <p>9bis.1. L&apos;Artiste agissant en qualité de consommateur (non professionnel) dispose d&apos;un droit de rétractation de quatorze (14) jours à compter de la conclusion de l&apos;adhésion, sans avoir à motiver sa décision (art. L.221-18 du Code de la consommation).</p>
              <p>9bis.2. Pour l&apos;exercer, l&apos;Artiste notifie sa décision par une déclaration dénuée d&apos;ambiguïté (email à contact@inrealart.com ou formulaire type annexé). Le service étant gratuit, l&apos;exercice de la rétractation n&apos;entraîne aucun frais ni remboursement.</p>
              <p>9bis.3. L&apos;activation de la Fiche pouvant intervenir sous 48 heures, soit avant l&apos;expiration du délai, l&apos;Artiste consommateur qui souhaite une activation immédiate en fait la demande expresse. La gratuité du Programme fait qu&apos;aucune somme ne sera due même si la Fiche a déjà été activée avant la fin du délai de rétractation.</p>
              <p>9bis.4. Le présent article ne s&apos;applique pas aux artistes agissant à titre professionnel.</p>
            </LegalArticle>

            <LegalArticle title="Article 10 — Responsabilité">
              <p>10.1. InRealArt est tenu d&apos;une obligation de moyens quant à l&apos;optimisation et la visibilité de la Fiche. Elle ne garantit aucun résultat en termes de positionnement, de trafic ou de fréquentation, ces éléments dépendant de tiers (notamment Google) et de facteurs extérieurs.</p>
              <p>10.2. InRealArt ne saurait être tenue responsable des conséquences d&apos;informations erronées fournies par l&apos;Artiste, ni des avis sollicités par ce dernier auprès de son entourage (Article 5.2).</p>
              <p>10.3. La responsabilité d&apos;InRealArt, si elle était engagée, serait en tout état de cause limitée aux dommages directs et prévisibles.</p>
            </LegalArticle>

            <LegalArticle title="Article 11 — Données personnelles">
              <p>Le traitement des données personnelles est décrit dans la Politique de confidentialité (Partie III), qui fait partie intégrante des présentes CGA.</p>
            </LegalArticle>

            <LegalArticle title="Article 12 — Modification des CGA">
              <p>InRealArt peut modifier les présentes CGA. Les modifications sont notifiées par email et/ou publiées ; elles s&apos;appliquent aux adhésions en cours à l&apos;issue d&apos;un délai de [30] jours, l&apos;Artiste pouvant résilier s&apos;il les refuse.</p>
            </LegalArticle>

            <LegalArticle title="Article 13 — Droit applicable et litiges">
              <p>13.1. Les présentes CGA sont soumises au droit français.</p>
              <p>13.2. En cas de litige, les parties rechercheront une solution amiable.</p>
              <p>13.3. Artistes professionnels : à défaut d&apos;accord amiable, compétence du Tribunal [de commerce / judiciaire] de [VILLE].</p>
              <p>13.4. Artistes non professionnels (consommateurs) : conformément aux articles L.612-1 et s. du Code de la consommation, l&apos;Artiste peut recourir gratuitement au médiateur de la consommation [NOM ET COORDONNÉES DU MÉDIATEUR] et, à défaut de résolution, saisir les juridictions de droit commun compétentes. La plateforme européenne de règlement en ligne des litiges reste par ailleurs accessible.</p>
            </LegalArticle>
          </section>
        </div>
      </main>
      <Footer dict={dict} />
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no errors referencing `app/[lang]/legal-notice/page.tsx`

- [ ] **Step 3: Commit**

```bash
git add "app/[lang]/legal-notice/page.tsx"
git commit -m "Add legal notice page with CGA section"
```

---

### Task 3: Append Mentions Légales + Confidentialité sections

**Files:**
- Modify: `app/[lang]/legal-notice/page.tsx` (append two `<section>` blocks right after the `</section>` closing the `#cga` section, still inside the same `<div className="max-w-4xl ...">` wrapper, before the closing `</div>` and `</main>`)

**Interfaces:**
- Consumes: `LegalArticle` from Task 1, same file structure produced by Task 2.
- Produces: no new exports — this task completes the page body that Task 2 started.

- [ ] **Step 1: Insert the Mentions Légales and Confidentialité sections**

Find this closing tag in the file (end of the CGA `<section>` from Task 2):

```tsx
            </LegalArticle>
          </section>
```

Replace it with (keeping the CGA `</LegalArticle>` and adding the two new sections immediately after `</section>`):

```tsx
            </LegalArticle>
          </section>

          <section id="mentions-legales" className="scroll-mt-24 mt-20">
            <h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">Partie II — Mentions légales</h2>
            <p className="font-sans text-[11px] text-grayText uppercase tracking-widest mb-8">Obligatoires au titre de l&apos;article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN).</p>

            <LegalArticle title="Éditeur / Responsable">
              <p>Projet « Artitude » porté par Timothée Roy, agissant au nom et pour le compte de la société [DÉNOMINATION] en cours de constitution.</p>
              <p>Adresse : [ADRESSE DU FONDATEUR / DU FUTUR SIÈGE]</p>
              <p>Adresse email : contact@inrealart.com</p>
              <p>Téléphone : [NUMÉRO]</p>
              <p>Mention : société en cours de constitution — immatriculation en cours au RCS de [VILLE].</p>
              <p>Directeur de la publication : Timothée Roy.</p>
            </LegalArticle>

            <LegalArticle title="Hébergeur">
              <p>Dénomination : [NOM DE L&apos;HÉBERGEUR]</p>
              <p>Adresse : [ADRESSE]</p>
              <p>Téléphone : [NUMÉRO]</p>
            </LegalArticle>

            <LegalArticle title="Propriété intellectuelle">
              <p>L&apos;ensemble des éléments du site (marques, logos, textes, éléments graphiques) est protégé. Toute reproduction non autorisée est interdite. Les Œuvres et visuels des artistes référencés restent la propriété de leurs auteurs respectifs.</p>
            </LegalArticle>

            <LegalArticle title="Médiation de la consommation">
              <p>Conformément aux articles L.612-1 et s. du Code de la consommation, le consommateur peut recourir gratuitement au médiateur : [NOM ET COORDONNÉES DU MÉDIATEUR].</p>
            </LegalArticle>
          </section>

          <section id="confidentialite" className="scroll-mt-24 mt-20">
            <h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">Partie III — Politique de confidentialité (RGPD)</h2>
            <p className="font-sans text-[11px] text-grayText uppercase tracking-widest mb-8">Conforme au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés modifiée.</p>

            <LegalArticle title="1. Responsable de traitement">
              <p>Le responsable de traitement est Timothée Roy, agissant pour le compte de la société [DÉNOMINATION] en cours de constitution, [ADRESSE]. Contact : contact@inrealart.com.</p>
            </LegalArticle>

            <LegalArticle title="2. Données collectées">
              <p>Via le formulaire d&apos;inscription et l&apos;usage du Programme :</p>
              <p>Identité et contact : nom et prénom, adresse email, téléphone.</p>
              <p>Activité : nom de l&apos;atelier / activité, médium artistique principal, site web.</p>
              <p>Localisation : adresse de l&apos;atelier, horaires.</p>
              <p>Contenus : photographies des œuvres.</p>
              <p>Données de navigation : le cas échéant, cookies et traceurs (voir section 9).</p>
            </LegalArticle>

            <LegalArticle title="3. Finalités et bases légales">
              <p>Création, optimisation et maintien de la Fiche — Exécution du contrat (art. 6.1.b RGPD).</p>
              <p>Gestion de la relation avec l&apos;artiste (rappels, suivi) — Exécution du contrat (art. 6.1.b RGPD).</p>
              <p>Envoi d&apos;actualités / newsletter InRealArt — Consentement (art. 6.1.a RGPD).</p>
              <p>Amélioration du service, statistiques — Intérêt légitime (art. 6.1.f RGPD).</p>
              <p>Respect des obligations légales — Obligation légale (art. 6.1.c RGPD).</p>
              <p>L&apos;envoi de la newsletter et des sollicitations d&apos;accompagnement suppose le consentement recueilli via la case à cocher dédiée du formulaire ; ce consentement est révocable à tout moment.</p>
            </LegalArticle>

            <LegalArticle title="4. Destinataires">
              <p>Les données sont destinées aux services habilités d&apos;InRealArt et, pour les besoins du Programme, à ses sous-traitants et partenaires techniques (notamment hébergeur, plateformes de référencement telles que Google, outil d&apos;emailing). Les données de la Fiche destinées à être publiques (nom de l&apos;atelier, adresse, horaires, visuels) sont, par nature, diffusées en ligne. Les données ne sont jamais revendues.</p>
            </LegalArticle>

            <LegalArticle title="5. Transferts hors UE">
              <p>Certains partenaires (ex. Google) peuvent impliquer des transferts hors UE, encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne, décision d&apos;adéquation le cas échéant).</p>
            </LegalArticle>

            <LegalArticle title="6. Durées de conservation">
              <p>Artistes actifs : pendant toute la durée de l&apos;adhésion.</p>
              <p>Après la fin de l&apos;adhésion : archivage intermédiaire à des fins de preuve pendant la durée de prescription applicable, puis suppression.</p>
              <p>Prospects / non-adhérents : 3 ans à compter du dernier contact (recommandation CNIL).</p>
              <p>Consentement newsletter : jusqu&apos;au retrait du consentement (désinscription).</p>
              <p>Cookies : durée maximale de 13 mois (ou selon la réglementation en vigueur).</p>
            </LegalArticle>

            <LegalArticle title="7. Sécurité">
              <p>InRealArt met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre tout accès, altération ou divulgation non autorisés.</p>
            </LegalArticle>

            <LegalArticle title="8. Droits des personnes">
              <p>Conformément au RGPD, toute personne dispose des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition, de portabilité, ainsi que du droit de retirer son consentement et de définir des directives post-mortem. Ces droits s&apos;exercent auprès de : contact@inrealart.com. En cas de difficulté, la personne peut saisir la CNIL (www.cnil.fr).</p>
            </LegalArticle>

            <LegalArticle title="9. Cookies et traceurs">
              <p>Le site peut utiliser des cookies. Les cookies non essentiels ne sont déposés qu&apos;après consentement via le bandeau dédié.</p>
            </LegalArticle>

            <LegalArticle title="10. Avis sollicités">
              <p>Les avis que l&apos;Artiste sollicite auprès de son entourage (Article 5.2 des CGA) doivent refléter une opinion sincère. Le traitement des données des personnes laissant un avis (identité, contenu de l&apos;avis) relève, selon le canal utilisé, de la plateforme d&apos;avis concernée et/ou de l&apos;Artiste. La collecte et la publication d&apos;avis sont soumises aux obligations de loyauté et de transparence (art. L.111-7-2 du Code de la consommation), notamment l&apos;absence d&apos;avis fictifs ou faussement présentés comme émanant de clients.</p>
            </LegalArticle>

            <LegalArticle title="11. Contact">
              <p>Pour toute question relative à la présente politique : contact@inrealart.com.</p>
            </LegalArticle>
          </section>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors in `app/[lang]/legal-notice/page.tsx` or `components/ui/LegalArticle.tsx`

- [ ] **Step 4: Commit**

```bash
git add "app/[lang]/legal-notice/page.tsx"
git commit -m "Add mentions legales and confidentialite sections to legal notice page"
```

---

### Task 4: Wire footer links to the new page

**Files:**
- Modify: `components/layout/Footer.tsx:81-82`

**Interfaces:**
- Consumes: no new interfaces — this task only changes two `href` values in existing JSX.

- [ ] **Step 1: Update the footer links**

In `components/layout/Footer.tsx`, replace:

```tsx
            <Link href="#" className="hover:text-gold transition-colors">{d.links.legal}</Link>
            <Link href="#" className="hover:text-gold transition-colors">{d.links.privacy}</Link>
```

with:

```tsx
            <Link href="/legal-notice#mentions-legales" className="hover:text-gold transition-colors">{d.links.legal}</Link>
            <Link href="/legal-notice#confidentialite" className="hover:text-gold transition-colors">{d.links.privacy}</Link>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no errors

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, then in a browser visit `http://localhost:3000/fr` and click "Mentions Légales" in the footer.
Expected: navigates to `/legal-notice#mentions-legales`, page loads with Header/Footer chrome, TOC visible, scrolled near the Mentions Légales heading. Clicking "Données Personnelles" scrolls to Confidentialité. Clicking the CGA link in the on-page TOC scrolls to `#cga`.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "Link footer legal/privacy links to legal notice page"
```

---

## Self-Review Notes

- Spec coverage: single-page route (Task 2+3), TOC with 3 anchors (Task 2), light DA matching FaqSection (Tasks 1-3), footer wiring (Task 4), internal notes excluded and placeholders kept (Task 2+3 content) — all covered.
- No placeholders/TODOs in task steps; all code blocks are complete.
- Type consistency: `LegalArticle` props (`id?`, `title`, `children`) used identically across Tasks 2 and 3; page component signature matches the existing `app/[lang]/page.tsx` pattern.
