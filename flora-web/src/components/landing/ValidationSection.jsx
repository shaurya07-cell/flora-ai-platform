import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Check, XCircle } from 'lucide-react';

export const ValidationSection = () => {
  return (
    <section className="py-20 bg-slate-50 border-b border-brand-border text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-status-success tracking-widest">Quality Control</h2>
            <h3 className="text-3xl font-extrabold text-brand-text tracking-tight sm:text-4xl">
              Automated Validation Guarantees Catalogue Accuracy
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Extraction without validation leads to dirty data. FLORA subjects every parsed document to multi-tier validation rules: checking required fields, SKU alphanumeric patterns, price boundaries, and brand whitelists before saving to the canonical database.
            </p>

            <div className="space-y-3 pt-2 text-xs font-medium text-brand-secondary">
              <div className="flex items-center gap-3 p-3 bg-surface border border-brand-border rounded">
                <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
                <span>Level A Schema Validation: Field presence, data types, and currency formats.</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface border border-brand-border rounded">
                <ShieldAlert className="h-5 w-5 text-status-warning shrink-0" />
                <span>Level B Business Rules: Whitelisted brand verification and SKU pattern matching.</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface border border-brand-border rounded">
                <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
                <span>Operator Queue: Uncertain extractions flagged automatically for human inspection.</span>
              </div>
            </div>
          </div>

          {/* Illustrative Preview Graphic */}
          <div className="bg-surface border border-brand-border rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Validation Workflow</span>
              <span className="text-[10px] bg-slate-100 border border-brand-border px-2 py-0.5 rounded text-brand-muted font-mono">
                Illustrative Preview
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 border border-emerald-200 bg-emerald-50/50 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-status-success" />
                  <span className="font-bold text-brand-text">Flora Smart Sensor FL-SS-100</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-status-success px-2 py-0.5 rounded">
                  Validated
                </span>
              </div>

              <div className="p-3 border border-amber-200 bg-amber-50/50 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                  <span className="font-bold text-brand-text">Industrial Water Valve</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-status-warning px-2 py-0.5 rounded">
                  Needs Review (Price Unset)
                </span>
              </div>

              <div className="p-3 border border-rose-200 bg-rose-50/50 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-status-error" />
                  <span className="font-bold text-brand-text">Corrupted Catalog Page</span>
                </div>
                <span className="text-[10px] font-bold bg-rose-100 text-status-error px-2 py-0.5 rounded">
                  Rejected (Unreadable Text)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ValidationSection;
