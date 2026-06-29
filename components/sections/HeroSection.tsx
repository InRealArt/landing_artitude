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
