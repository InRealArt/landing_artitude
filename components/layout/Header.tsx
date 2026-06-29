'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { registerGsap, gsap } from '@/lib/gsap'
import type { Dictionary } from '@/lib/dictionaries'

export default function Header({ dict, lang }: { dict: Dictionary; lang: string }) {
  const d = dict.nav
  const headerRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navLinks = [
    { href: '#problem', label: d.problem },
    { href: '#solution', label: d.solution },
    { href: '#index', label: d.index },
    { href: '#team', label: d.team },
    { href: '#faq', label: d.faq },
  ]

  useEffect(() => {
    registerGsap()
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 })
    })
    return () => { window.removeEventListener('scroll', onScroll); ctx.revert() }
  }, [])

  // Mobile menu GSAP
  useEffect(() => {
    if (!mobileMenuRef.current) return
    registerGsap()
    if (menuOpen) {
      gsap.set(mobileMenuRef.current, { display: 'flex' })
      gsap.fromTo(mobileMenuRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      gsap.fromTo(mobileMenuRef.current.querySelectorAll('a'), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, ease: 'power2.out', delay: 0.1 })
    } else {
      gsap.to(mobileMenuRef.current, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in', onComplete: () => gsap.set(mobileMenuRef.current, { display: 'none' }) })
    }
  }, [menuOpen])

  // Lang dropdown GSAP
  useEffect(() => {
    if (!langDropdownRef.current) return
    registerGsap()
    if (langOpen) {
      gsap.set(langDropdownRef.current, { display: 'block' })
      gsap.fromTo(langDropdownRef.current, { opacity: 0, y: -6, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' })
    } else {
      gsap.to(langDropdownRef.current, { opacity: 0, y: -6, scale: 0.97, duration: 0.15, ease: 'power2.in', onComplete: () => gsap.set(langDropdownRef.current, { display: 'none' }) })
    }
  }, [langOpen])

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-lang-switcher]')) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchLang = (newLang: string) => {
    setLangOpen(false)
    const segments = pathname.split('/')
    segments[1] = newLang
    router.push(segments.join('/') || `/${newLang}`)
  }

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-[90px] flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} className="group">
          <span className="font-serif text-lg font-light tracking-[0.3em] text-white uppercase group-hover:text-gold transition-colors duration-300 block">
            InRealArt
          </span>
          <span className="text-[8px] uppercase tracking-[0.3em] text-grayText font-display block">
            Artitude Network
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[10px] uppercase tracking-[0.2em] text-white font-semibold hover:text-gold transition-colors duration-200 font-display">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Lang switcher — globe + dropdown */}
          <div className="relative" data-lang-switcher>
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 text-grayText hover:text-white transition-colors duration-200 focus:outline-none"
              aria-label="Switch language"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 0 0 .284 2.253" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-semibold font-display">{lang.toUpperCase()}</span>
              <svg className={`w-2.5 h-2.5 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            <div
              ref={langDropdownRef}
              style={{ display: 'none' }}
              className="absolute right-0 top-full mt-2 w-28 bg-background border border-white/10 shadow-2xl overflow-hidden"
            >
              {(['fr', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-[11px] uppercase tracking-widest font-semibold font-display transition-colors duration-150 ${
                    lang === l ? 'text-gold bg-white/5' : 'text-grayText hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{l === 'fr' ? 'Français' : 'English'}</span>
                  {lang === l && (
                    <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA desktop */}
          <Link href="#register" className="hidden md:inline-flex btn-action text-[10px] py-2.5 px-5">
            {d.cta}
          </Link>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 focus:outline-none"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className={`block h-[1.5px] bg-white transition-all duration-300 origin-center ${menuOpen ? 'w-5 rotate-45 translate-y-[6.5px]' : 'w-5'}`} />
            <span className={`block h-[1.5px] bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 w-0' : 'w-5'}`} />
            <span className={`block h-[1.5px] bg-white transition-all duration-300 origin-center ${menuOpen ? 'w-5 -rotate-45 -translate-y-[6.5px]' : 'w-5'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div ref={mobileMenuRef} style={{ display: 'none' }} className="md:hidden flex-col bg-background border-t border-white/10 px-6 py-8 space-y-1">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-[11px] uppercase tracking-[0.25em] text-white font-semibold hover:text-gold transition-colors duration-200 font-display py-3.5 border-b border-white/5 last:border-0">
            {link.label}
          </Link>
        ))}
        <div className="pt-6">
          <Link href="#register" onClick={() => setMenuOpen(false)} className="btn-action text-[10px] py-3 px-6 w-full justify-center">
            {d.cta}
          </Link>
        </div>
      </div>
    </header>
  )
}
