import React from 'react';
import { PageHeader } from '../components/PageHeader';

export const Documents = () => {
  return (
    <div>
      <PageHeader
        title="Ingested Documents Queue"
        subtitle="Track document processing status, retry pipeline runs, and review raw ocr extraction details."
      />
      <div className="border border-brand-border border-dashed rounded p-8 bg-surface text-center">
        <p className="text-brand-muted text-sm">Uploaded catalog file logs and pipelines trace tables will be displayed here.</p>
      </div>
    </div>
  );
};
