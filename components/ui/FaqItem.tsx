'use client'

import { useRef, useState } from 'react'
import { gsap, registerGsap } from '@/lib/gsap'

interface FaqItemProps {
  question: string
  answer: string
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  const toggle = () => {
    registerGsap()
    if (!contentRef.current || !iconRef.current) return

    if (!open) {
      gsap.set(contentRef.current, { height: 'auto', display: 'block' })
      const h = contentRef.current.offsetHeight
      gsap.fromTo(contentRef.current, { height: 0 }, { height: h, duration: 0.35, ease: 'power2.out' })
      gsap.to(iconRef.current, { rotation: 45, duration: 0.3, ease: 'power2.out' })
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => gsap.set(contentRef.current, { display: 'none' }),
      })
      gsap.to(iconRef.current, { rotation: 0, duration: 0.3, ease: 'power2.in' })
    }
    setOpen(!open)
  }

  return (
    <div className="border border-borderLight bg-softGray transition-all duration-300 hover:border-gold">
      <button
        onClick={toggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-serif text-lg sm:text-xl text-inkBlack font-semibold">{question}</span>
        <span ref={iconRef} className="text-lg text-gold ml-4 flex-shrink-0 font-display font-light">+</span>
      </button>
      <div ref={contentRef} className="overflow-hidden" style={{ height: 0, display: 'none' }}>
        <p className="px-6 pb-6 text-base text-grayText leading-relaxed font-light font-sans">{answer}</p>
      </div>
    </div>
  )
}
