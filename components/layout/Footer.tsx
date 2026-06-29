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
