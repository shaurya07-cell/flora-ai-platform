import React from 'react';
import {
  FileText,
  Layers,
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Clock,
  Database
} from 'lucide-react';

export const IntelligenceFeatures = () => {
  const features = [
    {
      title: 'Intelligent Document Processing',
      desc: 'Process unstructured spec sheets, technical labels, and PDF product catalogs automatically.',
      icon: FileText
    },
    {
      title: 'Multi-Format Extraction',
      desc: 'Seamlessly ingest PDFs, PNG/JPG images, and structured XLSX spreadsheets in one workflow.',
      icon: Layers
    },
    {
      title: 'Automated Validation Engine',
      desc: 'Rule-based compliance checks for SKU patterns, price boundaries, and brand whitelists.',
      icon: ShieldCheck
    },
    {
      title: 'Product Intelligence Dashboard',
      desc: 'Real-time overview of catalog size, document volume, confidence metrics, and pending reviews.',
      icon: LayoutDashboard
    },
    {
      title: 'Review & Approval Workflow',
      desc: 'Human-in-the-loop validation queue allowing operators to approve or edit flagged items.',
      icon: CheckCircle2
    },
    {
      title: 'Analytics & Compliance Insights',
      desc: 'Aggregate breakdown of extraction confidence ratings and validation distribution.',
      icon: BarChart3
    },
    {
      title: 'Operational Audit Activity Log',
      desc: 'Complete audit trail recording document ingestions, approvals, edits, and rejections.',
      icon: Clock
    },
    {
      title: 'Canonical Product Repository',
      desc: 'Standardized schema persistence keeping specifications and compliance certificates indexed.',
      icon: Database
    }
  ];

  return (
    <section id="features" className="py-20 bg-white border-b border-brand-border text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase text-primary tracking-widest">Platform Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-brand-text tracking-tight">
            Designed for Enterprise Product Catalog Intelligence
          </h3>
          <p className="text-sm text-brand-muted">
            Powerful features built to eliminate manual product data entry and enforce data accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="p-6 border border-brand-border rounded bg-slate-50/50 space-y-3 hover:border-brand-borderStrong hover:bg-white transition-all">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md w-fit text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-brand-text">{feat.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IntelligenceFeatures;
