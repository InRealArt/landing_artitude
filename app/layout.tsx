import { Cormorant_Garamond, Montserrat, Unbounded } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${montserrat.variable} ${unbounded.variable} scroll-smooth`}
    >
      <body className="bg-background text-white font-sans overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  )
}
