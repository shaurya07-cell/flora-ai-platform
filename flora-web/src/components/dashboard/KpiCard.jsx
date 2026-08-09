import React from 'react';

export const KpiCard = ({ label, value, icon: Icon, subtext, statusColor = 'text-primary' }) => {
  return (
    <div className="bg-surface border border-brand-border rounded p-5 shadow-sm transition-all duration-200 hover:border-slate-300 flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">{label}</p>
        <h3 className="text-3xl font-bold tracking-tight text-brand-text mb-1">{value}</h3>
        {subtext && <p className="text-xs text-brand-muted truncate">{subtext}</p>}
      </div>
      <div className={`p-2.5 rounded bg-slate-50 border border-brand-border ${statusColor}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};
export default KpiCard;
