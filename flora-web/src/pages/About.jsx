import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { PageHeader } from '../components/PageHeader';
import { Cpu, ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';

export const About = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-brand-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left animate-fade-in-up">
        <div>
          <PageHeader
            title="About FLORA AI Platform"
            subtitle="Transforming unstructured catalog documents into canonical product intelligence."
          />
        </div>

        {/* Section: Platform Vision */}
        <div className="bg-surface border border-brand-border rounded p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-brand-text">The Platform Vision</h2>
          <p className="text-sm text-brand-muted leading-relaxed">
            In modern commerce and manufacturing enterprise workflows, critical product details are trapped inside PDF catalogs, specification sheets, scanned technical documents, and spreadsheets. Manual data entry is slow, expensive, and prone to human error.
          </p>
          <p className="text-sm text-brand-muted leading-relaxed">
            FLORA was engineered as an automated Product Intelligence Platform to bridge this gap. By combining high-speed Optical Character Recognition (OCR), Google Gemini AI field extraction, and automated multi-tier compliance rules, FLORA delivers verified, structured product data ready for downstream integration.
          </p>
        </div>

        {/* Section: Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-2">
            <div className="p-2.5 bg-blue-50 text-primary border border-blue-200 rounded w-fit">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-brand-text">AI Field Extraction</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Standardizes unstructured document text into canonical JSON product schemas containing SKUs, specifications, and certifications.
            </p>
          </div>

          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-2">
            <div className="p-2.5 bg-emerald-50 text-status-success border border-emerald-200 rounded w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-brand-text">Multi-Tier Validation</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Audits SKU patterns, numeric price boundaries, and brand whitelists automatically to prevent invalid data ingestion.
            </p>
          </div>

          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-2">
            <div className="p-2.5 bg-purple-50 text-purple-600 border border-purple-200 rounded w-fit">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-brand-text">Canonical Repository</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Maintains an indexed catalog database with operational audit activity logging and operator review queues.
            </p>
          </div>
        </div>

        {/* Section: Who it's designed for */}
        <div className="bg-surface border border-brand-border rounded p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-brand-text">Target Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-brand-secondary">
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-brand-border rounded">
              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
              <span>E-commerce Catalog & Supplier Ingestion</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-brand-border rounded">
              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
              <span>Industrial Equipment Specification Digitization</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-brand-border rounded">
              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
              <span>Retail Inventory & SKU Compliance Audit</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-brand-border rounded">
              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
              <span>Multi-Vendor Data Harmonization</span>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default About;
