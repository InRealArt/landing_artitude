'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'
import HoursGrid, { defaultHours, DayHours } from '@/components/ui/HoursGrid'
import PhotoUploadZone from '@/components/ui/PhotoUploadZone'

const MAX_PHOTO_SIZE = 1 * 1024 * 1024 // 1 MB

// ── Validators ──────────────────────────────────────────────────────────────

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RE_PHONE = /^[+]?(?=(?:[\s\-().]*\d){7})[\d\s\-().]{7,20}$/
const RE_ADDRESS = /\d/

// Postal code patterns per country code
const POSTAL_PATTERNS: Record<string, RegExp> = {
  FR: /^\d{5}$/,                              // France — 75001
  BE: /^\d{4}$/,                              // Belgique — 1000
  CH: /^\d{4}$/,                              // Suisse — 1200
  LU: /^\d{4}$/,                              // Luxembourg — 1234
  DE: /^\d{5}$/,                              // Allemagne — 10115
  ES: /^\d{5}$/,                              // Espagne — 28001
  IT: /^\d{5}$/,                              // Italie — 00100
  PT: /^\d{4}-\d{3}$/,                        // Portugal — 1000-001 (tiret obligatoire)
  NL: /^\d{4}\s?[A-Z]{2}$/,                   // Pays-Bas — 1234 AB (uppercase strict)
  GB: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, // UK — SW1A 1AA
  CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,          // Canada — K1A 0B1 (uppercase strict)
  US: /^\d{5}(-\d{4})?$/,                     // USA — 90210 ou 90210-1234
}
const POSTAL_FALLBACK = /^[A-Z0-9][A-Z0-9\s\-]{1,8}[A-Z0-9]$/i

function isValidPostalCode(postalCode: string, country: string): boolean {
  const pattern = POSTAL_PATTERNS[country] ?? POSTAL_FALLBACK
  return pattern.test(postalCode.trim())
}

interface Step1Msgs {
  validationName: string; validationEmail: string; validationPhone: string
  validationAtelier: string; validationDiscipline: string; validationWebsite: string; validationConsent: string
}

interface Step2Msgs {
  validationAddress: string; validationPostalCode: string; validationCity: string
}

function validateStep1(
  values: { name: string; email: string; phone: string; atelierName: string; discipline: string; website: string; consent: boolean },
  msgs: Step1Msgs
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (values.name.trim().length < 2) errors.name = msgs.validationName
  if (!RE_EMAIL.test(values.email.trim())) errors.email = msgs.validationEmail
  if (!RE_PHONE.test(values.phone.trim())) errors.phone = msgs.validationPhone
  if (values.atelierName.trim().length < 2) errors.atelierName = msgs.validationAtelier
  if (!values.discipline) errors.discipline = msgs.validationDiscipline
  if (values.website && !isValidUrl(values.website)) errors.website = msgs.validationWebsite
  if (!values.consent) errors.consent = msgs.validationConsent
  return errors
}

function validateStep2(
  values: { address: string; postalCode: string; city: string; country: string },
  msgs: Step2Msgs
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (values.address.trim().length < 5 || !RE_ADDRESS.test(values.address)) errors.address = msgs.validationAddress
  if (!isValidPostalCode(values.postalCode, values.country)) errors.postalCode = msgs.validationPostalCode
  if (values.city.trim().length < 1) errors.city = msgs.validationCity
  return errors
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

type ProgressStep = {
  id: string
  labelKey: string
  status: 'pending' | 'running' | 'done' | 'error'
}

const INITIAL_STEPS = (d: Record<string, string>): ProgressStep[] => [
  { id: 'validate', labelKey: d.progressValidate, status: 'pending' },
  { id: 'excel', labelKey: d.progressExcel, status: 'pending' },
  { id: 'email', labelKey: d.progressEmail, status: 'pending' },
]

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-[10px] text-red-500 font-sans mt-1">{msg}</p>
}

