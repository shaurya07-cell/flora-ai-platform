import React from 'react';
import { PageHeader } from '../components/PageHeader';

export const Upload = () => {
  return (
    <div>
      <PageHeader
        title="Upload Catalog File"
        subtitle="Submit a PDF, PNG, JPG, or Excel sheet to start the AI Product Intelligence extraction pipeline."
      />
      <div className="border border-brand-border border-dashed rounded p-8 bg-surface text-center">
        <p className="text-brand-muted text-sm">Drag and drop file upload component and queue listing will be displayed here.</p>
      </div>
    </div>
  );
};
