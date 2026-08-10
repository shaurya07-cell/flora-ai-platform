import React from 'react';
import { X, Award, FileText, Cpu, Calendar, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  const isVerified = product.status === 'Verified';

  // Format date helper
  const formatDate = (isoString) => {
    return new Date(isoString || Date.now()).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const productData = product.productData || product;
  const metadata = product.metadata || {};

  const valReport = product.validationReport || {
    isValid: false,
    confidence: {
      score: product.confidence ?? 0,
      evidenceLevel: '',
      evidence: []
    },
    errors: [],
    warnings: []
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="bg-surface border border-brand-border rounded-lg shadow-xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] animate-fade-in-up">
        {/* Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-text leading-none">{productData.productName}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${isVerified
                ? 'bg-status-successSoft text-status-success border-brand-border'
                : 'bg-status-warningSoft text-status-warning border-brand-border'
                }`}>
                {product.status}
              </span>
            </div>
            <p className="text-[10px] font-mono text-brand-muted mt-1 leading-none">SKU: {productData.sku}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-50 text-brand-muted hover:text-brand-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          {/* Section 1: Canonical Parameters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">Canonical Fields</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-brand-muted font-bold uppercase">Brand</span>
                <span className="text-sm font-semibold text-brand-text block mt-0.5">{productData.brand}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-muted font-bold uppercase">Price</span>
                <span className="text-sm font-semibold text-brand-text block mt-0.5">
                  {productData.price} {productData.currency}
                </span>
              </div>
              {productData.dimensions && (
                <div>
                  <span className="text-[10px] text-brand-muted font-bold uppercase">Dimensions</span>
                  <span className="text-sm font-semibold text-brand-text block mt-0.5">{productData.dimensions}</span>
                </div>
              )}
            </div>
            {productData.description && (
              <div className="mt-3">
                <span className="text-[10px] text-brand-muted font-bold uppercase">Description</span>
                <p className="text-xs text-brand-secondary mt-1 leading-relaxed">{productData.description}</p>
              </div>
            )}
          </div>

          {/* Section 2: Detailed Specifications */}
          {productData.specifications && Object.keys(productData.specifications).length > 0 && (
            <div className="pt-4 border-t border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">Specifications Object</h4>
              <div className="bg-slate-50 border border-brand-border rounded p-3 grid grid-cols-2 gap-3">
                {Object.entries(productData.specifications).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-[9px] text-brand-muted font-bold uppercase">{key}</span>
                    <span className="text-xs font-semibold text-brand-text block mt-0.5">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Compliance & Safety Flags */}
          {productData.complianceFlags && productData.complianceFlags.length > 0 && (
            <div className="pt-4 border-t border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Compliance Flags</h4>
              <div className="flex flex-wrap gap-1.5">
                {productData.complianceFlags.map((flag) => (
                  <span key={flag} className="bg-primary-soft text-primary border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Confidence Scores & Validation Audit */}
          <div className="pt-4 border-t border-brand-border grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confidence Gauge */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" /> Extraction Confidence
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-primary">{valReport.confidence?.score}%</div>
                <div className="flex-1">
                  <div className="text-[10px] text-brand-muted font-bold uppercase">Evidence Level: {valReport.confidence?.evidenceLevel}</div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-brand-border mt-1">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${valReport.confidence?.score}%` }} />
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1 pl-4 list-disc text-[11px] text-brand-secondary font-medium">
                {valReport.confidence?.evidence?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Validation Logs */}
            <div className="bg-slate-50/50 border border-brand-border rounded p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2.5 flex items-center gap-1.5">
                  {valReport.isValid ? (
                    <ShieldCheck className="h-4 w-4 text-status-success" />
                  ) : (
                    <ShieldAlert className={`h-4 w-4 ${valReport.errors?.length > 0 ? 'text-status-error' : 'text-status-warning'}`} />
                  )}
                  Validation Summary
                </h4>
                {valReport.isValid ? (
                  <p className="text-xs text-status-success font-semibold leading-relaxed">
                    Zero schema validation warnings or errors detected. Record conforms fully with whitelists.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {valReport.errors?.map((err, idx) => (
                      <div key={idx} className="flex gap-1.5 text-xs text-status-error font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Field `{err.field}`: {err.message} (value: {err.value})</span>
                      </div>
                    ))}
                    {valReport.warnings?.map((warn, idx) => (
                      <div key={idx} className="flex gap-1.5 text-xs text-status-warning font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Field `{warn.field}`: {warn.message} (value: {warn.value})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Extraction Metadata */}
          <div className="pt-4 border-t border-brand-border grid grid-cols-2 gap-4 text-xs font-medium text-brand-secondary">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-muted shrink-0" />
              <div>
                <span className="text-[9px] text-brand-muted font-bold uppercase block leading-none">Source Document</span>
                <span className="truncate block max-w-xs mt-0.5">{metadata.filename}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-muted shrink-0" />
              <div>
                <span className="text-[9px] text-brand-muted font-bold uppercase block leading-none">Gemini Model</span>
                <span className="block mt-0.5">gemini-1.5-flash-8b</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-muted shrink-0" />
              <div>
                <span className="text-[9px] text-brand-muted font-bold uppercase block leading-none">Ingestion Time</span>
                <span className="block mt-0.5">{formatDate(metadata.uploadDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsModal;
