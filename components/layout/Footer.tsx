import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'

export default function Footer({ dict }: { dict: Dictionary }) {
  const d = dict.footer

  return (
    <footer className="bg-background border-t border-white/10 py-16 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-base tracking-[0.3em] font-light uppercase">InRealArt</span>
            </div>
            <p className="text-[11px] text-grayText leading-relaxed font-light font-sans">{d.description}</p>
          </div>

          {/* Découvrir */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-widest font-semibold text-white font-display">{d.discover}</h5>
            <ul className="space-y-2">
              {[
                { href: '#problem', label: d.links.problem },
                { href: '#solution', label: d.links.solution },
                { href: '#index', label: d.links.index },
                { href: '#team', label: d.links.team },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[11px] text-grayText hover:text-gold transition-colors duration-200 font-sans">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-widest font-semibold text-white font-display">{d.ecosystem}</h5>
            <ul className="space-y-2">
              <li>
                <Link href="https://www.inrealart.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-grayText hover:text-gold transition-colors duration-200 font-sans flex items-center gap-1">
                  {d.links.mainSite} <span className="text-[9px]">↗</span>
                </Link>
              </li>
              <li>
                <Link href="#register" className="text-[11px] text-grayText hover:text-gold transition-colors duration-200 font-sans">{d.links.services}</Link>
              </li>
              <li>
                <Link href="#register" className="text-[11px] text-grayText hover:text-gold transition-colors duration-200 font-sans">{d.links.register}</Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase tracking-widest font-semibold text-white font-display">{d.follow}</h5>
            <div className="flex gap-4">
              <Link href="https://www.instagram.com/inrealartgallery/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-grayText hover:text-gold transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </Link>
              <Link href="https://www.linkedin.com/company/inrealart/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-grayText hover:text-gold transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </Link>
            </div>
            <p className="text-[9px] text-grayText font-light pt-2 font-sans">{d.copyright}</p>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-[9px] text-grayText uppercase tracking-widest font-light font-sans">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gold transition-colors">{d.links.legal}</Link>
            <Link href="#" className="hover:text-gold transition-colors">{d.links.privacy}</Link>
          </div>
          <div>{d.tagline}</div>
        </div>
      </div>
    </footer>
  )
}
