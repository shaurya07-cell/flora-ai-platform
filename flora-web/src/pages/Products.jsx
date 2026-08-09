import React from 'react';
import { PageHeader } from '../components/PageHeader';

export const Products = () => {
  return (
    <div>
      <PageHeader
        title="Canonical Products Catalogue"
        subtitle="Manage and edit extracted canonical product records."
      />
      <div className="border border-brand-border border-dashed rounded p-8 bg-surface text-center">
        <p className="text-brand-muted text-sm">Extracted products and inventory status tables will be displayed here.</p>
      </div>
    </div>
  );
};
