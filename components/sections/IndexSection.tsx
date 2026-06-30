'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { registerGsap } from '@/lib/gsap'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import SectionHeader from '@/components/ui/SectionHeader'
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

export default function IndexSection({ dict, locale }: { dict: Dictionary; locale: string }) {
  const d = dict.index
  const sectionRef = useRef<HTMLDivElement>(null)
  const [locations, setLocations] = useState<GmbLocation[]>([])
  const [fetchError, setFetchError] = useState(false)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useEffect(() => { registerGsap() }, [])

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

  return (
    <section id="index" className="relative py-20 lg:py-28 bg-[#0f0f0f] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div ref={sectionRef} className="lg:col-span-5 space-y-6 text-left">
            <SectionHeader eyebrow={d.eyebrow} title={d.title} centered={false} />
            <p className="text-grayText text-xs leading-relaxed font-light font-sans">{d.description}</p>
            <div className="p-6 bg-card border border-white/10 flex items-center gap-5">
              <div className="h-10 w-10 border border-white/10 flex items-center justify-center text-gold font-mono font-semibold">✦</div>
              <div>
                <div className="text-2xl font-serif font-light text-white tracking-tight">{d.statNumber}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50 font-light font-display">{d.statLabel}</div>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-white/10 overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 bg-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold font-display">{d.mapLabel}</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-display">{d.mapHint}</div>
              </div>

              {/* Map — react-leaflet handles its own container */}
              <div className="relative bg-[#1a1a1a] h-96">
                {locations.length > 0
                  ? <LeafletMap locations={locations} joinLabel={d.joinIndex} />
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
