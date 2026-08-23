import React, { useState, useEffect } from 'react';
import { Package, Award, ChevronRight } from 'lucide-react';

const ProductRow = ({ product, onSelectProduct }) => {
  const [width, setWidth] = useState(0);

  // Robust field extraction matching real MongoDB schema (/api/v1/products/stats) and frontend models
  const productName = product.name || product.productData?.productName || product.extractedData?.productName || 'Unnamed Product';
  const sku = product.extractedData?.sku || product.productData?.sku || product.sku || 'N/A';

  // Confidence score matching backend KPI aggregation: extractedData.validation.confidence.score
  const confidence = product.extractedData?.validation?.confidence?.score
    ?? product.validationReport?.confidence?.score
    ?? product.confidence
    ?? 0;

  // Status mapping matching KPI breakdown
  const status = product.status || (product.extractedData?.validation?.isValid ? 'Verified' : 'Needs Review');
  const isVerified = status === 'Verified';

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWidth(confidence);
      return;
    }

    const timer = setTimeout(() => {
      setWidth(confidence);
    }, 100);
    return () => clearTimeout(timer);
  }, [confidence]);

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-150 hover:bg-slate-50 cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded bg-slate-100 text-brand-muted group-hover:bg-primary-soft group-hover:text-primary transition-colors">
          <Package className="h-4 w-4 shrink-0" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-text truncate group-hover:text-primary transition-colors">
            {productName}
          </p>
          <p className="text-[10px] font-mono text-brand-muted mt-0.5">SKU: {sku}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold text-brand-text">{confidence}%</span>
          </div>
          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-brand-border">
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
          {status}
        </span>
        <ChevronRight className="h-4 w-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export const RecentProducts = ({ products, onSelectProduct, loading }) => {
  return (
    <div className="bg-surface border border-brand-border rounded shadow-sm flex flex-col h-full">
      {/* Header Panel */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text">Recent Extracted Products</h3>
          <p className="text-[11px] text-brand-muted mt-0.5">Lately synchronized inventory items from MongoDB.</p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 divide-y divide-brand-border overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-36" />
                <div className="h-4 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] p-6 text-center select-none animate-fade-in-up">
            <Package className="h-8 w-8 text-brand-muted mb-2 opacity-50" />
            <p className="text-sm font-semibold text-brand-text">No products extracted yet</p>
            <p className="text-xs text-brand-muted mt-1 max-w-[220px] leading-normal">
              Processed products will appear here.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductRow
              key={product._id || product.sku}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))
        )}
      </div>
    </div>
  );
};
export default RecentProducts;
