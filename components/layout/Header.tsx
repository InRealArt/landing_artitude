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
