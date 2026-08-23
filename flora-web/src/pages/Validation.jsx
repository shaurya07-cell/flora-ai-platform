import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckSquare,
  XCircle,
  RefreshCw,
  Loader2,
  Save,
  CheckCircle2,
  Eye,
  FileText,
  Award,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { ProductDetailDrawer } from '../components/products/ProductDetailDrawer';
import axiosInstance from '../lib/axios';

export const Validation = () => {
  const [failsQueue, setFailsQueue] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [inspectDrawerProduct, setInspectDrawerProduct] = useState(null);

  // Confirmation Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Status Alerts Feedback
  const [alertFeedback, setAlertFeedback] = useState(null); // { type: 'success' | 'warning' | 'error', message: '' }

  // Form Fields for Correction
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [dimensions, setDimensions] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchValidationQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/products/validation');
      const records = response.data?.data || [];
      setFailsQueue(records);
      if (records.length > 0) {
        selectProduct(records[0]);
      } else {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Failed to fetch validation queue:', err);
      setError('Unable to load validation queue. Backend API is unreachable.');
      setFailsQueue([]);
      setSelectedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationQueue();
  }, []);

  const selectProduct = (prod) => {
    setSelectedProduct(prod);
    setFieldErrors({});
    if (!prod) return;
    const data = prod.productData || prod.extractedData || prod;
    setProductName(prod.name || data.productName || '');
    setSku(data.sku || '');
    setBrand(prod.brand || data.brand || '');
    setPrice(data.price !== undefined && data.price !== null ? String(data.price) : '');
    setCurrency(data.currency || 'USD');
    setDimensions(data.dimensions || '');
    setDescription(prod.description || data.description || '');
  };

  const showFeedback = (type, message) => {
    setAlertFeedback({ type, message });
    setTimeout(() => {
      setAlertFeedback(null);
    }, 4000);
  };

  const validateFormFields = () => {
    const errs = {};
    if (!productName.trim()) errs.productName = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU is required';
    if (!brand.trim()) errs.brand = 'Brand is required';

    if (price.trim() !== '') {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        errs.price = 'Price must be a positive number';
      }
    } else {
      errs.price = 'Price is required';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 1. Approve Logic
  const executeApprove = async (withEdits = false) => {
    if (!selectedProduct) return;
    if (withEdits && !validateFormFields()) return;

    setSubmitting(true);
    setShowApproveModal(false);

    try {
      const payload = withEdits ? {
        name: productName,
        productName,
        sku,
        brand,
        price: parseFloat(price),
        currency,
        dimensions,
        description
      } : {};

      await axiosInstance.put(`/products/${selectedProduct._id}/approve`, payload);

      showFeedback('success', `Product "${productName || selectedProduct.name}" approved successfully.`);

      // Remove approved product from local queue
      const remaining = failsQueue.filter(item => item._id !== selectedProduct._id);
      setFailsQueue(remaining);
      selectProduct(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.message || 'Approval failed';
      showFeedback('error', 'Approval failed: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Reject Logic
  const executeReject = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    setShowRejectModal(false);

    try {
      await axiosInstance.put(`/products/${selectedProduct._id}/reject`, {
        reason: rejectionReason
      });

      showFeedback('error', `Rejected product "${selectedProduct.name}".`);

      // Remove rejected product from local queue
      const remaining = failsQueue.filter(item => item._id !== selectedProduct._id);
      setFailsQueue(remaining);
      selectProduct(remaining.length > 0 ? remaining[0] : null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.message || 'Rejection failed';
      showFeedback('error', 'Rejection failed: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Validation Review Workbench"
        subtitle="Audit, correct, and approve catalog records requiring manual operator review."
        actions={
          <Button variant="outline" size="sm" onClick={fetchValidationQueue} icon={RefreshCw}>
            Sync Queue
          </Button>
        }
      />

      {/* Backend Connection Error */}
      {error && (
        <div className="p-4 bg-status-errorSoft border border-brand-border rounded flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3 text-status-error">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <span className="text-sm font-bold block leading-none">Unable to load validation queue</span>
              <span className="text-xs mt-1 block opacity-90">{error}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchValidationQueue} icon={RefreshCw}>
            Retry
          </Button>
        </div>
      )}

      {/* Dynamic Alert Banner */}
      {alertFeedback && (
        <div className={`p-4 border rounded-lg text-xs font-bold flex items-center gap-2.5 animate-fade-in-up ${
          alertFeedback.type === 'success' ? 'bg-status-successSoft border-brand-border text-status-success' :
          alertFeedback.type === 'warning' ? 'bg-status-warningSoft border-brand-border text-status-warning' :
          'bg-status-errorSoft border-brand-border text-status-error'
        }`}>
          {alertFeedback.type === 'success' ? <CheckCircle2 className="h-4.5 w-4.5 text-status-success" /> : <ShieldAlert className="h-4.5 w-4.5" />}
          <span>{alertFeedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-surface border border-brand-border rounded p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-brand-muted font-medium">Loading validation review queue...</p>
        </div>
      ) : failsQueue.length === 0 && !error ? (
        <div className="bg-surface border border-brand-border rounded p-12 text-center shadow-sm animate-fade-in-up">
          <CheckSquare className="h-10 w-10 text-status-success mx-auto mb-3" />
          <h3 className="text-sm font-bold text-brand-text uppercase tracking-wide">✓ VALIDATION QUEUE CLEAN</h3>
          <p className="text-xs text-brand-muted mt-1.5">No products require manual operator review.</p>
        </div>
      ) : selectedProduct ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* Left Panel: Validation Queue Items */}
          <div className="lg:col-span-1 bg-surface border border-brand-border rounded shadow-sm flex flex-col max-h-[650px] overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Review Candidates ({failsQueue.length})</span>
            </div>
            <div className="divide-y divide-brand-border overflow-y-auto">
              {failsQueue.map((item) => {
                const isSelected = selectedProduct?._id === item._id;
                const data = item.extractedData || item.productData || item;
                const valReport = item.validationReport || data.validation || {};
                const errorsCount = valReport.errors?.length || 0;
                const warningsCount = valReport.warnings?.length || 0;

                return (
                  <button
                    key={item._id}
                    onClick={() => selectProduct(item)}
                    className={`w-full text-left p-4 transition-all focus:outline-none flex flex-col gap-1.5 ${
                      isSelected ? 'bg-primary-soft border-l-4 border-primary' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-xs font-bold text-brand-text truncate block">{item.name || data.productName || 'Unnamed Product'}</span>
                    <span className="text-[10px] font-mono text-brand-muted">SKU: {data.sku || 'N/A'}</span>
                    <div className="flex gap-2 mt-1">
                      {errorsCount > 0 && (
                        <span className="bg-status-errorSoft text-status-error border border-brand-border text-[9px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> {errorsCount} Error{errorsCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {warningsCount > 0 && (
                        <span className="bg-status-warningSoft text-status-warning border border-brand-border text-[9px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {warningsCount} Warning{warningsCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {errorsCount === 0 && warningsCount === 0 && (
                        <span className="bg-status-warningSoft text-status-warning border border-brand-border text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                          Needs Review
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Review Workbench */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up">

            {/* Header & Quick Inspect */}
            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm border bg-status-warningSoft text-status-warning border-brand-border">
                    {selectedProduct.status || 'Needs Review'}
                  </span>
                  <span className="text-xs font-mono text-brand-muted">SKU: {selectedProduct.extractedData?.sku || 'N/A'}</span>
                </div>
                <h2 className="text-base font-bold text-brand-text">{selectedProduct.name || 'Unnamed Product'}</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => setInspectDrawerProduct(selectedProduct)}
              >
                Inspect Full Record
              </Button>
            </div>

            {/* Validation Issues */}
            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3">Validation Issues & Warnings</h3>
              <div className="space-y-2">
                {(() => {
                  const val = selectedProduct.validationReport || selectedProduct.extractedData?.validation || {};
                  const errorsList = val.errors || [];
                  const warningsList = val.warnings || [];

                  if (errorsList.length === 0 && warningsList.length === 0) {
                    return <p className="text-xs text-brand-muted italic">No structural validation errors recorded. Record flagged for manual operator review.</p>;
                  }

                  return (
                    <>
                      {errorsList.map((err, idx) => (
                        <div key={`err-${idx}`} className="flex gap-2 text-xs text-status-error font-medium p-2.5 bg-status-errorSoft border border-brand-border rounded-sm">
                          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                          <span>Field `{err.field}`: {err.message} (Value: "{String(err.value)}")</span>
                        </div>
                      ))}
                      {warningsList.map((warn, idx) => (
                        <div key={`warn-${idx}`} className="flex gap-2 text-xs text-status-warning font-medium p-2.5 bg-status-warningSoft border border-brand-border rounded-sm">
                          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                          <span>Field `{warn.field}`: {warn.message} (Value: "{String(warn.value)}")</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Compliance Flags */}
            {selectedProduct.extractedData?.complianceFlags && selectedProduct.extractedData.complianceFlags.length > 0 && (
              <div className="bg-surface border border-brand-border rounded p-4 shadow-sm text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Compliance Information</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.extractedData.complianceFlags.map((flag) => (
                    <span key={flag} className="bg-primary-soft text-primary border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Source Information */}
            <div className="bg-surface border border-brand-border rounded p-4 shadow-sm text-left grid grid-cols-2 gap-4 text-xs font-medium text-brand-secondary">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-muted shrink-0" />
                <div>
                  <span className="text-[9px] text-brand-muted font-bold uppercase block">Source Document</span>
                  <span className="truncate block max-w-xs">{selectedProduct.sourceFile || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-muted shrink-0" />
                <div>
                  <span className="text-[9px] text-brand-muted font-bold uppercase block">Ingestion Date</span>
                  <span>{formatDate(selectedProduct.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Editable Correction Form */}
            <div className="bg-surface border border-brand-border rounded p-6 shadow-sm text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4 pb-3 border-b border-brand-border">
                Correction & Review Workbench
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); executeApprove(true); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-brand-secondary block mb-1">Product Name *</label>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${
                        fieldErrors.productName ? 'border-status-error' : 'border-brand-border focus:border-brand-borderStrong'
                      }`}
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                    {fieldErrors.productName && <span className="text-[10px] text-status-error font-semibold mt-1 block">{fieldErrors.productName}</span>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-secondary block mb-1">SKU / Part Number *</label>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${
                        fieldErrors.sku ? 'border-status-error' : 'border-brand-border focus:border-brand-borderStrong'
                      }`}
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                    {fieldErrors.sku && <span className="text-[10px] text-status-error font-semibold mt-1 block">{fieldErrors.sku}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-brand-secondary block mb-1">Brand *</label>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${
                        fieldErrors.brand ? 'border-status-error' : 'border-brand-border focus:border-brand-borderStrong'
                      }`}
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                    {fieldErrors.brand && <span className="text-[10px] text-status-error font-semibold mt-1 block">{fieldErrors.brand}</span>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-secondary block mb-1">Price *</label>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${
                        fieldErrors.price ? 'border-status-error' : 'border-brand-border focus:border-brand-borderStrong'
                      }`}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    {fieldErrors.price && <span className="text-[10px] text-status-error font-semibold mt-1 block">{fieldErrors.price}</span>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-secondary block mb-1">Currency</label>
                    <input
                      type="text"
                      className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-secondary block mb-1">Dimensions</label>
                  <input
                    type="text"
                    className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-secondary block mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    icon={XCircle}
                    onClick={() => setShowRejectModal(true)}
                    disabled={submitting}
                  >
                    Reject Product
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      disabled={submitting}
                      icon={Check}
                      onClick={() => setShowApproveModal(true)}
                    >
                      Approve As-Is
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={submitting}
                      icon={submitting ? Loader2 : Save}
                    >
                      {submitting ? 'Saving...' : 'Approve & Save Edits'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reused ProductDetailDrawer */}
      {inspectDrawerProduct && (
        <ProductDetailDrawer
          product={inspectDrawerProduct}
          onClose={() => setInspectDrawerProduct(null)}
          onDeleteSuccess={() => {
            setInspectDrawerProduct(null);
            fetchValidationQueue();
          }}
        />
      )}

      {/* Confirmation Modal: Approve */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-brand-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in-up text-left">
            <h3 className="text-base font-bold text-brand-text">Approve Product?</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Approve this product for inclusion in the canonical catalogue? The record status will be updated to Verified.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <Button variant="outline" size="sm" onClick={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => executeApprove(false)}>
                Approve Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reject */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-brand-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in-up text-left">
            <h3 className="text-base font-bold text-status-error">Reject Product?</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Are you sure you want to reject this extraction? Please specify an optional rejection reason.
            </p>
            <div>
              <label className="text-[10px] uppercase font-bold text-brand-muted block mb-1">Rejection Reason</label>
              <input
                type="text"
                placeholder="e.g. Invalid price, unreadable SKU..."
                className="w-full border border-brand-border rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-borderStrong"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={executeReject}>
                Reject Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Validation;
