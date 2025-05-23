"use client"

import { useState, useEffect } from 'react';
import { Navbar, Hero, SubHero, Testimonials, PricingTable, ReliabilitySection, FAQSection, Footer } from '@/components';
import { useTranslation } from '../i18n';

interface HomeProps {
  params: {
    lng: 'nl' | 'fr' | 'en';
  }
}

export default function Home({ params: { lng } }: HomeProps) {
  const { i18n } = useTranslation(lng, 'common')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (i18n) {
      setIsLoading(false)
    }
  }, [i18n])

  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center text-4xl text-white px-4 py-2 font-bold">Eventease</div>
  }

  return (
    <>
      <Navbar lng={lng} />
      <Hero />
      <SubHero />
      <PricingTable lng={lng} />
      <Testimonials lng={lng} />
      <ReliabilitySection lng={lng} />
      <FAQSection lng={lng} />
      <Footer />
    </>
  )
}