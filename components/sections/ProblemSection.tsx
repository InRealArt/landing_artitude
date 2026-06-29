'use client'

import { useRef } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const problems = [
  {
    icon: '🔍',
    title: 'Vous n\'avez pas de fiche Google à jour',
    desc: 'Sans présence optimisée sur Maps et Search, vous restez invisible pour 85% des amateurs d\'art locaux recherchant des galeries près de chez eux.',
  },
  {
    icon: '⏱️',
    title: 'Vous n\'avez pas le temps de vous en occuper',
    desc: 'Mots-clés SEO, mises à jour, gestion d\'avis... Référencer correctement son travail demande des heures complexes que vous préférez passer à créer.',
  },
  {
    icon: '📍',
    title: 'Vos concurrents, eux, sont visibles',
    desc: 'D\'autres créateurs captent l\'attention immédiate des collectionneurs urbains simplement parce qu\'ils se positionnent stratégiquement sur les recherches locales.',
  },
]

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(cardsRef as React.RefObject<HTMLElement>, { stagger: 0.15, delay: 0.2 })

  return (
    <section id="problem" className="relative py-20 lg:py-28 bg-canvas border-b border-borderLight">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div ref={sectionRef} className="mb-20">
          <SectionHeader
            eyebrow="Le défi de l'artiste"
            title="Vos clients vous cherchent."
            titleItalic="Ils ne vous trouvent pas."
          />
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div
              key={p.title}
              className="advantage-box bg-softGray p-8 flex flex-col items-center text-center space-y-5 border border-borderLight hover:border-gold transition-all duration-300"
            >
              <div className="h-12 w-12 border border-borderLight flex items-center justify-center text-inkBlack text-xl">
                {p.icon}
              </div>
              <h3 className="font-serif text-lg text-inkBlack font-medium">{p.title}</h3>
              <p className="text-xs text-grayText leading-relaxed font-light font-sans">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="py-6 border-y border-borderLight bg-canvas">
            <p className="font-serif text-lg italic text-inkBlack">
              &ldquo;Ce n&apos;est pas un manque de talent. C&apos;est un manque d&apos;outil.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
