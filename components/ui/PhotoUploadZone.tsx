'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface PhotoUploadZoneProps {
  label: string
  hint?: string
  onChange: (file: File | null) => void
  value: File | null
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB

export default function PhotoUploadZone({ label, hint, onChange, value }: PhotoUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)

  const handleFile = (file: File) => {
    setSizeError(false)
    if (!ACCEPTED_TYPES.includes(file.type)) return
    if (file.size > MAX_SIZE_BYTES) {
      setSizeError(true)
      return
    }
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    onChange(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setSizeError(false)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-1">
      <span className="block text-[10px] uppercase tracking-wider text-inkBlack font-semibold font-display">
        {label}
      </span>

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="w-full h-40 object-cover border border-borderLight"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white/90 border border-borderLight px-2 py-1 text-[9px] font-display uppercase tracking-wider text-inkBlack hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            h-40 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer gap-2 transition-colors
            ${dragOver ? 'border-gold bg-gold/5' : 'border-borderLight hover:border-inkBlack/30'}
          `}
        >
          <span className="text-2xl text-grayText">+</span>
          <span className="text-[10px] text-grayText font-sans text-center px-4">{hint ?? `JPG, PNG ou WebP · max ${MAX_SIZE_BYTES / 1024 / 1024} Mo`}</span>
        </div>
      )}

      {sizeError && (
        <p className="text-[10px] text-red-500 font-sans">
          Fichier trop lourd — max 1 Mo
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
