'use client'

import { useRef, useState } from 'react'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const disciplines = [
  { value: 'peinture', label: 'Peinture / Dessin' },
  { value: 'sculpture', label: 'Sculpture / Céramique' },
  { value: 'photographie', label: 'Photographie' },
  { value: 'art_digital', label: 'Art Numérique / Nouveaux Médias' },
  { value: 'autre', label: 'Autre discipline d\'artisanat d\'art' },
]

export default function RegisterSection() {
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
    <section id="register" className="relative py-20 lg:py-28 bg-canvas border-b border-borderLight">
      <div className="max-w-3xl mx-auto px-6">
        <div ref={sectionRef} className="bg-[#FCFAF6] border border-borderLight p-8 sm:p-12 shadow-sm space-y-8 relative">

          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-grayText font-display block">
              DÉMARRER AUJOURD&apos;HUI
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-inkBlack">
              Activez votre Artitude, gratuitement.
            </h2>
            <p className="text-xs text-grayText max-w-md mx-auto font-light font-sans">
              Remplissez ce formulaire d&apos;inscription rapide. Notre équipe d&apos;experts prendra en
              charge l&apos;optimisation de votre profil sous 48 heures.
            </p>
          </div>

          {/* Form */}
          <form id="artitude-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="Jean-Luc Boyer"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="jeanluc@boyer.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Nom de l&apos;atelier / Activité *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="Atelier Boyer Art"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                  Ville de l&apos;atelier *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
                  placeholder="Nice, France"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
                Médium artistique principal *
              </label>
              <select
                required
                className="w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors"
              >
                <option value="">Sélectionnez votre discipline...</option>
                {disciplines.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-4 w-4 accent-inkBlack border-borderLight"
              />
              <span className="text-[11px] text-grayText font-light leading-snug font-sans">
                Je souhaite recevoir les actualités InRealArt pour activer mon compte Artitude et être
                alerté des opportunités de services d&apos;accompagnement.
              </span>
            </label>

            <button
              type="submit"
              className="w-full btn-action justify-center py-4 text-[11px]"
            >
              Activer mon Artitude gratuit
            </button>

            <div className="text-center pt-2">
              <span className="text-[9px] text-grayText tracking-wider block font-sans">
                🔒 Vos données ne sont jamais revendues. Désinscription en un clic.
              </span>
            </div>
          </form>

          {/* Success Overlay */}
          {success && (
            <div className="absolute inset-0 bg-canvas/95 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="h-14 w-14 border border-inkBlack flex items-center justify-center text-inkBlack text-2xl">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-inkBlack">Demande d&apos;inscription reçue.</h3>
                <p className="text-xs text-grayText max-w-md mx-auto font-sans">
                  Merci d&apos;avoir activé votre profil. Un membre de l&apos;équipe d&apos;InRealArt va
                  procéder à l&apos;évaluation et la configuration de votre atelier sous 48 heures.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="btn-mag"
              >
                Inscrire un autre atelier
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
