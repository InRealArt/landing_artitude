'use client'

import { useRef } from 'react'
import Link from 'next/link'
import AtelierCard from '@/components/ui/AtelierCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const team = [
  {
    name: 'Thomas Laurent',
    role: 'Directeur Juridique & Propriété Intellectuelle',
    service: 'Kit juridique pour structurer sa carrière',
    description: 'Statuts d\'artiste, contrats types de galerie, gestion du droit de suite et de la propriété intellectuelle.',
    imageSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Sophie Dumont',
    role: 'Consultante en Stratégie de Carrière d\'Artistes',
    service: 'Kit Audit et structuration de carrière',
    description: 'Analyse globale de votre positionnement, audit de pricing d\'ateliers et plan d\'actions stratégiques.',
    imageSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Marc-Antoine Becker',
    role: 'Mentor Artistique & Curateur Principal',
    service: 'Accompagnement personnalisé',
    description: 'Suivi individuel récurrent pour développer votre signature, votre catalogue et optimiser vos relations collectionneurs.',
    imageSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Elena Rostova',
    role: 'Scénographe & Directrice d\'Expositions',
    service: 'Accompagnement expo',
    description: 'Préparation logistique de vos vernissages, conception de catalogues de ventes d\'exposition et scénographie d\'espace.',
    imageSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
  },
]

export default function CatalogSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(gridRef as React.RefObject<HTMLElement>, { stagger: 0.12, delay: 0.15 })

  return (
    <section id="catalog" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={headerRef} className="mb-20">
          <SectionHeader
            eyebrow="Notre Accompagnement"
            title="L'Équipe & Vos Services Structurés"
          />
          <p className="text-xs text-grayText max-w-lg mx-auto font-light font-sans text-center mt-4">
            Notre catalogue d&apos;artistes principaux est complet, mais notre équipe d&apos;experts est à
            votre disposition pour vous aider à structurer et propulser votre carrière d&apos;artiste indépendant.
          </p>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <AtelierCard key={member.name} {...member} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="#register"
            className="btn-action inline-flex items-center gap-3 px-8 py-4 text-xs"
          >
            <span>Solliciter un accompagnement professionnel</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
