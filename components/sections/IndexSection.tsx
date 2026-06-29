'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { gsap, registerGsap } from '@/lib/gsap'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import SectionHeader from '@/components/ui/SectionHeader'

type AtelierKey = 'ronan' | 'senechal' | 'boyer'

interface AtelierData {
  title: string
  desc: string
  tag: string
  loc: string
  img: string
}

const ateliers: Record<AtelierKey, AtelierData> = {
  ronan: {
    title: 'Atelier Ronan Martin',
    desc: 'Espace de création contemporaine de résines d\'art et d\'œuvres lumineuses.',
    tag: 'Résines',
    loc: 'Paris, France',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150&auto=format&fit=crop',
  },
  senechal: {
    title: 'Atelier Catherine Sénéchal',
    desc: 'Visites d\'atelier régulières et expositions temporaires de peintures abstraites.',
    tag: 'Peinture',
    loc: 'Lyon, France',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=150&auto=format&fit=crop',
  },
  boyer: {
    title: 'Atelier Jean-Paul Boyer',
    desc: 'Sculptures contemporaines en bois nobles et métaux de récupération.',
    tag: 'Sculpture',
    loc: 'Nice, France',
    img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=150&auto=format&fit=crop',
  },
}

const pins: { key: AtelierKey; top: string; left: string; number: string }[] = [
  { key: 'ronan', top: '35%', left: '25%', number: '01' },
  { key: 'senechal', top: '60%', left: '55%', number: '02' },
  { key: 'boyer', top: '45%', left: '75%', number: '03' },
]

export default function IndexSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<AtelierKey>('senechal')

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  useEffect(() => {
    registerGsap()
  }, [])

  const selectAtelier = (key: AtelierKey) => {
    if (!cardRef.current) return

    gsap.to(cardRef.current, {
      opacity: 0,
      y: 8,
      duration: 0.15,
      onComplete: () => {
        setActive(key)
        gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      },
    })
  }

  const data = ateliers[active]

  return (
    <section id="index" className="relative py-20 lg:py-28 bg-[#0f0f0f] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div ref={sectionRef} className="lg:col-span-5 space-y-6 text-left">
            <SectionHeader
              eyebrow="Bénéfice différenciant"
              title="Et votre atelier rejoint aussi notre Index des Ateliers."
              centered={false}
            />
            <p className="text-grayText text-xs leading-relaxed font-light font-sans">
              Chaque artiste référencé sur Artitude apparaît automatiquement dans l&apos;Index des Ateliers IRA
              — notre annuaire en ligne, avec carte interactive, consulté par les visiteurs du site InRealArt.
            </p>

            <div className="p-6 bg-card border border-white/10 flex items-center gap-5">
              <div className="h-10 w-10 border border-white/10 flex items-center justify-center text-gold font-mono font-semibold">
                ✦
              </div>
              <div>
                <div className="text-2xl font-serif font-light text-white tracking-tight">+ de 45 000</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50 font-light font-display">
                  Visiteurs uniques par mois sur le site InRealArt
                </div>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 bg-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold font-display">
                    Index Interactif (Démonstration)
                  </span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-display">
                  Cliquez pour explorer
                </div>
              </div>

              <div className="relative bg-[#1a1a1a] h-96 p-6 overflow-hidden">
                {/* Grid dots */}
                <div
                  className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* SVG lines */}
                <svg className="absolute inset-0 w-full h-full text-white/10 pointer-events-none" fill="none" viewBox="0 0 600 400">
                  <path d="M50,150 Q120,50 300,100 T550,250" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M100,350 Q220,180 400,280 T500,50" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="180" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
                </svg>

                {/* Pins */}
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
                    {active === pin.key && (
                      <span className="absolute h-6 w-6 bg-gold/20 -z-10 animate-ping" />
                    )}
                  </button>
                ))}

                {/* Preview Card */}
                <div
                  ref={cardRef}
                  className="absolute bottom-4 left-4 right-4 bg-canvas border border-borderLight p-4 shadow-2xl"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 flex-shrink-0 border border-borderLight overflow-hidden">
                      <Image
                        src={data.img}
                        alt={data.title}
                        fill
                        className="object-cover grayscale"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-inkBlack text-sm">{data.title}</h4>
                        <span className="border border-borderLight text-inkBlack text-[8px] uppercase tracking-widest px-2 py-0.5 font-semibold font-display">
                          {data.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-grayText font-light line-clamp-1 font-sans">{data.desc}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-grayText uppercase tracking-wider font-display">📍 {data.loc}</span>
                        <a href="#register" className="text-[9px] text-gold hover:underline tracking-wider font-semibold uppercase font-display">
                          Rejoindre l&apos;index
                        </a>
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
