import React, { useState, useEffect } from 'react';
import { X, Award, FileText, Cpu, Calendar, ShieldCheck, ShieldAlert, AlertTriangle, Trash2, ChevronDown, ChevronRight, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import axiosInstance from '../../lib/axios';
import IntelligencePanel from './IntelligencePanel';

// Recursive component to render nested objects cleanly
const RecursiveDataViewer = ({ data, level = 0 }) => {
  if (data === null || data === undefined) {
    return <span className="text-brand-muted italic">Not available</span>;
  }
  if (typeof data !== 'object') {
    return <span className="text-brand-text font-semibold break-all">{String(data)}</span>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-brand-muted italic">Empty array</span>;
    return (
      <ul className="list-disc pl-4 space-y-1">
        {data.map((item, idx) => (
          <li key={idx} className="text-sm">
            <RecursiveDataViewer data={item} level={level + 1} />
          </li>
        ))}
      </ul>
    );
  }
  
  const entries = Object.entries(data);
  if (entries.length === 0) return <span className="text-brand-muted italic">Empty object</span>;

  return (
    <div className={`space-y-2 ${level > 0 ? 'mt-1' : ''}`}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${level > 0 ? 'pl-3 border-l border-brand-border/50' : ''}`}>
          <span className="text-[10px] uppercase font-bold text-brand-muted block mb-0.5">{key}</span>
          <div className="text-sm">
            <RecursiveDataViewer data={value} level={level + 1} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProductDetailDrawer = ({ product, onClose, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showRawData, setShowRawData] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcFeedback, setRecalcFeedback] = useState(null);
  const [currentIntelligence, setCurrentIntelligence] = useState(product?.intelligence || null);

  useEffect(() => {
    setCurrentIntelligence(product?.intelligence || null);
  }, [product]);

  const handleRecalculateIntelligence = async () => {
    if (isRecalculating || !product?._id) return;
    setIsRecalculating(true);
    setRecalcFeedback(null);

    try {
      const response = await axiosInstance.post(`/products/${product._id}/recalculate-intelligence`);
      if (response.data?.success && response.data?.data) {
        setCurrentIntelligence(response.data.data);
        product.intelligence = response.data.data;
        setRecalcFeedback({ type: 'success', message: 'Intelligence recalculated successfully!' });
      } else {
        setRecalcFeedback({ type: 'error', message: response.data?.error?.message || 'Recalculation failed.' });
      }
    } catch (err) {
      console.error('Failed to recalculate intelligence:', err);
      setRecalcFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to recalculate intelligence. Server error.'
      });
    } finally {
      setIsRecalculating(false);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!product) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250); // Match animation duration
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await axiosInstance.delete(`/products/${product._id}`);
      // Notify parent to refresh list and show success
      onDeleteSuccess();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
      setDeleteError(err.response?.data?.error?.message || err.message || 'Failed to delete product.');
    }
  };

  const productData = product.productData || product;
  const metadata = product.metadata || {};
  const extractedData = product.extractedData || productData.extractedData;
  const isVerified = product.status === 'Verified';

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

  const formatDate = (isoString) => {
    if (!isoString) return 'Not available';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Background Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-surface border-l border-brand-border shadow-2xl flex flex-col transform transition-transform duration-250 ease-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-brand-border bg-slate-50/50">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border inline-block ${isVerified ? 'bg-status-successSoft text-status-success border-brand-border' : 'bg-status-warningSoft text-status-warning border-brand-border'}`}>
                {product.status || 'Unknown Status'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-brand-text truncate" title={productData.productName || 'Unnamed Product'}>
              {productData.productName || <span className="text-brand-muted italic">Unnamed Product</span>}
            </h2>
            <p className="text-xs font-mono text-brand-secondary mt-1">
              SKU: {productData.sku || <span className="italic text-brand-muted">N/A</span>}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-sm hover:bg-slate-200 text-brand-muted hover:text-brand-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Basic Information */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4 border-b border-brand-border pb-1">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-brand-muted font-bold uppercase block mb-1">Brand</span>
                <span className="text-sm font-semibold text-brand-text block">{productData.brand || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-muted font-bold uppercase block mb-1">Price</span>
                <span className="text-sm font-semibold text-brand-text block">
                  {productData.price !== undefined ? `${productData.price} ${productData.currency || ''}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-brand-muted font-bold uppercase block mb-1">Confidence Score</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">{valReport.confidence?.score || 0}%</span>
                </div>
              </div>
            </div>
            {productData.description && (
              <div className="mt-4">
                <span className="text-[10px] text-brand-muted font-bold uppercase block mb-1">Description</span>
                <p className="text-sm text-brand-secondary leading-relaxed">{productData.description}</p>
              </div>
            )}
          </section>

          {/* Validation & Compliance */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4 border-b border-brand-border pb-1">Validation & Compliance</h3>
            
            <div className="bg-slate-50/50 border border-brand-border rounded p-4 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2.5 flex items-center gap-1.5">
                {valReport.isValid ? (
                  <ShieldCheck className="h-4 w-4 text-status-success" />
                ) : (
                  <ShieldAlert className={`h-4 w-4 ${valReport.errors?.length > 0 ? 'text-status-error' : 'text-status-warning'}`} />
                )}
                Validation Summary
              </h4>
              
              {valReport.isValid ? (
                <p className="text-xs text-status-success font-semibold leading-relaxed">
                  Record conforms fully with whitelists. Zero schema validation errors detected.
                </p>
              ) : (
                <div className="space-y-2">
                  {valReport.errors?.length === 0 && valReport.warnings?.length === 0 && (
                    <p className="text-xs text-brand-muted italic">No validation details available.</p>
                  )}
                  {valReport.errors?.map((err, idx) => (
                    <div key={`err-${idx}`} className="flex gap-1.5 text-xs text-status-error font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Field `{err.field}`: {err.message} (Value: {String(err.value)})</span>
                    </div>
                  ))}
                  {valReport.warnings?.map((warn, idx) => (
                    <div key={`warn-${idx}`} className="flex gap-1.5 text-xs text-status-warning font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Field `{warn.field}`: {warn.message} (Value: {String(warn.value)})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {productData.complianceFlags && productData.complianceFlags.length > 0 && (
              <div>
                <span className="text-[10px] text-brand-muted font-bold uppercase block mb-2">Compliance Flags</span>
                <div className="flex flex-wrap gap-1.5">
                  {productData.complianceFlags.map((flag) => (
                    <span key={flag} className="bg-primary-soft text-primary border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Extracted Data */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4 border-b border-brand-border pb-1">Extracted Data</h3>
            <div className="bg-surface border border-brand-border rounded p-4">
              {extractedData ? (
                <RecursiveDataViewer data={extractedData} />
              ) : (
                <p className="text-sm text-brand-muted italic text-center py-4">No extracted data available for this record.</p>
              )}
            </div>
          </section>

          {/* Specifications */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4 border-b border-brand-border pb-1">Specifications</h3>
            {productData.specifications && Object.keys(productData.specifications).length > 0 ? (
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {Object.entries(productData.specifications).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-[10px] text-brand-muted font-bold uppercase block mb-0.5">{key}</span>
                    <span className="text-sm font-semibold text-brand-text break-words">{String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted italic">No specifications available.</p>
            )}
          </section>

          {/* Source Information */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4 border-b border-brand-border pb-1">Source Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-brand-muted shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-brand-muted font-bold uppercase block">Source Document</span>
                  <span className="text-sm font-semibold text-brand-text break-all">{metadata.filename || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-brand-muted shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-brand-muted font-bold uppercase block">Ingestion Date</span>
                  <span className="text-sm font-semibold text-brand-text">{formatDate(metadata.uploadDate)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Intelligence Panel */}
          <section className="mt-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-1.5 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">Product Intelligence</h3>
              <Button
                variant="outline"
                size="sm"
                icon={isRecalculating ? Loader2 : RefreshCw}
                disabled={isRecalculating}
                onClick={handleRecalculateIntelligence}
                className={`hover:border-brand-borderStrong active:scale-[0.98] transition-all text-xs ${
                  isRecalculating ? 'animate-pulse' : ''
                }`}
              >
                {isRecalculating ? 'Recalculating...' : 'Recalculate Intelligence'}
              </Button>
            </div>

            {recalcFeedback && (
              <div className={`p-2.5 mb-3 border rounded text-xs font-semibold flex items-center justify-between ${
                recalcFeedback.type === 'success'
                  ? 'bg-status-successSoft text-status-success border-brand-border'
                  : 'bg-status-errorSoft text-status-error border-brand-border'
              }`}>
                <span>{recalcFeedback.message}</span>
                <button onClick={() => setRecalcFeedback(null)} className="text-[10px] uppercase font-bold underline ml-2">Dismiss</button>
              </div>
            )}

            {(currentIntelligence || product.intelligence) ? (
              <IntelligencePanel intelligence={currentIntelligence || product.intelligence} />
            ) : (
              <p className="text-xs text-brand-muted italic py-2">No intelligence data generated yet. Click "Recalculate Intelligence" to run analysis.</p>
            )}
          </section>

          {/* Raw Extracted Data (Collapsible JSON) */}
          <section>
            <button 
              onClick={() => setShowRawData(!showRawData)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-muted border-b border-brand-border pb-2 hover:text-brand-text transition-colors"
            >
              <span>Raw Extracted Data</span>
              {showRawData ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            {showRawData && (
              <div className="mt-3">
                <pre className="bg-slate-900 text-slate-300 p-4 rounded text-[11px] font-mono overflow-x-auto border border-slate-950 shadow-inner">
                  {JSON.stringify(product, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-brand-border bg-slate-50 flex items-center justify-between mt-auto">
          <div>
            {deleteConfirm ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-status-error">Delete Product?</span>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="min-w-[80px]"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirm(true)}
                icon={Trash2}
                className="text-status-error hover:bg-status-errorSoft hover:border-red-200"
              >
                Delete Product
              </Button>
            )}
            
            {deleteError && (
              <p className="text-[10px] text-status-error font-semibold mt-2 max-w-[250px] truncate" title={deleteError}>
                Error: {deleteError}
              </p>
            )}
          </div>
          
          {!deleteConfirm && (
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
