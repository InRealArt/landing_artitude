'use client'

import { useRef } from 'react'
import FaqItem from '@/components/ui/FaqItem'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

export default function FaqSection({ dict }: { dict: Dictionary }) {
  const d = dict.faq
  const headerRef = useRef<HTMLDivElement>(null)
  const faqsRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef as React.RefObject<HTMLElement>, { y: 30 })
  useGsapReveal(faqsRef as React.RefObject<HTMLElement>, { stagger: 0.1, delay: 0.1 })

  return (
    <section id="faq" className="relative py-20 lg:py-28 border-b border-borderLight bg-canvas text-inkBlack">
      <div className="max-w-4xl mx-auto px-6">
        <div ref={headerRef} className="mb-20">
          <SectionHeader eyebrow={d.eyebrow} title={d.title} />
        </div>
        <div ref={faqsRef} className="space-y-4">
          {d.items.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
