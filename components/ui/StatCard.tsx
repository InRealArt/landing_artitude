'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger, registerGsap } from '@/lib/gsap'

interface StatCardProps {
  label: string
  target: number
  suffix: string
  description: string
  barWidth: number
  headline?: string
}

export default function StatCard({ label, target, suffix, description, barWidth, headline }: StatCardProps) {
  const numRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    if (headline || !numRef.current || !barRef.current) return

    const obj = { val: 0 }
    const isDecimal = target % 1 !== 0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: numRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              if (numRef.current) {
                numRef.current.textContent = isDecimal
                  ? obj.val.toFixed(1) + suffix
                  : Math.floor(obj.val).toLocaleString() + suffix
              }
            },
          })
          gsap.fromTo(
            barRef.current,
            { width: '0%' },
            { width: `${barWidth}%`, duration: 1.8, ease: 'power2.out' }
          )
        },
      })
    })

    return () => ctx.revert()
  }, [target, suffix, barWidth, headline])

  return (
    <div className="bg-[#1a1a1a] p-6 border border-white/10 flex flex-col justify-between space-y-4">
      <div>
        {headline ? (
          <div className="text-xl font-serif font-semibold text-white leading-snug">{headline}</div>
        ) : (
          <>
            <span className="text-[10px] uppercase tracking-widest text-grayText font-display block">{label}</span>
            <div
              ref={numRef}
              className="text-4xl font-serif font-light text-white tracking-tight mt-2"
            >
              0{suffix}
            </div>
          </>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-[11px] text-grayText font-sans">{description}</p>
        <div className="w-full bg-white/10 h-[1px]">
          <div ref={barRef} className="bg-gold h-[1px]" style={{ width: 0 }} />
        </div>
      </div>
    </div>
  )
}
