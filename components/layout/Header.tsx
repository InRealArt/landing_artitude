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
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    registerGsap()

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })

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

  useEffect(() => {
    if (!mobileMenuRef.current) return
    registerGsap()

    if (menuOpen) {
      gsap.set(mobileMenuRef.current, { display: 'flex' })
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      )
      gsap.fromTo(
        mobileMenuRef.current.querySelectorAll('a'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      )
    } else {
      gsap.to(mobileMenuRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => gsap.set(mobileMenuRef.current, { display: 'none' }),
      })
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

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
        {/* Logo sans carré */}
        <Link href="https://www.inrealart.com" className="group">
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
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] uppercase tracking-[0.2em] text-white font-semibold hover:text-gold transition-colors duration-200 font-display"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* CTA desktop */}
          <Link
            href="#register"
            className="hidden md:inline-flex btn-action text-[10px] py-2.5 px-5"
          >
            S&apos;inscrire
          </Link>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 focus:outline-none"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span
              className={`block h-[1.5px] bg-white transition-all duration-300 origin-center ${
                menuOpen ? 'w-5 rotate-45 translate-y-[6.5px]' : 'w-5'
              }`}
            />
            <span
              className={`block h-[1.5px] bg-white transition-all duration-300 ${
                menuOpen ? 'opacity-0 w-0' : 'w-5'
              }`}
            />
            <span
              className={`block h-[1.5px] bg-white transition-all duration-300 origin-center ${
                menuOpen ? 'w-5 -rotate-45 -translate-y-[6.5px]' : 'w-5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        ref={mobileMenuRef}
        style={{ display: 'none' }}
        className="md:hidden flex-col bg-background border-t border-white/10 px-6 py-8 space-y-1"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className="block text-[11px] uppercase tracking-[0.25em] text-white font-semibold hover:text-gold transition-colors duration-200 font-display py-3.5 border-b border-white/5 last:border-0"
          >
            {link.label}
          </Link>
        ))}
        <div className="pt-6">
          <Link
            href="#register"
            onClick={closeMenu}
            className="btn-action text-[10px] py-3 px-6 w-full justify-center"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  )
}
