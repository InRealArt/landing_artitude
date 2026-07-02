'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/dictionaries'

type Status = 'idle' | 'pending' | 'success' | 'error'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 text-sm font-sans tracking-wide border animate-fade-in
        ${type === 'success' ? 'text-gold border-gold bg-[#0f0f0f]' : 'text-red-400 border-red-400 bg-[#0f0f0f]'}`}
    >
      {message}
    </div>
  )
}

export default function NewsletterSection({ dict, locale }: { dict: Dictionary; locale: string }) {
  const d = dict.newsletter
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'pending') return

    setStatus('pending')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), language: locale }),
      })

      const data = await res.json() as { message?: string; error?: string }

      if (!res.ok) {
        showToast(data.error ?? d.errorMsg, 'error')
        setStatus('error')
        return
      }

      showToast(data.message ?? d.successMsg, 'success')
      setEmail('')
      setStatus('success')
    } catch {
      showToast(d.errorMsg, 'error')
      setStatus('error')
    } finally {
      if (status !== 'success') setStatus('idle')
    }
  }

  const isPending = status === 'pending'

  return (
    <section className="w-full bg-[#f9f9f9] border-t border-b border-[#eeeeee] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — image */}
          <div className="relative h-[360px] lg:h-[480px] overflow-hidden bg-black" aria-hidden="true">
            <img
              src="/images/newsletter/newsletter.avif"
              alt="In Real Art"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Vignettes */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.60) 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 h-[40%] pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
            {/* Decorative frames */}
            <div className="absolute inset-5 border border-[rgba(184,156,114,0.25)] pointer-events-none" />
            <div className="absolute inset-9 border border-[rgba(184,156,114,0.12)] pointer-events-none" />
            {/* Corner accents */}
            <div className="absolute bottom-5 left-5 w-10 h-px bg-[rgba(184,156,114,0.6)]" />
            <div className="absolute bottom-5 left-5 w-px h-10 bg-[rgba(184,156,114,0.6)]" />
            <div className="absolute top-5 right-5 w-10 h-px bg-[rgba(184,156,114,0.6)]" />
            <div className="absolute top-5 right-5 w-px h-10 bg-[rgba(184,156,114,0.6)]" />
          </div>

          {/* Right — copy + form */}
          <div className="flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.5em] text-[#aaa] font-display mb-6 block">
              {d.eyebrow}
            </span>

            <h2 className="font-serif italic text-[clamp(2rem,4vw,3.75rem)] leading-[1.15] font-normal text-[#000] mb-6">
              {d.title}{' '}
              <em className="not-italic text-gold">{d.titleAccent}</em>
            </h2>

            <p className="text-base text-[#444] leading-loose font-light font-sans mb-2">
              {d.subtitle}
            </p>
            <p className="text-sm text-[#555] leading-loose font-light font-sans mb-10">
              {d.description}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className={`relative border-b mb-8 transition-colors duration-300 ${isPending ? 'border-[#eeeeee]' : 'border-[#eeeeee] focus-within:border-gold'}`}>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={d.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="w-full bg-transparent border-none outline-none py-3 text-base font-light font-sans text-[#000] placeholder:text-[#666] disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="self-start px-7 py-4 border border-[#000] text-xs uppercase tracking-[0.25em] font-sans bg-transparent text-[#000] transition-all duration-500 hover:bg-[#000] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? d.ctaPending : d.cta}
              </button>
            </form>
          </div>

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </section>
  )
}
