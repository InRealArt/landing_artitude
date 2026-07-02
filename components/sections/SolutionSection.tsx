'use client'

import { useRef } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

export default function SolutionSection({ dict }: { dict: Dictionary }) {
  const d = dict.solution
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(stepsRef as React.RefObject<HTMLElement>, { stagger: 0.15, delay: 0.2 })

  return (
    <section id="solution" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas text-inkBlack">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={sectionRef} className="mb-20">
          <SectionHeader eyebrow={d.eyebrow} title={d.title} />
        </div>

        <div ref={stepsRef} className="grid lg:grid-cols-3 gap-8">
          {d.steps.map((s) => (
            <div
              key={s.number}
              className="bg-softGray p-8 border border-borderLight flex flex-col justify-between h-full min-h-[220px] hover:border-gold transition-colors duration-300"
            >
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-grayText font-display">
                  {s.number} // {s.label}
                </div>
                <h4 className="font-serif text-xl text-inkBlack">{s.title}</h4>
                <p className="text-base text-inkBlack/80 leading-relaxed font-light font-sans">{s.desc}</p>
              </div>
              <div className="pt-4 text-[9px] uppercase tracking-wider text-gold font-semibold font-display">
                {s.meta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-softGray border border-borderLight px-6 py-3">
            <span className="text-xs text-inkBlack font-medium font-sans">{d.badge1}</span>
            <span className="h-1.5 w-1.5 bg-grayText rounded-full" />
            <span className="text-[11px] text-grayText font-sans">{d.badge2}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
