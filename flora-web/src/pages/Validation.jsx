import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckSquare, XCircle, RefreshCw, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import axiosInstance from '../lib/axios';



const whitelistedBrands = ['FloraGrow', 'GreenHouse', 'ApexGrow', 'FloraX'];

export const Validation = () => {
  const [failsQueue, setFailsQueue] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Status Alerts Feedback
  const [alertFeedback, setAlertFeedback] = useState(null); // { type: 'success' | 'warning' | 'error', message: '' }

  // Form Fields
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [dimensions, setDimensions] = useState('');

  const fetchFailsQueue = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/products', { params: { status: 'Needs Review' } });
      const records = response.data?.data || [];
      setFailsQueue(records);
      if (records.length > 0) {
        selectProduct(records[0]);
      } else {
        setSelectedProduct(null);
      }
      setIsOffline(false);
    } catch (err) {
      console.warn('Backend server offline. Utilizing local mock validation queue.');
      // Delay for loader skeleton stagger
      setTimeout(() => {
        setFailsQueue([]);
        selectProduct(null);
        setIsOffline(true);
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFailsQueue();
  }, []);

  const selectProduct = (prod) => {
    setSelectedProduct(prod);
    if (!prod) return;
    const data = prod.productData || prod;
    setProductName(data.productName || '');
    setSku(data.sku || '');
    setBrand(data.brand || '');
    setPrice(data.price !== undefined ? String(data.price) : '');
    setCurrency(data.currency || 'USD');
    setDimensions(data.dimensions || '');
  };

  const showFeedback = (type, message) => {
    setAlertFeedback({ type, message });
    setTimeout(() => {
      setAlertFeedback(null);
    }, 4000);
  };

  const handleApproveOverride = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    const numericPrice = parseFloat(price);

    const updatedData = {
      productName,
      sku,
      brand,
      price: isNaN(numericPrice) ? 0 : numericPrice,
      currency,
      dimensions,
      description: selectedProduct.productData?.description || '',
      specifications: selectedProduct.productData?.specifications || {},
      complianceFlags: selectedProduct.productData?.complianceFlags || []
    };

    if (isOffline) {
      // Simulate Local Validation Check
      const errors = [];
      const warnings = [];

      if (updatedData.price <= 0) {
        errors.push({ field: 'price', message: 'Price must be a positive decimal number.', value: updatedData.price });
      }
      if (!whitelistedBrands.includes(updatedData.brand)) {
        warnings.push({ field: 'brand', message: `Brand "${updatedData.brand}" is not in the whitelist.`, value: updatedData.brand });
      }

      const isValid = errors.length === 0 && warnings.length === 0;

      setTimeout(() => {
        if (isValid) {
          showFeedback('success', `Product "${updatedData.productName}" approved and status set to Verified.`);
          // Remove from review queue
          setFailsQueue(prev => prev.filter(item => item._id !== selectedProduct._id));
          const remaining = failsQueue.filter(item => item._id !== selectedProduct._id);
          selectProduct(remaining.length > 0 ? remaining[0] : null);
        } else {
          showFeedback('warning', 'Some fields still violate business whitelists or positive price constraints.');
          // Re-attach fails
          setFailsQueue(prev => prev.map(item => {
            if (item._id === selectedProduct._id) {
              return {
                ...item,
                productData: updatedData,
                validationReport: {
                  ...item.validationReport,
                  isValid,
                  errors,
                  warnings
                }
              };
            }
            return item;
          }));
        }
        setSubmitting(false);
      }, 1000);
    } else {
      try {
        await axiosInstance.put(`/products/${selectedProduct._id}`, updatedData);
        showFeedback('success', 'Manual override values saved and approved successfully.');
        fetchFailsQueue();
      } catch (err) {
        console.error(err);
        showFeedback('error', 'Failed to save manually edited values: ' + (err.response?.data?.error?.message || err.message));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReject = () => {
    if (!selectedProduct) return;
    if (window.confirm('Ingestion reject will discard the current extracted cache. Proceed?')) {
      showFeedback('error', `Discarded extraction cache for "${selectedProduct.productData?.productName || 'product'}".`);
      setFailsQueue(prev => prev.filter(item => item._id !== selectedProduct._id));
      const remaining = failsQueue.filter(item => item._id !== selectedProduct._id);
      selectProduct(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Validation Logs & Overrides"
        subtitle="Review, override, and approve catalog records that failed automated Level B business checks."
        actions={
          <Button variant="outline" size="sm" onClick={fetchFailsQueue} icon={RefreshCw}>
            Sync Queue
          </Button>
        }
      />

      {isOffline && (
        <div className="p-3 bg-status-warningSoft border border-brand-border rounded text-xs font-semibold text-status-warning flex items-center justify-between">
          <span>Backend offline. Running reviewer workbench in local simulator mode. Whitelist: {whitelistedBrands.join(', ')}</span>
          <span className="bg-white border border-brand-border px-1.5 py-0.5 rounded text-[10px] font-mono select-none">
            DEMO
          </span>
        </div>
      )}

      {/* Dynamic Feedback Banner */}
      {alertFeedback && (
        <div className={`p-4 border rounded-lg text-xs font-bold flex items-center gap-2.5 animate-fade-in-up transition-all duration-300 ${alertFeedback.type === 'success' ? 'bg-status-successSoft border-brand-border text-status-success' :
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
          <p className="text-xs text-brand-muted font-medium">Loading validation logs...</p>
        </div>
      ) : failsQueue.length === 0 ? (
        <div className="bg-surface border border-brand-border rounded p-12 text-center shadow-sm animate-fade-in-up">
          <CheckSquare className="h-10 w-10 text-status-success mx-auto mb-3" />
          <h3 className="text-sm font-bold text-brand-text uppercase">Validation Queue Clean</h3>
          <p className="text-xs text-brand-muted mt-1.5">No products require manual operator review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left panel: Fails Queue */}
          <div className="lg:col-span-1 bg-surface border border-brand-border rounded shadow-sm flex flex-col max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-slate-50/50">
              <span className="text-xs font-bold text-brand-text uppercase">Outstanding Alerts ({failsQueue.length})</span>
            </div>
            <div className="divide-y divide-brand-border overflow-y-auto">
              {failsQueue.map((item) => {
                const isSelected = selectedProduct?._id === item._id;
                const data = item.productData || item;
                const errorsCount = item.validationReport?.errors?.length || 0;
                const warningsCount = item.validationReport?.warnings?.length || 0;

                return (
                  <button
                    key={item._id}
                    onClick={() => selectProduct(item)}
                    className={`w-full text-left p-4 transition-all focus:outline-none flex flex-col gap-1.5 ${isSelected ? 'bg-primary-soft border-l-4 border-primary' : 'hover:bg-slate-50/50'
                      }`}
                  >
                    <span className="text-xs font-bold text-brand-text truncate block">{data.productName}</span>
                    <span className="text-[10px] font-mono text-brand-muted">SKU: {data.sku}</span>
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
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Correction Workbench */}
          {selectedProduct && (
            <div className="lg:col-span-2 space-y-6 animate-fade-in-up">
              {/* Alert Details banner */}
              <div className="bg-surface border border-brand-border rounded p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3">Audit Logs Report</h3>
                <div className="space-y-2 text-left">
                  {selectedProduct.validationReport?.errors?.map((err, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-status-error font-medium p-2 bg-status-errorSoft border border-brand-border rounded-sm">
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                      <span>Field `{err.field}`: {err.message} (Raw value: "{err.value}")</span>
                    </div>
                  ))}
                  {selectedProduct.validationReport?.warnings?.map((warn, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-status-warning font-medium p-2 bg-status-warningSoft border border-brand-border rounded-sm">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>Field `{warn.field}`: {warn.message} (Raw value: "{warn.value}")</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Correction Form */}
              <div className="bg-surface border border-brand-border rounded p-6 shadow-sm text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4 pb-3 border-b border-brand-border">
                  Manual Correction Form
                </h3>
                <form onSubmit={handleApproveOverride} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-brand-secondary block mb-1">Product Name</label>
                      <input
                        type="text"
                        className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-secondary block mb-1">SKU / Part Number</label>
                      <input
                        type="text"
                        className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-brand-secondary block mb-1">Brand</label>
                      <input
                        type="text"
                        className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-secondary block mb-1">Price</label>
                      <input
                        type="text"
                        className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-secondary block mb-1">Currency</label>
                      <input
                        type="text"
                        className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        required
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

                  <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3">
                    <Button variant="danger" size="md" icon={XCircle} onClick={handleReject}>
                      Reject Ingestion
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={submitting}
                      icon={submitting ? Loader2 : Save}
                      className={submitting ? 'animate-pulse' : ''}
                    >
                      {submitting ? 'Approve & Saving...' : 'Approve & Save'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Validation;
