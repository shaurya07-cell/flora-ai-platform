import React from 'react';
import { Package, Award } from 'lucide-react';

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
        {products.map((product) => {
          const isVerified = product.status === 'Verified';

          return (
            <div
              key={product.sku}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-slate-50 border border-brand-border text-brand-muted">
                  <Package className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-text truncate">{product.productName}</p>
                  <p className="text-[10px] font-mono text-brand-muted mt-0.5">SKU: {product.sku}</p>
                </div>
              </div>

              {/* Confidence Progress and Status */}
              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                {/* Visual Progress Bar */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-brand-text">{product.confidence}%</span>
                  </div>
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-brand-border">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isVerified ? 'bg-status-success' : 'bg-status-warning'
                      }`}
                      style={{ width: `${product.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Status indicator pill */}
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border shrink-0 ${
                    isVerified
                      ? 'bg-emerald-50 text-status-success border-emerald-100'
                      : 'bg-amber-50 text-status-warning border-amber-100'
                  }`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RecentProducts;
