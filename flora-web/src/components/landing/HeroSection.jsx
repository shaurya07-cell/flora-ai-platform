import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, Layers, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../Button';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 lg:py-28 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
          
          {/* Left Column: Heading & Messaging */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation Product Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-text tracking-tight leading-[1.15]">
              Turn Product Documents Into{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Product Intelligence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-2xl">
              FLORA transforms unstructured catalog documents, PDFs, images, and spreadsheets into structured, validated, and actionable product catalog intelligence using automated document parsing and AI compliance verification.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
              <a href="#platform">
                <Button variant="outline" size="lg">
                  Explore FLORA Platform
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-border/60 text-xs font-semibold text-brand-secondary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-status-success shrink-0" />
                <span>Multi-Tier Validation</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary shrink-0" />
                <span>AI Schema Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent shrink-0" />
                <span>Multi-Format Ingestion</span>
              </div>
            </div>
          </div>

          {/* Right Column: Abstract Product UI CSS Visualization */}
          <div className="lg:col-span-5 relative">
            <div className="bg-surface border border-brand-border rounded-xl shadow-2xl p-6 space-y-4 transform hover:scale-[1.01] transition-transform duration-300">
              
              {/* Top Header Card Bar */}
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-brand-muted ml-2">FLORA Catalog Engine</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-status-success border border-emerald-200">
                  ● Ready
                </span>
              </div>

              {/* Step Pipeline Flow Visual */}
              <div className="grid grid-cols-4 gap-2 py-2 text-center text-[10px] font-bold">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-primary">
                  <FileText className="h-4 w-4 mx-auto mb-1" />
                  Document
                </div>
                <div className="p-2 bg-slate-50 border border-brand-border rounded text-brand-secondary">
                  <Cpu className="h-4 w-4 mx-auto mb-1 text-accent" />
                  AI Extract
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-status-success">
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1" />
                  Validate
                </div>
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
                  <Sparkles className="h-4 w-4 mx-auto mb-1" />
                  Catalog
                </div>
              </div>

              {/* Sample Parsed Record Mockup */}
              <div className="p-4 bg-slate-50 border border-brand-border rounded space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-text">Flora Smart Sensor FL-SS-100</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Confidence: 98%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-brand-muted font-mono">
                  <div>Brand: Flora</div>
                  <div>Price: $49.99 USD</div>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <span className="text-[9px] bg-slate-200 font-bold px-1.5 py-0.5 rounded text-slate-700">CE Certified</span>
                  <span className="text-[9px] bg-slate-200 font-bold px-1.5 py-0.5 rounded text-slate-700">RoHS Compliant</span>
                </div>
              </div>

            </div>

            {/* Glowing Backdrop Blob */}
            <div className="absolute -z-10 -bottom-6 -right-6 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
