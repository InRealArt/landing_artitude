'use client'

import { useRef } from 'react'
import Image from 'next/image'
import StatCard from '@/components/ui/StatCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

const statsMeta = [
  { target: 131, suffix: '%', barWidth: 75 },
  { target: 116, suffix: '%', barWidth: 68 },
  { target: 816418, suffix: '', barWidth: 90 },
  { target: 5, suffix: ' / 5', barWidth: 98 },
]

const testimonialImgs = [
  '/images/testimonials/senechal.avif',
  '/images/testimonials/boyer.avif',
]

export default function StatsSection({ dict }: { dict: Dictionary }) {
  const d = dict.stats
  const headerRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(testimonialsRef as React.RefObject<HTMLElement>, { stagger: 0.2, delay: 0.1 })

  return (
    <section id="stats" className="section-dark-premium relative py-20 lg:py-28 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader eyebrow={d.eyebrow} title={d.title} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {d.items.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              target={statsMeta[i].target}
              suffix={statsMeta[i].suffix}
              description={s.description}
              barWidth={statsMeta[i].barWidth}
            />
          ))}
        </div>

        <div ref={testimonialsRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-8 border-t border-white/10">
          {d.testimonials.map((t, i) => (
            <div key={t.name} className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative w-14 h-14 flex-shrink-0 rounded-full border border-white/20 overflow-hidden ring-2 ring-gold/30 self-start">
                <Image src={testimonialImgs[i]} alt={t.name} fill className="object-cover object-top grayscale" />
              </div>
              <div className="space-y-2">
                <div className="flex text-gold text-xs">★ ★ ★ ★ ★</div>
                <p className="text-xs italic text-white/80 font-light font-serif">&ldquo;{t.quote}&rdquo;</p>
                <span className="block text-[10px] uppercase tracking-wider text-gold font-semibold font-display">— {t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
