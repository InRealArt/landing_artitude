'use client'

import { useRef, useState } from 'react'
import { useGsapReveal } from '@/hooks/useGsapReveal'
import type { Dictionary } from '@/lib/dictionaries'
import HoursGrid, { defaultHours, DayHours } from '@/components/ui/HoursGrid'
import PhotoUploadZone from '@/components/ui/PhotoUploadZone'

export default function RegisterSection({ dict }: { dict: Dictionary }) {
  const d = dict.register
  const sectionRef = useRef<HTMLDivElement>(null)
  useGsapReveal(sectionRef as React.RefObject<HTMLElement>, { y: 30 })

  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!photoInterior || !photoExterior1 || !photoExterior2 || !photoOwner) {
      setErrorMsg(d.errorPhotos)
      return
    }

    setSubmitting(true)

    try {
      const openPeriods = hours
        .filter((h) => h.open)
        .map((h) => ({
          openDay: h.day,
          closeDay: h.day,
          openTime: h.openTime,
          closeTime: h.closeTime,
        }))

      // Send everything as multipart/form-data in one call.
      // The server creates the location and uploads photos without the client
      // ever receiving or supplying the GMB locationName (prevents injection).
      const fd = new FormData()
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

      const createRes = await fetch('/api/gmb/create-location', {
        method: 'POST',
        body: fd,
      })

      if (!createRes.ok) {
        setErrorMsg(d.errorGeneric)
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch {
      setErrorMsg(d.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setStep(1)
    setName(''); setEmail(''); setPhone(''); setAtelierName(''); setWebsite(''); setDiscipline(''); setConsent(false)
    setAddress(''); setPostalCode(''); setCity(''); setCountry('FR'); setDescription(''); setHours(defaultHours())
    setPhotoInterior(null); setPhotoExterior1(null); setPhotoExterior2(null); setPhotoOwner(null)
    setErrorMsg(null)
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
