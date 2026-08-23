import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { PageHeader } from '../components/PageHeader';

export const Terms = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-brand-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left animate-fade-in-up">
        <PageHeader
          title="Terms & Conditions"
          subtitle="Last updated: August 13, 2026"
        />

        <div className="bg-surface border border-brand-border rounded p-8 shadow-sm space-y-6 text-xs text-brand-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the FLORA AI Product Intelligence Platform, you agree to comply with and be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">2. Platform License & Access</h2>
            <p>
              FLORA grants you a non-exclusive, non-transferable license to access the product intelligence services, upload catalog documents, and review extracted product records according to your account permissions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">3. User Responsibilities</h2>
            <p>
              Users are responsible for maintaining the confidentiality of account credentials and ensuring that uploaded documents do not violate third-party intellectual property rights.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">4. Validation Disclaimer</h2>
            <p>
              Automated validation rules and AI confidence scores are decision-support tools. Users retain final responsibility for reviewing flagged items before catalog deployment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">5. Limitation of Liability</h2>
            <p>
              FLORA platform services are provided "as is" without implied warranties of non-infringement or uninterrupted availability.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Terms;
