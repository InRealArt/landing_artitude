import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnnouncementBanner from '@/components/ui/AnnouncementBanner'
import HeroSection from '@/components/sections/HeroSection'
import ProblemSection from '@/components/sections/ProblemSection'
import SolutionSection from '@/components/sections/SolutionSection'
import IndexSection from '@/components/sections/IndexSection'
import StatsSection from '@/components/sections/StatsSection'
import CatalogSection from '@/components/sections/CatalogSection'
import RegisterSection from '@/components/sections/RegisterSection'
import FaqSection from '@/components/sections/FaqSection'

export default function Home() {
  return (
    <>
      <Header />
      <AnnouncementBanner
        text="📢 Catalogue d'artistes principaux complet."
        highlight="Artitude reste ouvert gratuitement à tous les créateurs."
      />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <IndexSection />
        <StatsSection />
        <CatalogSection />
        <RegisterSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
