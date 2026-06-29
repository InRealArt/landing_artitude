import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat, Unbounded } from 'next/font/google'
import '../globals.css'
import { locales, type Locale } from '@/lib/dictionaries'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['200', '300', '400', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
})

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const metadata: Metadata = {
  title: "Artitude by InRealArt — L'élégance de la visibilité",
  description:
    'Référencez votre atelier sur Google et rejoignez la carte interactive InRealArt en 2 minutes. Gratuit, sans engagement.',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <html
      lang={lang}
      className={`${cormorant.variable} ${montserrat.variable} ${unbounded.variable} scroll-smooth`}
    >
      <body className="bg-background text-white font-sans overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  )
}
