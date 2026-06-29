'use client'

import { useRef } from 'react'
import Link from 'next/link'
import AtelierCard from '@/components/ui/AtelierCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

const teamImgs = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
]

export default function CatalogSection({ dict }: { dict: Dictionary }) {
  const d = dict.catalog
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(gridRef as React.RefObject<HTMLElement>, { stagger: 0.12, delay: 0.15 })

  return (
    <section id="catalog" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas text-inkBlack">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader eyebrow={d.eyebrow} title={d.title} />
          <p className="text-xs text-grayText max-w-lg mx-auto font-light font-sans text-center mt-4">{d.subtitle}</p>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {d.team.map((member, i) => (
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
