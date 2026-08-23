import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { PageHeader } from '../components/PageHeader';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-brand-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left animate-fade-in-up">
        <PageHeader
          title="Privacy Policy"
          subtitle="Last updated: August 13, 2026"
        />

        <div className="bg-surface border border-brand-border rounded p-8 shadow-sm space-y-6 text-xs text-brand-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">1. Information We Collect</h2>
            <p>
              FLORA collects information necessary to provide catalog intelligence services, including user registration details (name, email address, hashed authentication credentials) and uploaded document content submitted for extraction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">2. How We Use Document Data</h2>
            <p>
              Uploaded catalog documents (PDFs, images, spreadsheets) are processed solely for character recognition, AI field extraction, and database persistence within your workspace. We do not sell or share customer document content with third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">3. Data Security & Storage</h2>
            <p>
              We implement industry-standard encryption, server-side authentication, role-based access control, and password hashing to safeguard stored user records and extracted catalog intelligence.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">4. Third-Party Services</h2>
            <p>
              FLORA utilizes Google Gemini AI APIs for schema extraction. API calls are authenticated using secure server-side API keys and pass document text for structural transformation only.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">5. Contact Us</h2>
            <p>
              For privacy inquiries regarding FLORA data policies, please contact privacy@flora.ai.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Privacy;
