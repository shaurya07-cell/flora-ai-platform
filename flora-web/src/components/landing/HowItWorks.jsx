import React from 'react';
import { UploadCloud, Layers, Cpu, ShieldCheck, BarChart3 } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Bring raw catalog documents into one centralized ingestion pipeline.',
      icon: UploadCloud,
      color: 'text-primary bg-blue-50 border-blue-200'
    },
    {
      num: '02',
      title: 'Extract',
      desc: 'Extract readable text & tabular data using high-speed OCR and spreadsheet parsers.',
      icon: Layers,
      color: 'text-accent bg-indigo-50 border-indigo-200'
    },
    {
      num: '03',
      title: 'Structure',
      desc: 'Normalize extracted content into standardized product fields and technical specs.',
      icon: Cpu,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      num: '04',
      title: 'Validate',
      desc: 'Audit SKU formats, price bounds, brand whitelists, and compliance certificates.',
      icon: ShieldCheck,
      color: 'text-status-success bg-emerald-50 border-emerald-200'
    },
    {
      num: '05',
      title: 'Analyze',
      desc: 'Turn validated catalog records into actionable business intelligence.',
      icon: BarChart3,
      color: 'text-emerald-700 bg-teal-50 border-teal-200'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-b border-brand-border text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase text-primary tracking-widest">How FLORA Works</h2>
          <h3 className="text-3xl font-extrabold text-brand-text tracking-tight">
            5 Steps From Document To Product Intelligence
          </h3>
          <p className="text-sm text-brand-muted">
            End-to-end automation ensuring every catalog document is extracted, validated, and recorded cleanly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-3 relative hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded border ${step.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-200">{step.num}</span>
                </div>
                <h4 className="text-base font-bold text-brand-text">{step.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
