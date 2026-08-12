import React, { useState, useEffect } from 'react';
import { Package, Award } from 'lucide-react';

const ProductRow = ({ product }) => {
  const [width, setWidth] = useState(0);
  const isVerified = product.status === 'Verified';

  useEffect(() => {
    // Detect accessibility motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWidth(product.confidence);
      return;
    }

    // Animate once on mount
    const timer = setTimeout(() => {
      setWidth(product.confidence);
    }, 100);
    return () => clearTimeout(timer);
  }, [product.confidence]);

  return (
    <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-150 hover:bg-slate-50/70">
      <div className="flex items-center gap-3 min-w-0">
        <Package className="h-5 w-5 text-brand-muted shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-text truncate">{product.productName}</p>
          <p className="text-[10px] font-mono text-brand-muted mt-0.5">SKU: {product.sku}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold text-brand-text">{product.confidence}%</span>
          </div>
          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-brand-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isVerified ? 'bg-primary' : 'bg-status-warning'
              }`}
              style={{ width: `${width}%` }}
            />
          </div>
        </div>

        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border shrink-0 ${
            isVerified
              ? 'bg-status-successSoft text-status-success border-brand-border'
              : 'bg-status-warningSoft text-status-warning border-brand-border'
          }`}
        >
          {product.status}
        </span>
      </div>
    </div>
  );
};

export const RecentProducts = ({ products }) => {
  return (
    <div className="bg-surface border border-brand-border rounded shadow-sm flex flex-col h-full">
      {/* Header Panel */}
      <div className="p-4 border-b border-brand-border">
        <h3 className="text-sm font-bold tracking-tight text-brand-text uppercase">Recent Extracted Products</h3>
        <p className="text-xs text-brand-muted mt-0.5">Lately synchronized inventory items.</p>
      </div>

      {/* List */}
      <div className="flex-1 divide-y divide-brand-border overflow-y-auto">
        {!products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center select-none animate-fade-in-up">
            <Package className="h-8 w-8 text-brand-muted mb-2 opacity-60" />
            <p className="text-sm font-semibold text-brand-text">No products extracted yet</p>
            <p className="text-xs text-brand-muted mt-1 max-w-[220px] leading-normal">
              Processed products will appear here.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductRow key={product.sku} product={product} />
          ))
        )}
      </div>
    </div>
  );
};
export default RecentProducts;
