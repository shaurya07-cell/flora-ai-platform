import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProductOverview } from '../components/landing/ProductOverview';
import { HowItWorks } from '../components/landing/HowItWorks';
import { IntelligenceFeatures } from '../components/landing/IntelligenceFeatures';
import { ValidationSection } from '../components/landing/ValidationSection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { CTASection } from '../components/landing/CTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-brand-text flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProductOverview />
        <HowItWorks />
        <IntelligenceFeatures />
        <ValidationSection />
        <SecuritySection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
