import { redirect } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnnouncementBanner from '@/components/ui/AnnouncementBanner'
import HeroSection from '@/components/sections/HeroSection'
import ProblemSection from '@/components/sections/ProblemSection'
import SolutionSection from '@/components/sections/SolutionSection'
import IndexSection from '@/components/sections/IndexSection'
import StatsSection from '@/components/sections/StatsSection'
import TeamSection from '@/components/sections/TeamSection'
import RegisterSection from '@/components/sections/RegisterSection'
import NewsletterSection from '@/components/sections/NewsletterSection'
import FaqSection from '@/components/sections/FaqSection'

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) redirect('/fr')

  const dict = await getDictionary(lang as Locale)

  return (
    <>
      <Header dict={dict} lang={lang} />
      <AnnouncementBanner text={dict.announcement.text} highlight={dict.announcement.highlight} />
      <main>
        <HeroSection dict={dict} locale={lang} />
        <ProblemSection dict={dict} />
        <SolutionSection dict={dict} />
        <IndexSection dict={dict} />
        <StatsSection dict={dict} />
        <TeamSection dict={dict} />
        <RegisterSection dict={dict} lang={lang} />
        <NewsletterSection dict={dict} locale={lang} />
        <FaqSection dict={dict} />
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
