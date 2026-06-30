import { NextRequest, NextResponse } from 'next/server'
import { addContactToBrevo } from '@/lib/brevo'

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const MESSAGES = {
  fr: {
    success: 'Inscription confirmée — bienvenue !',
    already: 'Vous êtes déjà abonné à notre newsletter.',
    invalidEmail: 'Adresse e-mail invalide.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
  },
  en: {
    success: 'Subscription confirmed — welcome!',
    already: 'You are already subscribed to our newsletter.',
    invalidEmail: 'Invalid email address.',
    error: 'An error occurred. Please try again.',
  },
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string; language?: string }

  const language = body.language === 'en' ? 'en' : 'fr'
  const msgs = MESSAGES[language]

  const email = (body.email ?? '').toLowerCase().trim()
  if (!RE_EMAIL.test(email)) {
    return NextResponse.json({ error: msgs.invalidEmail }, { status: 400 })
  }

  try {
    await addContactToBrevo(email, language)
    return NextResponse.json({ message: msgs.success })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('duplicate')) {
      return NextResponse.json({ message: msgs.already })
    }
    console.error('[newsletter]', err)
    return NextResponse.json({ error: msgs.error }, { status: 500 })
  }
}
