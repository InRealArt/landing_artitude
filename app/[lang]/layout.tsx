import type { Metadata } from 'next'
import { locales } from '@/lib/dictionaries'

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const metadata: Metadata = {
  title: "Artitude by InRealArt —  L'index des ateliers artistiques ",
  description:
    'Référencez votre atelier sur Google et rejoignez la carte interactive InRealArt en 2 minutes. Gratuit, sans engagement.',
}

export default function LangLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
