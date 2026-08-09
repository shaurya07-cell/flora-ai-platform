import React from 'react';
import { PageHeader } from '../components/PageHeader';

export const Settings = () => {
  return (
    <div>
      <PageHeader
        title="Settings & System Configurations"
        subtitle="Manage configurable brand whitelists, select active Gemini model, and configure pipelines parameters."
      />
      <div className="border border-brand-border border-dashed rounded p-8 bg-surface text-center">
        <p className="text-brand-muted text-sm">System config options, brand whitelist forms, and model details will be displayed here.</p>
      </div>
    </div>
  );
};
