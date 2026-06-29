'use client'

import { useRef } from 'react'
import Image from 'next/image'
import StatCard from '@/components/ui/StatCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const stats = [
  { label: '+131% de recherches', target: 131, suffix: '%', description: 'Progression des ateliers référencés après optimisation de leur fiche.', barWidth: 75 },
  { label: '+116% de vues', target: 116, suffix: '%', description: 'Visibilité moyenne accrue sur Google Maps et l\'Index IRA.', barWidth: 68 },
  { label: 'Actions générées', target: 816418, suffix: '', description: 'Appels directes, demandes d\'itinéraires et clics vers sites web.', barWidth: 90 },
  { label: 'Note Google Moyenne', target: 4.9, suffix: ' / 5', description: 'Évaluation moyenne des ateliers accompagnés par notre réseau.', barWidth: 98 },
]

const testimonials = [
  {
    quote: 'Mes visites d\'atelier physiques à Lyon ont doublé en trois mois. Mes collectionneurs me trouvent directement via Google Maps.',
    name: 'Charlotte D., Artiste Peintre',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    alt: 'Charlotte Dupuis',
  },
  {
    quote: 'Je n\'avais pas le temps de m\'en occuper. L\'équipe d\'Artitude a tout structuré pour moi en 48h. C\'est simple, efficace et totalement transparent.',
    name: 'Pierre-Antoine M., Sculpteur',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    alt: 'Pierre-Antoine',
  },
]

export default function StatsSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(testimonialsRef as React.RefObject<HTMLElement>, { stagger: 0.2, delay: 0.1 })

  return (
    <section id="stats" className="section-dark-premium relative py-20 lg:py-28 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader
            eyebrow="Preuves par les chiffres"
            title="Les chiffres ne mentent pas."
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div
          ref={testimonialsRef}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-8 border-t border-white/10"
        >
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative w-16 h-16 flex-shrink-0 border border-white/10 overflow-hidden">
                <Image
                  src={t.img}
                  alt={t.alt}
                  fill
                  className="object-cover grayscale"
                  unoptimized
                />
              </div>
              <div className="space-y-2">
                <div className="flex text-gold text-xs">★ ★ ★ ★ ★</div>
                <p className="text-xs italic text-white/80 font-light font-serif">&ldquo;{t.quote}&rdquo;</p>
                <span className="block text-[10px] uppercase tracking-wider text-gold font-semibold font-display">
                  — {t.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
