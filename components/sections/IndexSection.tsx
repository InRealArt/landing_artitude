'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { gsap, registerGsap } from '@/lib/gsap'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Dictionary } from '@/lib/dictionaries'

type AtelierKey = 'ronan' | 'senechal' | 'boyer'

const imgs: Record<AtelierKey, string> = {
  ronan: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150&auto=format&fit=crop',
  senechal: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=150&auto=format&fit=crop',
  boyer: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=150&auto=format&fit=crop',
}

const pins: { key: AtelierKey; top: string; left: string; number: string }[] = [
  { key: 'ronan', top: '35%', left: '25%', number: '01' },
  { key: 'senechal', top: '60%', left: '55%', number: '02' },
  { key: 'boyer', top: '45%', left: '75%', number: '03' },
]

export default function IndexSection({ dict }: { dict: Dictionary }) {
  const d = dict.index
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<AtelierKey>('senechal')

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  useEffect(() => { registerGsap() }, [])

  const selectAtelier = (key: AtelierKey) => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      opacity: 0, y: 8, duration: 0.15,
      onComplete: () => {
        setActive(key)
        gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      },
    })
  }

  const atelier = d.ateliers[active]
  const img = imgs[active]

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
              <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 bg-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold font-display">{d.mapLabel}</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-display">{d.mapHint}</div>
              </div>

              <div className="relative bg-[#1a1a1a] h-96 p-6 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />
                <svg className="absolute inset-0 w-full h-full text-white/10 pointer-events-none" fill="none" viewBox="0 0 600 400">
                  <path d="M50,150 Q120,50 300,100 T550,250" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M100,350 Q220,180 400,280 T500,50" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="180" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
                </svg>

                {pins.map((pin) => (
                  <button
                    key={pin.key}
                    onClick={() => selectAtelier(pin.key)}
                    className="absolute group flex flex-col items-center"
                    style={{ top: pin.top, left: pin.left }}
                  >
                    <div className={`h-6 w-6 border border-white flex items-center justify-center transform transition-transform group-hover:scale-110 shadow ${active === pin.key ? 'bg-gold' : 'bg-inkBlack'}`}>
                      <span className="text-[9px] font-bold text-white font-display">{pin.number}</span>
                    </div>
                    {active === pin.key && <span className="absolute h-6 w-6 bg-gold/20 -z-10 animate-ping" />}
                  </button>
                ))}

                <div ref={cardRef} className="absolute bottom-4 left-4 right-4 bg-canvas border border-borderLight p-4 shadow-2xl">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 flex-shrink-0 border border-borderLight overflow-hidden">
                      <Image src={img} alt={atelier.title} fill className="object-cover grayscale" unoptimized />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-inkBlack text-sm">{atelier.title}</h4>
                        <span className="border border-borderLight text-inkBlack text-[8px] uppercase tracking-widest px-2 py-0.5 font-semibold font-display">{atelier.tag}</span>
                      </div>
                      <p className="text-[10px] text-grayText font-light line-clamp-1 font-sans">{atelier.desc}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-grayText uppercase tracking-wider font-display">📍 {atelier.loc}</span>
                        <a href="#register" className="text-[9px] text-gold hover:underline tracking-wider font-semibold uppercase font-display">{d.joinIndex}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