function ProgressModal({
  steps,
  error,
  onClose,
  dict,
}: {
  steps: ProgressStep[]
  error: string | null
  onClose?: () => void
  dict: Dictionary['register']
}) {
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Focus the dialog on open
  useEffect(() => {
    if (mounted) dialogRef.current?.focus()
  }, [mounted])

  // Escape key closes the modal (only when closeable)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Focus trap: keep Tab/Shift+Tab within the dialog
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) { e.preventDefault(); return }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', trap)
    return () => el.removeEventListener('keydown', trap)
  }, [mounted])

  const allDone = steps.every((s) => s.status === 'done')
  const hasError = steps.some((s) => s.status === 'error')

  const content = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dict.progressTitle}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 outline-none"
    >
      <div className="relative bg-canvas w-full max-w-sm p-10 shadow-2xl space-y-8 text-center">
        {(allDone || hasError) && onClose && (
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center text-grayText hover:text-inkBlack transition-colors duration-200 group"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
            </svg>
          </button>
        )}
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-display">
            {allDone ? dict.progressDoneEyebrow : dict.progressEyebrow}
          </p>
          <h3 className="font-serif text-2xl text-inkBlack">
            {hasError ? dict.progressErrorTitle : allDone ? dict.progressDoneTitle : dict.progressTitle}
          </h3>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4 text-left">
              <div
                className={`
                  h-6 w-6 flex-shrink-0 flex items-center justify-center border text-[10px] font-display transition-all duration-300
                  ${step.status === 'done' ? 'bg-inkBlack border-inkBlack text-white' : ''}
                  ${step.status === 'running' ? 'border-gold bg-gold/10' : ''}
                  ${step.status === 'pending' ? 'border-borderLight text-grayText' : ''}
                  ${step.status === 'error' ? 'border-red-400 bg-red-50 text-red-500' : ''}
                `}
              >
                {step.status === 'done' && '✓'}
                {step.status === 'running' && (
                  <span className="inline-block h-3 w-3 border border-gold border-t-transparent rounded-full animate-spin" />
                )}
                {step.status === 'pending' && i + 1}
                {step.status === 'error' && '✕'}
              </div>
              <span
                className={`text-xs font-sans transition-colors duration-300
                  ${step.status === 'done' ? 'text-inkBlack font-medium' : ''}
                  ${step.status === 'running' ? 'text-inkBlack' : ''}
                  ${step.status === 'pending' ? 'text-grayText' : ''}
                  ${step.status === 'error' ? 'text-red-500' : ''}
                `}
              >
                {step.labelKey}
              </span>
            </div>
          ))}
        </div>

        {!allDone && !hasError && (
          <p className="text-[11px] text-gold font-sans bg-gold/10 border border-gold/30 px-4 py-3">
            {dict.progressWarning}
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600 font-sans bg-red-50 border border-red-200 px-4 py-3 text-left">
            {error}
          </p>
        )}

        {(allDone || hasError) && onClose && (
          <button
            onClick={onClose}
            className={allDone ? 'btn-action justify-center py-3 text-[11px]' : 'btn-mag'}
          >
            {allDone ? dict.progressDoneBtn : dict.progressRetryBtn}
          </button>
        )}
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}

