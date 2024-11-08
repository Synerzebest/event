import React from 'react';
import { Navbar, Hero, SubHero, Testimonials, PricingTable, ReliabilitySection, FAQSection, Footer } from '@/components';

export default function Home() {

  return (
    <>
      <Navbar />
      <Hero />
      <SubHero />
      <Testimonials />
      <PricingTable />
      <ReliabilitySection />
      <FAQSection />
      <Footer />
  </>
);
}
