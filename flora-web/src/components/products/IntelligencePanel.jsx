import React from 'react';
import { Cpu, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import RecursiveDataViewer from './RecursiveDataViewer';

/**
 * IntelligencePanel displays the intelligence analysis results for a product.
 * It receives the `intelligence` object produced by the standalone Intelligence Engine.
 * The structure follows the Python contract:
 * {
 *   normalization: {...},
 *   classification: {...},
 *   quality: {...},
 *   similarity: {...}
 * }
 *
 * The panel renders each top‑level section with a heading and uses RecursiveDataViewer
 * for a clean, collapsible view of nested data.
 */
const IntelligencePanel = ({ intelligence }) => {
  if (!intelligence) return null;

  const sections = [
    { key: 'normalization', title: 'Normalization', icon: Cpu },
    { key: 'classification', title: 'Classification', icon: ShieldCheck },
    { key: 'quality', title: 'Quality', icon: ShieldAlert },
    { key: 'similarity', title: 'Similarity', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-4">
      {sections.map(({ key, title, icon: Icon }) => (
        <section key={key} className="border border-brand-border rounded p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            <Icon className="h-4 w-4 text-brand-primary" />
            {title}
          </h4>
          <RecursiveDataViewer data={intelligence[key]} />
        </section>
      ))}
    </div>
  );
};

export default IntelligencePanel;
