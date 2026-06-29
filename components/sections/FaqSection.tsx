'use client'

import { useRef } from 'react'
import FaqItem from '@/components/ui/FaqItem'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const faqs = [
  {
    question: 'C\'est vraiment gratuit ?',
    answer: 'Oui, l\'inscription et la création de votre profil Artitude sont gratuites à 100%, aujourd\'hui et demain. Aucune carte bancaire n\'est requise. Ce service est offert par InRealArt pour soutenir la visibilité numérique des ateliers d\'artistes locaux.',
  },
  {
    question: 'Je n\'ai pas de site internet, ça fonctionne quand même ?',
    answer: 'Oui absolument. C\'est tout l\'intérêt d\'Artitude. Vous n\'avez pas besoin d\'un site web lourd et complexe : nous configurons votre fiche de façon optimale directement sur Google et au sein de notre Index des Ateliers.',
  },
  {
    question: 'Qu\'est-ce que l\'Index des Ateliers exactement ?',
    answer: 'C\'est un annuaire interactif public intégré au site InRealArt. Il regroupe l\'ensemble des créateurs référencés par notre réseau et affiche votre atelier sur notre propre carte pour vous faire profiter de notre audience d\'esthètes.',
  },
  {
    question: 'Combien de temps avant de voir des résultats ?',
    answer: 'Les premiers résultats en recherche locale sur Google et Google Maps sont visibles dès l\'activation de la fiche (environ 48 heures). L\'impact réel et les contacts d\'esthètes via l\'Index d\'Ateliers se manifestent dans les semaines suivantes.',
  },
  {
    question: 'Dois-je m\'occuper de la mise à jour de ma fiche ?',
    answer: 'Non. Dans le cadre de notre offre gratuite, vous bénéficiez de mises à jour mensuelles incluses. Il vous suffit d\'envoyer vos nouvelles œuvres d\'ateliers ou changements d\'horaires à nos équipes, et nous faisons le nécessaire.',
  },
]

export default function FaqSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const faqsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(faqsRef as React.RefObject<HTMLElement>, { stagger: 0.1, delay: 0.1 })

  return (
    <section id="faq" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas">
      <div className="max-w-4xl mx-auto px-6">
        <div ref={headerRef} className="mb-20">
          <SectionHeader
            eyebrow="Des Réponses Claires"
            title="Les questions qu'on nous pose le plus."
          />
        </div>

        <div ref={faqsRef} className="space-y-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
