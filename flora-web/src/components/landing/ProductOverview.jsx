import React from 'react';
import { FileText, Cpu, CheckSquare, Database, ArrowRight } from 'lucide-react';

export const ProductOverview = () => {
  return (
    <section id="platform" className="py-20 bg-white border-b border-brand-border text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-xs font-bold uppercase text-primary tracking-widest">Platform Overview</h2>
          <h3 className="text-3xl font-extrabold text-brand-text tracking-tight sm:text-4xl">
            Bridging Unstructured Catalog Data & Trusted Product Intelligence
          </h3>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            Product details are often locked inside disparate PDFs, scanned specification sheets, images, and Excel workbooks. FLORA ingests, parses, structures, and validates these sources into a single canonical product catalogue.
          </p>
        </div>

        {/* Visual Process Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          
          <div className="p-5 border border-brand-border rounded bg-slate-50 space-y-2">
            <FileText className="h-6 w-6 text-brand-muted" />
            <h4 className="text-xs font-bold text-brand-text uppercase">1. Unstructured Input</h4>
            <p className="text-[11px] text-brand-muted">PDFs, PNG, JPG, XLSX product spec sheets.</p>
          </div>

          <div className="hidden md:flex justify-center">
            <ArrowRight className="h-5 w-5 text-brand-muted" />
          </div>

          <div className="p-5 border border-blue-200 bg-blue-50/50 rounded space-y-2">
            <Cpu className="h-6 w-6 text-primary" />
            <h4 className="text-xs font-bold text-brand-text uppercase">2. AI Field Extraction</h4>
            <p className="text-[11px] text-brand-muted">Structured key-value mapping and schema identification.</p>
          </div>

          <div className="hidden md:flex justify-center">
            <ArrowRight className="h-5 w-5 text-brand-muted" />
          </div>

          <div className="p-5 border border-emerald-200 bg-emerald-50/50 rounded space-y-2">
            <CheckSquare className="h-6 w-6 text-status-success" />
            <h4 className="text-xs font-bold text-brand-text uppercase">3. Canonical Catalog</h4>
            <p className="text-[11px] text-brand-muted">Validated product records ready for downstream systems.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductOverview;
