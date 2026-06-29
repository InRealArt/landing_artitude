'use client'

import { useRef } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const steps = [
  {
    number: '01',
    label: 'INSCRIPTION',
    title: 'Vous vous inscrivez (2 min)',
    desc: 'Remplissez vos informations d\'atelier en 2 minutes chrono. Pas de processus complexe, nous récupérons uniquement l\'essentiel.',
    meta: 'Temps requis : 2 minutes',
  },
  {
    number: '02',
    label: 'OPTIMISATION',
    title: 'On optimise votre fiche Google',
    desc: 'Nos experts structurent votre fiche d\'atelier Google : intégration esthétique de vos photos, définition de mots-clés et configuration des horaires.',
    meta: 'Délai : sous 48 Heures',
  },
  {
    number: '03',
    label: 'EXPOSITION',
    title: 'Vous êtes visible sur Maps & l\'Index',
    desc: 'Votre atelier devient repérable sur Google Search, Google Maps, et rejoint instantanément notre Index des Ateliers pour capter une audience d\'esthètes.',
    meta: 'Visibilité Google + InRealArt',
  },
]

export default function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(stepsRef as React.RefObject<HTMLElement>, { stagger: 0.15, delay: 0.2 })

  return (
    <section id="solution" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas text-inkBlack">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={sectionRef} className="mb-20">
          <SectionHeader
            eyebrow="Une offre clé en main"
            title="Artitude, votre vitrine numérique gérée pour vous."
          />
        </div>

        <div ref={stepsRef} className="grid lg:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div
              key={s.number}
              className="bg-softGray p-8 border border-borderLight flex flex-col justify-between h-full min-h-[220px] hover:border-gold transition-colors duration-300"
            >
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-grayText font-display">
                  {s.number} // {s.label}
                </div>
                <h4 className="font-serif text-xl text-inkBlack">{s.title}</h4>
                <p className="text-xs text-grayText leading-relaxed font-light font-sans">{s.desc}</p>
              </div>
              <div className="pt-4 text-[9px] uppercase tracking-wider text-gold font-semibold font-display">
                {s.meta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-softGray border border-borderLight px-6 py-3">
            <span className="text-xs text-inkBlack font-medium font-sans">
              Mise à jour mensuelle gratuite incluse
            </span>
            <span className="h-1.5 w-1.5 bg-grayText rounded-full" />
            <span className="text-[11px] text-grayText font-sans">
              Modifiez vos photos, horaires ou actualités en 1 clic
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
