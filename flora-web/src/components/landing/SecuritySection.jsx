import React from 'react';
import { ShieldCheck, Lock, UserCheck, Key, Server, FileText } from 'lucide-react';

export const SecuritySection = () => {
  const securityPoints = [
    {
      title: 'Role-Based Access Control',
      desc: 'Strict role boundaries separating customer operations from administrative management portals.',
      icon: UserCheck
    },
    {
      title: 'Server-Side Security Credentials',
      desc: 'API keys and infrastructure credentials stay protected within server environment boundaries.',
      icon: Key
    },
    {
      title: 'Protected Application Routes',
      desc: 'Automated authentication guards protecting catalog intelligence routes against unauthorized access.',
      icon: Lock
    },
    {
      title: 'Complete Auditability',
      desc: 'Real-time operational activity logging for all catalog uploads, manual edits, approvals, and rejections.',
      icon: FileText
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-brand-border text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase text-primary tracking-widest">Security & Trust</h2>
          <h3 className="text-3xl font-extrabold text-brand-text tracking-tight">
            Built On Enterprise Security Architecture
          </h3>
          <p className="text-sm text-brand-muted">
            Protecting product data integrity with server-side authentication, role isolation, and comprehensive auditability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityPoints.map((pt) => {
            const Icon = pt.icon;
            return (
              <div key={pt.title} className="p-6 border border-brand-border rounded bg-slate-50 space-y-3">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-primary w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-brand-text">{pt.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{pt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
