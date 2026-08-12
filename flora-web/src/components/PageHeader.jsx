import React from 'react';

export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-brand-border mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
      </div>
      {actions && <div className="mt-4 sm:mt-0 flex items-center gap-3">{actions}</div>}
    </div>
  );
};
