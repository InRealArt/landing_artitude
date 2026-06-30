'use client'

import { useRef, useState } from 'react'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'
import HoursGrid, { defaultHours, DayHours } from '@/components/ui/HoursGrid'
import PhotoUploadZone from '@/components/ui/PhotoUploadZone'

const MAX_PHOTO_SIZE = 1 * 1024 * 1024 // 1 MB

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
  const allDone = steps.every((s) => s.status === 'done')
  const hasError = steps.some((s) => s.status === 'error')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.progressTitle}
      className="absolute inset-0 z-50 bg-canvas/97 flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-full max-w-sm space-y-8">
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
}

export default function RegisterSection({ dict }: { dict: Dictionary }) {
  const d = dict.register
  const sectionRef = useRef<HTMLDivElement>(null)
  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  // Step 3
  const [photoInterior, setPhotoInterior] = useState<File | null>(null)
  const [photoExterior1, setPhotoExterior1] = useState<File | null>(null)
  const [photoExterior2, setPhotoExterior2] = useState<File | null>(null)
  const [photoOwner, setPhotoOwner] = useState<File | null>(null)

  const inputCls = 'w-full bg-white border border-borderLight focus:border-inkBlack outline-none px-4 py-3 text-xs text-inkBlack font-sans transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display'

  const handleNext = () => setStep((s) => Math.min(s + 1, 3))
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const updateStep = (
    steps: ProgressStep[],
    id: string,
    status: ProgressStep['status']
  ): ProgressStep[] =>
    steps.map((s) => (s.id === id ? { ...s, status } : s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!photoInterior || !photoExterior1 || !photoExterior2 || !photoOwner) {
      setErrorMsg(d.errorPhotos)
      return
    }

    const photoChecks = [
      { file: photoInterior, label: d.photoInterior },
      { file: photoExterior1, label: d.photoExterior1 },
      { file: photoExterior2, label: d.photoExterior2 },
      { file: photoOwner, label: d.photoOwner },
    ]

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

      const openPeriods = hours
        .filter((h) => h.open)
        .map((h) => ({
          openDay: h.day,
          closeDay: h.day,
          openTime: h.openTime,
          closeTime: h.closeTime,
        }))

      const fd = new FormData()
      fd.append('name', name)
      fd.append('title', atelierName)
      fd.append('phone', phone)
      fd.append('addressLine', address)
      fd.append('postalCode', postalCode)
      fd.append('locality', city)
      fd.append('regionCode', country)
      fd.append('consent', String(consent))
      if (website) fd.append('websiteUri', website)
      if (description) fd.append('description', description)
      if (openPeriods.length > 0) fd.append('hours', JSON.stringify(openPeriods))
      fd.append('photoInterior', photoInterior)
      fd.append('photoExterior1', photoExterior1)
      fd.append('photoExterior2', photoExterior2)
      fd.append('photoOwner', photoOwner)

      setProgressSteps((prev) => updateStep(prev, 'validate', 'done'))

      // Step 2 — Excel generation (server-side, signaled via timing)
      setProgressSteps((prev) => updateStep(prev, 'excel', 'running'))

      // Step 3 — Email sending
      // Both Excel generation and email sending happen in one API call.
      // We transition to 'email' after a brief delay to show the Excel step.
      let emailStartTimer: ReturnType<typeof setTimeout> | undefined

      emailStartTimer = setTimeout(() => {
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
    setPhotoInterior(null); setPhotoExterior1(null); setPhotoExterior2(null); setPhotoOwner(null)
    setErrorMsg(null)
  }

  const handleProgressClose = () => {
    const hasError = progressSteps.some((s) => s.status === 'error')
    if (hasError) {
      setShowProgress(false)
      setProgressSteps([])
      setProgressError(null)
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
          <div className="flex items-center justify-center gap-0">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`h-7 w-7 flex items-center justify-center text-[10px] font-display border transition-colors
                    ${step === i + 1 ? 'bg-inkBlack text-white border-inkBlack' : step > i + 1 ? 'bg-gold text-white border-gold' : 'bg-white text-grayText border-borderLight'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-display hidden sm:block transition-colors
                    ${step === i + 1 ? 'text-inkBlack' : 'text-grayText'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`w-16 h-px mx-2 mb-4 transition-colors ${step > i + 1 ? 'bg-gold' : 'bg-borderLight'}`} />}
              </div>
            ))}
          </div>

          <form
            onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit}
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
                    <input type="text" required className={inputCls} placeholder={d.fieldNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldEmail}</label>
                    <input type="email" required className={inputCls} placeholder={d.fieldEmailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldAtelier}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldAtelierPlaceholder} value={atelierName} onChange={(e) => setAtelierName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldPhone}</label>
                    <input type="tel" required className={inputCls} placeholder={d.fieldPhonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldDiscipline}</label>
                    <select required className={inputCls} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                      <option value="">{d.fieldDisciplinePlaceholder}</option>
                      {d.disciplines.map((disc: { value: string; label: string }) => (
                        <option key={disc.value} value={disc.value}>{disc.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldWebsite}</label>
                    <input type="url" className={inputCls} placeholder={d.fieldWebsitePlaceholder} value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-inkBlack border-borderLight"
                  />
                  <span className="text-[11px] text-grayText font-light leading-snug font-sans">{d.consent}</span>
                </label>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className={labelCls}>{d.fieldAddress}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldAddressPlaceholder} value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldPostalCode}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldPostalCodePlaceholder} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{d.fieldCity}</label>
                    <input type="text" required className={inputCls} placeholder={d.fieldCityPlaceholder} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>{d.fieldCountry}</label>
                  <select required className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
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

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-light text-inkBlack">{d.photosTitle}</h3>
                  <p className="text-xs text-grayText font-sans">{d.photosSubtitle}</p>
                  <p className="text-[10px] text-gold font-display uppercase tracking-wider">{d.photosSizeWarning}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <PhotoUploadZone label={d.photoInterior} hint={d.photoHint} value={photoInterior} onChange={setPhotoInterior} />
                  <PhotoUploadZone label={d.photoExterior1} hint={d.photoHint} value={photoExterior1} onChange={setPhotoExterior1} />
                  <PhotoUploadZone label={d.photoExterior2} hint={d.photoHint} value={photoExterior2} onChange={setPhotoExterior2} />
                  <PhotoUploadZone label={d.photoOwner} hint={d.photoHint} value={photoOwner} onChange={setPhotoOwner} />
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
                {submitting ? d.btnSubmitting : step < 3 ? d.btnNext : d.submit}
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
