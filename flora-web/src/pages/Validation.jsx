import React from 'react';
import { PageHeader } from '../components/PageHeader';

export const Validation = () => {
  return (
    <div>
      <PageHeader
        title="Validation Log Audits"
        subtitle="Review schema errors, brand whitelist mismatches, and validation evidence logs."
      />
      <div className="border border-brand-border border-dashed rounded p-8 bg-surface text-center">
        <p className="text-brand-muted text-sm">Validation reports and audit trails list will be displayed here.</p>
      </div>
    </div>
  );
};
