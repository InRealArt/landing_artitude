'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { gsap, registerGsap } from '@/lib/gsap'
import type { Dictionary } from '@/lib/dictionaries'
import type { GmbLocation } from '@/types/gmb'

const LeafletMap = dynamic(() => import('@/components/ui/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-white/20 text-[10px] uppercase tracking-widest font-display animate-pulse">
        Chargement…
      </span>
    </div>
  ),
})

export default function HeroSection({ dict, locale }: { dict: Dictionary; locale: string }) {
  const d = dict.hero
  const di = dict.index
  const contentRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const [locations, setLocations] = useState<GmbLocation[]>([])
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    setFetchError(false)
    const url = new URL('/api/gmb/locations', window.location.origin)
    url.searchParams.set('locale', locale)
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data: { locations: GmbLocation[] }) => {
        if (!Array.isArray(data.locations)) throw new Error('bad shape')
        setLocations(data.locations)
      })
      .catch(() => setFetchError(true))
  }, [locale])

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
    <section className="relative min-h-[calc(100vh-120px)] flex items-center justify-center py-16 lg:py-28 overflow-hidden border-b border-borderLight bg-canvas text-inkBlack">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Content */}
          <div ref={contentRef} className="lg:col-span-7 space-y-8 text-left">
            <h1 className="hero-animate font-serif text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] text-inkBlack">
              {d.brand}, <span className="italic text-gold">{d.titleItalic}</span>
            </h1>

            <p className="hero-animate text-base sm:text-lg text-grayText font-light leading-relaxed max-w-xl font-sans">
              {d.title} <br />
              {d.description}
            </p>

            {/* Reassurance band */}
            <div className="hero-animate py-4 border-y border-borderLight max-w-xl grid grid-cols-2 gap-4 text-center sm:text-left">
              {d.badges.map((label: string, i: number) => (
                <div
                  key={label}
                  className={`flex flex-col sm:flex-row items-center gap-2 ${i === 1 ? 'border-l border-borderLight pl-4' : ''}`}
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
                <span>{d.cta}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <p className="text-[11px] text-grayText tracking-[0.1em] pl-1 font-light font-sans">
                {d.social} <span className="text-inkBlack font-semibold">{d.socialCount}</span> {d.socialEnd}
              </p>
            </div>
          </div>

          {/* Right: Interactive Index Map */}
          <div ref={widgetRef} className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-md bg-card border border-white/10 overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 bg-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold font-display">{di.mapLabel}</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-display">{di.mapHint}</div>
              </div>

              {/* Map — react-leaflet handles its own container */}
              <div className="relative bg-[#1a1a1a] aspect-[4/5]">
                {locations.length > 0
                  ? <LeafletMap locations={locations} joinLabel={di.joinIndex} />
                  : fetchError
                    ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/20 text-[10px] uppercase tracking-widest font-display">
                          Carte indisponible
                        </span>
                      </div>
                    )
                    : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/20 text-[10px] uppercase tracking-widest font-display animate-pulse">
                          Chargement…
                        </span>
                      </div>
                    )
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
