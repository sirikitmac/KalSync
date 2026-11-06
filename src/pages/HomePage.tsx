import { About } from '../components/landing/About'
import { CommunityCTA } from '../components/landing/CommunityCTA'
import { CommunityStats } from '../components/landing/CommunityStats'
import { Hero } from '../components/landing/Hero'
import { HowItWorks } from '../components/landing/HowItWorks'
import { IncidentCategories } from '../components/landing/IncidentCategories'
import { MapSection } from '../components/landing/MapSection'
import { OrganizationsSection } from '../components/landing/OrganizationsSection'
import { ReportsSection } from '../components/landing/ReportsSection'
import { ScopeSection } from '../components/landing/ScopeSection'

export function HomePage() {
  return (
    <>
      <Hero />
      <ScopeSection />
      <ReportsSection />
      <MapSection />
      <HowItWorks />
      <OrganizationsSection />
      <IncidentCategories />
      <CommunityStats />
      <About />
      <CommunityCTA />
    </>
  )
}
