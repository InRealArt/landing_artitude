'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

type ButtonVariant = 'cta' | 'cta-dark' | 'action' | 'mag'

interface ButtonProps {
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  variant = 'action',
  href,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const cls = `${variant === 'cta' ? 'btn-cta' : variant === 'cta-dark' ? 'btn-cta btn-cta-dark' : variant === 'mag' ? 'btn-mag' : 'btn-action'} ${className}`

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
