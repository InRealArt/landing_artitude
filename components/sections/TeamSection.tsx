'use client'

import { useRef } from 'react'
import Link from 'next/link'
import AtelierCard from '@/components/ui/AtelierCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

const teamImgs = [
  '/images/team/tim.webp',
  '/images/team/max.webp',
  '/images/team/anna.webp',
  '/images/team/clara.webp',
  '/images/team/gilles.webp',
  '/images/team/lauranne.webp',
]

export default function TeamSection({ dict }: { dict: Dictionary }) {
  const d = dict.team
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(gridRef as React.RefObject<HTMLElement>, { stagger: 0.1, delay: 0.15 })

  return (
    <section id="team" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas text-inkBlack">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader eyebrow={d.eyebrow} title={d.title} />
          <p className="text-base text-inkBlack/80 max-w-lg mx-auto font-light font-sans text-center mt-4">{d.subtitle}</p>
        </div>

        {/* 3 colonnes sur 2 lignes, responsive */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {d.members.map((member, i) => (
            <AtelierCard key={member.name} {...member} imageSrc={teamImgs[i]} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="#register" className="btn-action inline-flex items-center gap-3 px-8 py-4 text-xs">
            <span>{d.cta}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
