'use client'

import { useEffect, RefObject } from 'react'
import { gsap, ScrollTrigger, registerGsap } from '@/lib/gsap'

interface RevealOptions {
  delay?: number
  duration?: number
  y?: number
  stagger?: number
}

export function useGsapReveal(
  ref: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const { delay = 0, duration = 0.8, y = 40, stagger = 0 } = options

  useEffect(() => {
    registerGsap()
    if (!ref.current) return

    const targets = stagger > 0
      ? ref.current.children
      : ref.current

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [ref, delay, duration, y, stagger])
}
