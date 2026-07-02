'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { registerGsap } from '@/lib/gsap'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Dictionary } from '@/lib/dictionaries'

export default function IndexSection({ dict }: { dict: Dictionary }) {
  const d = dict.index
  const h = dict.hero
  const sectionRef = useRef<HTMLDivElement>(null)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })
  useEffect(() => { registerGsap() }, [])

  return (
    <section id="index" className="relative py-20 lg:py-28 bg-[#0f0f0f] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div ref={sectionRef} className="lg:col-span-5 space-y-6 text-left">
            <SectionHeader eyebrow={d.eyebrow} title={d.title} centered={false} />
            <p className="text-white/80 text-base leading-relaxed font-light font-sans">{d.description}</p>
          </div>

          {/* Right: Google Mock Widget */}
          <div className="lg:col-span-7 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] bg-softGray border border-borderLight overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop"
                alt="Atelier d'artiste"
                fill
                className="object-cover grayscale brightness-90"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-transparent to-transparent" />

              {/* Widget Google */}
              <div className="absolute bottom-6 left-5 right-5 bg-canvas text-inkBlack rounded-none p-5 shadow-2xl border border-borderLight">
                <div className="absolute -top-3 right-4 bg-inkBlack text-gold font-semibold text-[8px] uppercase tracking-[0.25em] px-2.5 py-1 flex items-center gap-1.5 border border-inkBlack">
                  <span className="h-1.5 w-1.5 bg-gold animate-ping" />
                  {h.widgetBadge}
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-softGray p-2 border border-borderLight">
                    <svg className="w-6 h-6 fill-current text-inkBlack" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.3-.176-1.855H12.24z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-inkBlack tracking-wide">
                      {h.widgetName}
                    </h4>
                    <p className="text-[10px] uppercase tracking-wider text-grayText font-display">
                      {h.widgetSubtitle}
                    </p>
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-inkBlack font-bold text-xs">4.9</span>
                      <div className="flex text-inkBlack text-[10px]">★ ★ ★ ★ ★</div>
                      <span className="text-[10px] text-grayText font-light">(48)</span>
                    </div>
                  </div>
                </div>

                <hr className="my-4 border-borderLight" />

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-grayText uppercase tracking-wider font-display">
                  {h.widgetActions.map((label: string) => (
                    <div
                      key={label}
                      className="py-1 border border-borderLight hover:bg-softGray transition-colors cursor-pointer hover:text-gold"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
