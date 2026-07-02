'use client'

import { useRef } from 'react'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

// Google Maps pin — card 1 (no GMB listing)
function IconMapPin() {
  return (
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <path
        d="M20 2C11.163 2 4 9.163 4 18c0 12.75 16 28 16 28S36 30.75 36 18C36 9.163 28.837 2 20 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Google-style coloured dots inside the pin */}
      <circle cx="17" cy="16" r="2" fill="#4285F4" />
      <circle cx="23" cy="16" r="2" fill="#EA4335" />
      <circle cx="17" cy="22" r="2" fill="#FBBC05" />
      <circle cx="23" cy="22" r="2" fill="#34A853" />
      {/* slash — "not found" */}
      <line x1="13" y1="13" x2="27" y2="27" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Google Search / clock — card 2 (no time)
function IconGSearch() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      {/* Magnifying glass */}
      <circle cx="17" cy="17" r="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Google G shape inside glass */}
      <path
        d="M21 17h-4.5v2H19v1.5a3 3 0 1 1-2-5.28"
        stroke="#4285F4"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16.5" cy="17" r="1" fill="#4285F4" opacity="0" />
      {/* Clock overlay bottom-right */}
      <circle cx="31" cy="31" r="7" fill="#1d1c1c" stroke="currentColor" strokeWidth="1" />
      <line x1="31" y1="28" x2="31" y2="31" stroke="#FBBC05" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="31" y1="31" x2="33.5" y2="33" stroke="#FBBC05" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// Competitor pin visible — card 3 (competitors ranked higher)
function IconCompetitorPin() {
  return (
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      {/* Main pin — gold (competitor, visible) */}
      <path
        d="M20 2C11.163 2 4 9.163 4 18c0 12.75 16 28 16 28S36 30.75 36 18C36 9.163 28.837 2 20 2Z"
        stroke="#b89c72"
        strokeWidth="1.5"
        fill="#b89c7222"
      />
      <circle cx="20" cy="18" r="5" stroke="#b89c72" strokeWidth="1.2" fill="none" />
      {/* Small ghost pin behind — us, invisible */}
      <path
        d="M32 4C28.134 4 25 7.134 25 11c0 6 7 13 7 13s7-7 7-13c0-3.866-3.134-7-7-7Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

const CARD_ICONS = [IconMapPin, IconGSearch, IconCompetitorPin]

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
          {d.items.map((p, i) => {
            const Icon = CARD_ICONS[i] ?? CARD_ICONS[0]
            return (
              <div
                key={p.title}
                className="advantage-box bg-card p-8 flex flex-col items-center text-center space-y-5 border border-white/10 hover:border-gold hover:bg-white/5 transition-all duration-300"
              >
                <div className="h-14 w-14 border border-white/10 flex items-center justify-center text-white/80">
                  <Icon />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">{p.title}</h3>
                <p className="text-base text-white/90 leading-relaxed font-light font-sans">{p.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="py-6 border-y border-white/10 space-y-3 flex flex-col items-center">
            <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-full border border-white/20 overflow-hidden ring-2 ring-gold/30">
              <Image src="/images/testimonials/boyer.avif" alt={d.quoteAuthor} fill className="object-cover object-top grayscale" />
            </div>
            <div className="flex justify-center text-gold text-xs">★ ★ ★ ★ ★</div>
            <p className="font-serif text-lg italic text-white/90">
              &ldquo;{d.quote}&rdquo;
            </p>
            <span className="block text-[10px] uppercase tracking-wider text-gold font-semibold font-display">— {d.quoteAuthor}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
