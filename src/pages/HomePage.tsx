import { ClosingCta, Faq, Features, Hero, HowItWorks, Numbers, Offices, PhotoBand } from '../components/landing/Sections'

export function HomePage() {
  return (
    <>
      <Hero />
      <Offices />
      <HowItWorks />
      <Features />
      <Numbers />
      <PhotoBand />
      <Faq />
      <ClosingCta />
    </>
  )
}