export default function RegisterSection({ dict, lang }: { dict: Dictionary; lang: string }) {
  const d = dict.register
  const sectionRef = useRef<HTMLDivElement>(null)
  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [clientMounted, setClientMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { setClientMounted(true) }, [])

  // Warn before leaving while the submission is in flight — closing/refreshing
  // now would abandon a request the server may already be processing.
  useEffect(() => {
    if (!submitting) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [submitting])

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([])
  const [progressError, setProgressError] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [atelierName, setAtelierName] = useState('')
  const [website, setWebsite] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [consent, setConsent] = useState(false)

  // Step 2
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('FR')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState<DayHours[]>(defaultHours())

  // Step 3 — Exterior
  const [photoCover, setPhotoCover] = useState<File | null>(null)
  const [photoExterior1, setPhotoExterior1] = useState<File | null>(null)
  const [photoExterior2, setPhotoExterior2] = useState<File | null>(null)
  const [photoExterior3, setPhotoExterior3] = useState<File | null>(null)

  // Step 4 — Interior
  const [photoInterior1, setPhotoInterior1] = useState<File | null>(null)
  const [photoInterior2, setPhotoInterior2] = useState<File | null>(null)
  const [photoInterior3, setPhotoInterior3] = useState<File | null>(null)
  const [photoInterior4, setPhotoInterior4] = useState<File | null>(null)

  // Step 5 — Owner & Artworks
  const [photoOwner, setPhotoOwner] = useState<File | null>(null)
  const [photoArtwork1, setPhotoArtwork1] = useState<File | null>(null)
  const [photoArtwork2, setPhotoArtwork2] = useState<File | null>(null)
  const [photoArtwork3, setPhotoArtwork3] = useState<File | null>(null)
  const [photoArtwork4, setPhotoArtwork4] = useState<File | null>(null)
  const [photoArtwork5, setPhotoArtwork5] = useState<File | null>(null)

  const inputCls = 'w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display'

  const handleNext = () => {
    setFieldErrors({})
    if (step === 1) {
      const msgs = {
        validationName: d.validationName, validationEmail: d.validationEmail,
        validationPhone: d.validationPhone, validationAtelier: d.validationAtelier,
        validationDiscipline: d.validationDiscipline, validationWebsite: d.validationWebsite,
        validationConsent: d.validationConsent,
      }
      const errors = validateStep1({ name, email, phone, atelierName, discipline, website, consent }, msgs)
      if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    }
    if (step === 2) {
      const msgs = {
        validationAddress: d.validationAddress, validationPostalCode: d.validationPostalCode,
        validationCity: d.validationCity,
      }
      const errors = validateStep2({ address, postalCode, city, country }, msgs)
      if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    }
    setStep((s) => Math.min(s + 1, 5))
  }

  const handlePrev = () => { setFieldErrors({}); setStep((s) => Math.max(s - 1, 1)) }

  const updateStep = (
    steps: ProgressStep[],
    id: string,
    status: ProgressStep['status']
  ): ProgressStep[] =>
    steps.map((s) => (s.id === id ? { ...s, status } : s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // Re-validate step 1 & 2 defensively — covers any direct state manipulation
    const step1Msgs = {
      validationName: d.validationName, validationEmail: d.validationEmail,
      validationPhone: d.validationPhone, validationAtelier: d.validationAtelier,
      validationDiscipline: d.validationDiscipline, validationWebsite: d.validationWebsite,
      validationConsent: d.validationConsent,
    }
    const step1Errors = validateStep1({ name, email, phone, atelierName, discipline, website, consent }, step1Msgs)
    if (Object.keys(step1Errors).length > 0) {
      setFieldErrors(step1Errors)
      setStep(1)
      return
    }
    const step2Msgs = {
      validationAddress: d.validationAddress, validationPostalCode: d.validationPostalCode,
      validationCity: d.validationCity,
    }
    const step2Errors = validateStep2({ address, postalCode, city, country }, step2Msgs)
    if (Object.keys(step2Errors).length > 0) {
      setFieldErrors(step2Errors)
      setStep(2)
      return
    }

    const hasInterior = [photoInterior1, photoInterior2, photoInterior3, photoInterior4].some(Boolean)
    if (!photoCover || !photoOwner || !hasInterior) {
      setErrorMsg(d.errorPhotos)
      return
    }

    const photoChecks = [
      { file: photoCover, label: d.photoCover },
      { file: photoExterior1, label: d.photoExterior1 },
      { file: photoExterior2, label: d.photoExterior2 },
      { file: photoExterior3, label: d.photoExterior3 },
      { file: photoInterior1, label: d.photoInterior1 },
      { file: photoInterior2, label: d.photoInterior2 },
      { file: photoInterior3, label: d.photoInterior3 },
      { file: photoInterior4, label: d.photoInterior4 },
      { file: photoOwner, label: d.photoOwner },
      { file: photoArtwork1, label: d.photoArtwork1 },
      { file: photoArtwork2, label: d.photoArtwork2 },
      { file: photoArtwork3, label: d.photoArtwork3 },
      { file: photoArtwork4, label: d.photoArtwork4 },
      { file: photoArtwork5, label: d.photoArtwork5 },
    ].filter((c): c is { file: File; label: string } => c.file !== null)

    for (const { file, label } of photoChecks) {
      if (file.size > MAX_PHOTO_SIZE) {
        setErrorMsg(d.errorPhotoSize.replace('{label}', label).replace('{size}', (file.size / 1024 / 1024).toFixed(1)))
        return
      }
    }

    setSubmitting(true)

    const initialSteps = INITIAL_STEPS({
      progressValidate: d.progressValidate,
      progressExcel: d.progressExcel,
      progressEmail: d.progressEmail,
    })

    setProgressSteps(initialSteps)
    setProgressError(null)
    setShowProgress(true)

    try {
      // Step 1 — validation
      setProgressSteps((prev) => updateStep(prev, 'validate', 'running'))
      await new Promise((r) => setTimeout(r, 400))

      const fd = new FormData()
      fd.append('name', name)
      fd.append('email', email)
      fd.append('title', atelierName)
      fd.append('phone', phone)
      fd.append('language', lang)
      fd.append('addressLine', address)
      fd.append('postalCode', postalCode)
      fd.append('locality', city)
      fd.append('regionCode', country)
      fd.append('consent', String(consent))
      if (website) fd.append('websiteUri', website)
      if (description) fd.append('description', description)
      fd.append('hours', JSON.stringify(hours))
      fd.append('photoCover', photoCover)
      if (photoExterior1) fd.append('photoExterior1', photoExterior1)
      if (photoExterior2) fd.append('photoExterior2', photoExterior2)
      if (photoExterior3) fd.append('photoExterior3', photoExterior3)
      if (photoInterior1) fd.append('photoInterior1', photoInterior1)
      if (photoInterior2) fd.append('photoInterior2', photoInterior2)
      if (photoInterior3) fd.append('photoInterior3', photoInterior3)
      if (photoInterior4) fd.append('photoInterior4', photoInterior4)
      fd.append('photoOwner', photoOwner)
      if (photoArtwork1) fd.append('photoArtwork1', photoArtwork1)
      if (photoArtwork2) fd.append('photoArtwork2', photoArtwork2)
      if (photoArtwork3) fd.append('photoArtwork3', photoArtwork3)
      if (photoArtwork4) fd.append('photoArtwork4', photoArtwork4)
      if (photoArtwork5) fd.append('photoArtwork5', photoArtwork5)

      setProgressSteps((prev) => updateStep(prev, 'validate', 'done'))

      // Step 2 — Excel generation (server-side, signaled via timing)
      setProgressSteps((prev) => updateStep(prev, 'excel', 'running'))

      // Both Excel generation and email sending happen in one API call.
      // The timer animates the Excel→Email transition in the progress modal.
      // timerFired tracks whether the timer ran before fetch settled,
      // so the error handler can reset both steps accurately.
      let timerFired = false
      const emailStartTimer = setTimeout(() => {
        timerFired = true
        setProgressSteps((prev) => {
          const updated = updateStep(prev, 'excel', 'done')
          return updateStep(updated, 'email', 'running')
        })
      }, 800)

      let res: Response
      try {
        res = await fetch('/api/gmb/create-location', {
          method: 'POST',
          body: fd,
        })
      } catch {
        clearTimeout(emailStartTimer)
        setProgressSteps((prev) => {
          // If timer already fired, both excel(done) and email(running) are set —
          // reset to the real failing step (excel was never truly done)
          if (timerFired) {
            const s1 = updateStep(prev, 'email', 'error')
            return updateStep(s1, 'excel', 'error')
          }
          const current = prev.find((s) => s.status === 'running')
          if (!current) return prev
          return updateStep(prev, current.id, 'error')
        })
        setProgressError(d.errorGeneric)
        setSubmitting(false)
        return
      }

      clearTimeout(emailStartTimer)

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: d.errorGeneric }))
        const msg = (body as { error?: string }).error ?? d.errorGeneric
        setProgressSteps((prev) => {
          if (timerFired) {
            const s1 = updateStep(prev, 'email', 'error')
            return updateStep(s1, 'excel', 'error')
          }
          const current = prev.find((s) => s.status === 'running')
          if (!current) return prev
          return updateStep(prev, current.id, 'error')
        })
        setProgressError(msg)
        setSubmitting(false)
        return
      }

      setProgressSteps((prev) => {
        const updated = updateStep(prev, 'excel', 'done')
        return updateStep(updated, 'email', 'done')
      })

      await new Promise((r) => setTimeout(r, 600))
      setShowProgress(false)
      setSuccess(true)
    } catch {
      setProgressSteps((prev) => {
        const current = prev.find((s) => s.status === 'running')
        if (!current) return prev
        return updateStep(prev, current.id, 'error')
      })
      setProgressError(d.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setShowProgress(false)
    setProgressSteps([])
    setProgressError(null)
    setStep(1)
    setName(''); setEmail(''); setPhone(''); setAtelierName(''); setWebsite(''); setDiscipline(''); setConsent(false)
    setAddress(''); setPostalCode(''); setCity(''); setCountry('FR'); setDescription(''); setHours(defaultHours())
    setPhotoCover(null); setPhotoExterior1(null); setPhotoExterior2(null); setPhotoExterior3(null)
    setPhotoInterior1(null); setPhotoInterior2(null); setPhotoInterior3(null); setPhotoInterior4(null)
    setPhotoOwner(null); setPhotoArtwork1(null); setPhotoArtwork2(null); setPhotoArtwork3(null); setPhotoArtwork4(null); setPhotoArtwork5(null)
    setErrorMsg(null)
    setFieldErrors({})
  }

  const handleProgressClose = () => {
    const hasError = progressSteps.some((s) => s.status === 'error')
    const allDone = progressSteps.every((s) => s.status === 'done')
    if (hasError) {
      setShowProgress(false)
      setProgressSteps([])
      setProgressError(null)
    } else if (allDone) {
      setShowProgress(false)
    }
  }

  const stepLabels = d.stepLabels as string[]

  return (
    <section id="register" className="relative py-20 lg:py-28 bg-background border-b border-white/10 text-white">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-display block">{d.eyebrow}</span>
          <p className="text-white/50 text-xs font-light font-sans">{d.subtitle}</p>
        </div>

        <div ref={sectionRef} className="bg-canvas border border-borderLight p-8 sm:p-12 shadow-2xl space-y-8 relative text-inkBlack">

          {/* Stepper indicator */}
          <div className="flex items-start justify-center">
            {stepLabels.map((label, i) => (
              <div key={i} className={`flex items-start ${i < stepLabels.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center text-[9px] sm:text-[10px] font-display border transition-colors
                    ${step === i + 1 ? 'bg-inkBlack text-white border-inkBlack' : step > i + 1 ? 'bg-gold text-white border-gold' : 'bg-white text-grayText border-borderLight'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[8px] md:text-[9px] uppercase tracking-wide md:tracking-widest font-display hidden md:block text-center leading-tight max-w-[6.5rem] transition-colors
                    ${step === i + 1 ? 'text-inkBlack' : 'text-grayText'}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && <div className={`flex-1 h-px mx-1 sm:mx-2 mt-3 transition-colors ${step > i + 1 ? 'bg-gold' : 'bg-borderLight'}`} />}
              </div>
            ))}
          </div>

          <form
            onSubmit={step < 5 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit}
            className="space-y-6"
          >

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-grayText font-display block">{d.formEyebrow}</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-light text-inkBlack">{d.formTitle}</h2>
                  <p className="text-xs text-grayText max-w-md mx-auto font-light font-sans">{d.formSubtitle}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldName}</label>
                    <input type="text" className={`${inputCls} ${fieldErrors.name ? 'border-red-400' : ''}`} placeholder={d.fieldNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
                    <FieldError msg={fieldErrors.name} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldEmail}</label>
                    <input type="email" className={`${inputCls} ${fieldErrors.email ? 'border-red-400' : ''}`} placeholder={d.fieldEmailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <FieldError msg={fieldErrors.email} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldAtelier}</label>
                    <input type="text" className={`${inputCls} ${fieldErrors.atelierName ? 'border-red-400' : ''}`} placeholder={d.fieldAtelierPlaceholder} value={atelierName} onChange={(e) => setAtelierName(e.target.value)} />
                    <FieldError msg={fieldErrors.atelierName} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldPhone}</label>
                    <input type="tel" className={`${inputCls} ${fieldErrors.phone ? 'border-red-400' : ''}`} placeholder={d.fieldPhonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <FieldError msg={fieldErrors.phone} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldDiscipline}</label>
                    <select className={`${inputCls} ${fieldErrors.discipline ? 'border-red-400' : ''}`} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                      <option value="">{d.fieldDisciplinePlaceholder}</option>
                      {d.disciplines.map((disc: { value: string; label: string }) => (
                        <option key={disc.value} value={disc.value}>{disc.label}</option>
                      ))}
                    </select>
                    <FieldError msg={fieldErrors.discipline} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldWebsite}</label>
                    <input type="url" className={`${inputCls} ${fieldErrors.website ? 'border-red-400' : ''}`} placeholder={d.fieldWebsitePlaceholder} value={website} onChange={(e) => setWebsite(e.target.value)} />
                    <FieldError msg={fieldErrors.website} />
                  </div>
                </div>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-inkBlack border-borderLight"
                    />
                    <span className="text-[11px] text-grayText font-light leading-snug font-sans">{d.consent}</span>
                  </label>
                  <FieldError msg={fieldErrors.consent} />
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className={labelCls}>{d.fieldAddress}</label>
                    <input type="text" className={`${inputCls} ${fieldErrors.address ? 'border-red-400' : ''}`} placeholder={d.fieldAddressPlaceholder} value={address} onChange={(e) => setAddress(e.target.value)} />
                    <FieldError msg={fieldErrors.address} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldPostalCode}</label>
                    <input type="text" className={`${inputCls} ${fieldErrors.postalCode ? 'border-red-400' : ''}`} placeholder={d.fieldPostalCodePlaceholder} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    <FieldError msg={fieldErrors.postalCode} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldCity}</label>
                    <input type="text" className={`${inputCls} ${fieldErrors.city ? 'border-red-400' : ''}`} placeholder={d.fieldCityPlaceholder} value={city} onChange={(e) => setCity(e.target.value)} />
                    <FieldError msg={fieldErrors.city} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>{d.fieldCountry}</label>
                  <select required className={inputCls} value={country} onChange={(e) => { setCountry(e.target.value); setPostalCode('') }}>
                    {(d.countries as Array<{ value: string; label: string }>).map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>{d.fieldDescription}</label>
                  <textarea
                    className={`${inputCls} resize-none h-24`}
                    placeholder={d.fieldDescriptionPlaceholder}
                    maxLength={750}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <span className="text-[9px] text-grayText font-sans">{description.length}/750</span>
                </div>

                <div className="space-y-3">
                  <label className={labelCls}>{d.fieldHours}</label>
                  <HoursGrid
                    value={hours}
                    onChange={setHours}
                    labels={d.hoursLabels as Parameters<typeof HoursGrid>[0]['labels']}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3 — Exterior ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-light text-inkBlack">{d.photosExteriorTitle}</h3>
                  <p className="text-xs text-grayText font-sans">{d.photosExteriorSubtitle}</p>
                  <p className="text-[10px] text-gold font-display uppercase tracking-wider">{d.photosSizeWarning}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <PhotoUploadZone label={d.photoCover} hint={d.photoHint} value={photoCover} onChange={setPhotoCover} />
                  <PhotoUploadZone label={d.photoExterior1} hint={d.photoHint} value={photoExterior1} onChange={setPhotoExterior1} />
                  <PhotoUploadZone label={d.photoExterior2} hint={d.photoHint} value={photoExterior2} onChange={setPhotoExterior2} />
                  <PhotoUploadZone label={d.photoExterior3} hint={d.photoHint} value={photoExterior3} onChange={setPhotoExterior3} />
                </div>

                {errorMsg && (
                  <p className="text-center text-xs text-red-600 font-sans">{errorMsg}</p>
                )}
              </div>
            )}

            {/* ── STEP 4 — Interior ── */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-light text-inkBlack">{d.photosInteriorTitle}</h3>
                  <p className="text-xs text-grayText font-sans">{d.photosInteriorSubtitle}</p>
                  <p className="text-[10px] text-gold font-display uppercase tracking-wider">{d.photosSizeWarning}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <PhotoUploadZone label={d.photoInterior1} hint={d.photoHint} value={photoInterior1} onChange={setPhotoInterior1} />
                  <PhotoUploadZone label={d.photoInterior2} hint={d.photoHint} value={photoInterior2} onChange={setPhotoInterior2} />
                  <PhotoUploadZone label={d.photoInterior3} hint={d.photoHint} value={photoInterior3} onChange={setPhotoInterior3} />
                  <PhotoUploadZone label={d.photoInterior4} hint={d.photoHint} value={photoInterior4} onChange={setPhotoInterior4} />
                </div>

                {errorMsg && (
                  <p className="text-center text-xs text-red-600 font-sans">{errorMsg}</p>
                )}
              </div>
            )}

            {/* ── STEP 5 — Owner & Artworks ── */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-light text-inkBlack">{d.photosOwnerArtworksTitle}</h3>
                  <p className="text-xs text-grayText font-sans">{d.photosOwnerArtworksSubtitle}</p>
                  <p className="text-[10px] text-gold font-display uppercase tracking-wider">{d.photosSizeWarning}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <PhotoUploadZone label={d.photoOwner} hint={d.photoHint} value={photoOwner} onChange={setPhotoOwner} />
                  <PhotoUploadZone label={d.photoArtwork1} hint={d.photoHint} value={photoArtwork1} onChange={setPhotoArtwork1} />
                  <PhotoUploadZone label={d.photoArtwork2} hint={d.photoHint} value={photoArtwork2} onChange={setPhotoArtwork2} />
                  <PhotoUploadZone label={d.photoArtwork3} hint={d.photoHint} value={photoArtwork3} onChange={setPhotoArtwork3} />
                  <PhotoUploadZone label={d.photoArtwork4} hint={d.photoHint} value={photoArtwork4} onChange={setPhotoArtwork4} />
                  <PhotoUploadZone label={d.photoArtwork5} hint={d.photoHint} value={photoArtwork5} onChange={setPhotoArtwork5} />
                </div>

                {errorMsg && (
                  <p className="text-center text-xs text-red-600 font-sans">{errorMsg}</p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className={`flex gap-4 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button type="button" onClick={handlePrev} className="btn-mag">
                  {d.btnPrev}
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-action justify-center py-4 text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? d.btnSubmitting : step < 5 ? d.btnNext : d.submit}
              </button>
            </div>

            {step === 1 && (
              <div className="text-center pt-2">
                <span className="text-[9px] text-grayText tracking-wider block font-sans">{d.privacy}</span>
              </div>
            )}
          </form>

          {/* Progress modal */}
          {showProgress && !success && (
            <ProgressModal
              steps={progressSteps}
              error={progressError}
              onClose={handleProgressClose}
              dict={d}
            />
          )}

          {/* Success overlay */}
          {success && clientMounted && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
              <div className="relative bg-canvas w-full max-w-sm p-10 shadow-2xl flex flex-col items-center text-center space-y-6">
                <button
                  onClick={handleReset}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center text-grayText hover:text-inkBlack transition-colors duration-200"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                  </svg>
                </button>
                <div className="h-14 w-14 border border-inkBlack flex items-center justify-center text-inkBlack text-2xl">✓</div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-inkBlack">{d.successTitle}</h3>
                  <p className="text-xs text-grayText max-w-md mx-auto font-sans">{d.successDesc}</p>
                </div>
                <button onClick={handleReset} className="btn-mag">{d.successReset}</button>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </section>
  )
}
