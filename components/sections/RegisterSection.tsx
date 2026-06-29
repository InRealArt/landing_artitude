'use client'

import { useRef, useState } from 'react'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'

export default function RegisterSection({ dict }: { dict: Dictionary }) {
  const d = dict.register
  const sectionRef = useRef<HTMLDivElement>(null)
  const [success, setSuccess] = useState(false)

  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(true)
  }

  const handleReset = () => {
    setSuccess(false)
    const form = document.getElementById('artitude-form') as HTMLFormElement
    form?.reset()
  }

  return (
    <section id="register" className="relative py-20 lg:py-28 bg-background border-b border-white/10 text-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-display block">{d.eyebrow}</span>
          <p className="text-white/50 text-xs font-light font-sans">{d.subtitle}</p>
        </div>
        <div ref={sectionRef} className="bg-canvas border border-borderLight p-8 sm:p-12 shadow-2xl space-y-8 relative text-inkBlack">

          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-grayText font-display block">{d.formEyebrow}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-inkBlack">{d.formTitle}</h2>
            <p className="text-xs text-grayText max-w-md mx-auto font-light font-sans">{d.formSubtitle}</p>
          </div>

          <form id="artitude-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">{d.fieldName}</label>
                <input type="text" required className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors" placeholder={d.fieldNamePlaceholder} />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">{d.fieldEmail}</label>
                <input type="email" required className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors" placeholder={d.fieldEmailPlaceholder} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">{d.fieldAtelier}</label>
                <input type="text" required className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors" placeholder={d.fieldAtelierPlaceholder} />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">{d.fieldCity}</label>
                <input type="text" required className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors" placeholder={d.fieldCityPlaceholder} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">{d.fieldDiscipline}</label>
              <select required className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors">
                <option value="">{d.fieldDisciplinePlaceholder}</option>
                {d.disciplines.map((disc) => (
                  <option key={disc.value} value={disc.value}>{disc.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-inkBlack border-borderLight" />
              <span className="text-[11px] text-grayText font-light leading-snug font-sans">{d.consent}</span>
            </label>

            <button type="submit" className="w-full btn-action justify-center py-4 text-[11px]">{d.submit}</button>

            <div className="text-center pt-2">
              <span className="text-[9px] text-grayText tracking-wider block font-sans">{d.privacy}</span>
            </div>
          </form>

          {success && (
            <div className="absolute inset-0 bg-canvas/95 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="h-14 w-14 border border-inkBlack flex items-center justify-center text-inkBlack text-2xl">✓</div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-inkBlack">{d.successTitle}</h3>
                <p className="text-xs text-grayText max-w-md mx-auto font-sans">{d.successDesc}</p>
              </div>
              <button onClick={handleReset} className="btn-mag">{d.successReset}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
