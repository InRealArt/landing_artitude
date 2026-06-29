'use client'

import { useRef } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

export default function ProblemSection({ dict }: { dict: Dictionary }) {
  const d = dict.problem
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(cardsRef as React.RefObject<HTMLElement>, { stagger: 0.15, delay: 0.2 })

  return (
    <section id="problem" className="relative py-20 lg:py-28 bg-background border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={sectionRef} className="mb-20">
          <SectionHeader
            eyebrow={d.eyebrow}
            title={d.title}
            titleItalic={d.titleItalic}
          />
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {d.items.map((p) => (
            <div
              key={p.title}
              className="advantage-box bg-card p-8 flex flex-col items-center text-center space-y-5 border border-white/10 hover:border-gold transition-all duration-300"
            >
              <div className="h-12 w-12 border border-white/10 flex items-center justify-center text-white text-xl">
                {p.icon}
              </div>
              <h3 className="font-serif text-lg text-white font-medium">{p.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light font-sans">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="py-6 border-y border-white/10">
            <p className="font-serif text-lg italic text-white/90">
              &ldquo;{d.quote}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
