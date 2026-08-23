import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Play, RefreshCw, Database, Eye, BrainCircuit, CheckSquare, FileText, Loader2, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import axiosInstance from '../lib/axios';

const stagesConfig = [
  { id: 'upload', name: 'Document Ingestion', icon: UploadCloud, desc: 'Ingest raw catalog payload' },
  { id: 'ocr', name: 'OCR Raw Parse', icon: Eye, desc: 'Extract clean UTF-8 text' },
  { id: 'gemini', name: 'Gemini AI Parser', icon: BrainCircuit, desc: 'AI-assisted structural schema check' },
  { id: 'validation', name: 'Validation Engine', icon: CheckSquare, desc: 'Verify business rules & confidence' },
  { id: 'mongodb', name: 'Database Sync', icon: Database, desc: 'Save validated catalog record' }
];

export const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [pipelineState, setPipelineState] = useState('idle'); // idle, processing, success, error
  const [batchSummary, setBatchSummary] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  const [successProduct, setSuccessProduct] = useState(null);
  const [fileStatuses, setFileStatuses] = useState({});
  const [stageStatuses, setStageStatuses] = useState({
    upload: 'idle',
    ocr: 'idle',
    gemini: 'idle',
    validation: 'idle',
    mongodb: 'idle'
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetPipeline = () => {
    setFiles([]);
    setPipelineState('idle');
    setBatchSummary(null);
    setErrorDetails('');
    setSuccessProduct(null);
    setFileStatuses({});
    setStageStatuses({
      upload: 'idle',
      ocr: 'idle',
      gemini: 'idle',
      validation: 'idle',
      mongodb: 'idle'
    });
  };

  const triggerIngestion = () => {
    if (files.length === 0) return;
    setBatchSummary(null);
    setErrorDetails('');
    setSuccessProduct(null);
    setPipelineState('processing');
    runRealUpload();
  };

  const runRealUpload = async () => {
    const formData = new FormData();

    // Attach all selected files cleanly
    files.forEach(f => {
      formData.append('files', f);
    });

    // Initialize individual status map
    const initialMap = {};
    files.forEach(f => {
      initialMap[f.name] = 'processing';
    });
    setFileStatuses(initialMap);

    setStageStatuses({
      upload: 'active',
      ocr: 'active',
      gemini: 'active',
      validation: 'active',
      mongodb: 'active'
    });

    try {
      const response = await axiosInstance.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000 // Extended 90-second timeout for multi-step AI document pipeline
      });

      setStageStatuses({
        upload: 'success',
        ocr: 'success',
        gemini: 'success',
        validation: 'success',
        mongodb: 'success'
      });
      setPipelineState('success');

      if (response.data?.data?.results) {
        // Multi-file response
        const results = response.data.data.results;
        const statusMap = {};
        results.forEach(res => {
          statusMap[res.fileName] = res.success ? 'success' : 'error';
        });
        setFileStatuses(statusMap);
        setBatchSummary({
          total: response.data.data.total,
          successfulCount: response.data.data.successfulCount,
          failedCount: response.data.data.failedCount,
          results
        });
      } else {
        // Single file response
        setSuccessProduct(response.data?.data?.product);
        if (files[0]) {
          setFileStatuses({ [files[0].name]: 'success' });
        }
      }
    } catch (err) {
      console.error(err);
      setPipelineState('error');
      const errCode = err.code || err.response?.data?.error?.code;
      const errMsg = err.response?.data?.error?.message || err.details?.message || err.message || 'Server connection offline.';
      setErrorDetails(errMsg);

      const errMap = {};
      files.forEach(f => {
        errMap[f.name] = 'error';
      });
      setFileStatuses(errMap);

      if (errCode === 'VALIDATION_FAILED') {
        setStageStatuses({
          upload: 'success',
          ocr: 'success',
          gemini: 'success',
          validation: 'error',
          mongodb: 'idle'
        });
      } else if (errCode === 'GEMINI_API_ERROR') {
        setStageStatuses({
          upload: 'success',
          ocr: 'success',
          gemini: 'error',
          validation: 'idle',
          mongodb: 'idle'
        });
      } else if (errCode === 'OCR_FAILED' || errCode === 'UNSUPPORTED_FILE_TYPE') {
        setStageStatuses({
          upload: 'success',
          ocr: 'error',
          gemini: 'idle',
          validation: 'idle',
          mongodb: 'idle'
        });
      } else {
        setStageStatuses({
          upload: 'error',
          ocr: 'idle',
          gemini: 'idle',
          validation: 'idle',
          mongodb: 'idle'
        });
      }
    } finally {
      // Safety guarantee: ensure pipeline state does not remain stuck indefinitely if an unhandled error occurs
      setPipelineState(prev => (prev === 'processing' ? 'error' : prev));
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Ingest Catalog Files"
        subtitle="Submit single or batch catalog files (PDF, PNG, JPG, WEBP, XLSX) for AI Product Intelligence extraction."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Col: Upload dropzone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4">Select Source Files</h3>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                dragActive ? 'border-primary bg-primary-soft scale-[1.005]' : 'border-brand-border bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="h-10 w-10 text-brand-muted mb-3 transition-transform duration-250 hover:scale-105" />
              <p className="text-xs text-brand-text font-semibold">Drag & drop single or multiple files</p>
              <p className="text-[10px] text-brand-muted mt-1.5 mb-4">PDF, PNG, JPG, JPEG, or XLSX (max 10MB per file)</p>

              <label className="relative cursor-pointer">
                <span className="bg-white border border-brand-border rounded-sm px-3 py-1.5 text-xs font-semibold text-brand-text shadow-sm hover:bg-slate-100 transition-colors duration-150">
                  Browse Files
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                />
              </label>
            </div>

            {/* Selected File Queue */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-brand-muted uppercase">
                  <span>Queued Files ({files.length})</span>
                  {pipelineState === 'idle' && (
                    <button onClick={() => setFiles([])} className="text-status-error hover:underline text-[10px]">Clear All</button>
                  )}
                </div>
                {files.map((f, idx) => {
                  const status = fileStatuses[f.name] || 'queued';
                  return (
                    <div key={`${f.name}-${idx}`} className="flex items-center justify-between p-2 bg-white border border-brand-border rounded text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="h-3.5 w-3.5 text-brand-muted shrink-0" />
                        <span className="truncate text-brand-text font-medium">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {status === 'processing' && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                        {status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />}
                        {status === 'error' && <AlertTriangle className="h-3.5 w-3.5 text-status-error" />}
                        {status === 'queued' && <span className="text-[10px] font-bold text-brand-muted uppercase bg-slate-100 px-1.5 py-0.5 rounded">Queued</span>}
                        {pipelineState === 'idle' && (
                          <button onClick={() => removeFile(idx)} className="text-brand-muted hover:text-status-error">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action */}
            <div className="mt-5 pt-4 border-t border-brand-border">
              <Button
                onClick={triggerIngestion}
                disabled={files.length === 0 || pipelineState === 'processing'}
                variant="primary"
                className="w-full text-center hover:scale-[1.01] active:scale-[0.99] transition-all"
                icon={Play}
              >
                {pipelineState === 'processing' ? 'Ingesting Batch...' : `Start Ingestion (${files.length} File${files.length === 1 ? '' : 's'})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Col: Visual Ingestion Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text">Extraction Pipeline</h3>
                <p className="text-[11px] text-brand-muted mt-1">Real-time status tracking across ingestion boundaries.</p>
              </div>
              {pipelineState !== 'idle' && (
                <Button variant="outline" size="sm" onClick={resetPipeline} icon={RefreshCw}>
                  Clear Pipeline
                </Button>
              )}
            </div>

            {/* Pipeline Stage Nodes */}
            <div className="relative space-y-6 pl-4 border-l border-brand-border">
              {stagesConfig.map((stage) => {
                const Icon = stage.icon;
                const status = stageStatuses[stage.id];

                const nodeStyles = {
                  idle: 'border-brand-border text-brand-muted bg-white',
                  active: 'border-status-info text-status-info bg-status-infoSoft',
                  success: 'border-status-success text-status-success bg-status-successSoft animate-state-pop',
                  error: 'border-status-error text-status-error bg-status-errorSoft'
                }[status] || 'border-brand-border text-brand-muted bg-white';

                return (
                  <div key={stage.id} className="relative flex items-start gap-4">
                    <div className={`absolute -left-[28px] top-1.5 h-6 w-6 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${nodeStyles}`}>
                      {status === 'active' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Icon className="h-3 w-3" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-brand-text leading-none">{stage.name}</h4>
                          {status === 'active' && (
                            <span className="text-[9px] font-bold text-status-info uppercase animate-pulse">
                              Processing...
                            </span>
                          )}
                          {status === 'success' && (
                            <span className="text-[9px] font-bold text-status-success uppercase transition-all duration-200">
                              Complete
                            </span>
                          )}
                          {status === 'error' && (
                            <span className="text-[9px] font-bold text-status-error uppercase">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-brand-muted mt-1 leading-none">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch Summary Panel */}
            {batchSummary && (
              <div className="mt-6 p-4 bg-surface border border-brand-border rounded shadow-sm space-y-3 animate-state-pop">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                  <span className="text-xs font-bold uppercase text-brand-text">Batch Processing Summary</span>
                  <span className="text-xs font-bold text-brand-secondary">
                    {batchSummary.successfulCount} / {batchSummary.total} Succeeded
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {batchSummary.results.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-brand-border rounded text-xs">
                      <span className="font-medium text-brand-text truncate max-w-xs">{res.fileName}</span>
                      {res.success ? (
                        <span className="text-[10px] font-bold text-status-success flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Complete
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-status-error flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle className="h-3 w-3" /> {res.error || 'Failed'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Single Success Summary Panel */}
            {pipelineState === 'success' && successProduct && !batchSummary && (
              <div className="mt-6 p-4 bg-status-successSoft border border-brand-border rounded animate-state-pop">
                <div className="flex items-center gap-2 text-status-success mb-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-sm font-bold leading-none">Ingestion Completed Successfully</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-brand-border/40 text-left">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Product Name</span>
                    <span className="text-xs font-semibold text-brand-text mt-0.5 block truncate">{successProduct.name || successProduct.productName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">SKU</span>
                    <span className="text-xs font-mono font-semibold text-brand-text mt-0.5 block">{successProduct.extractedData?.sku || successProduct.sku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Status</span>
                    <span className="text-xs font-semibold text-status-success mt-0.5 block">{successProduct.status || 'Verified'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Details Panel */}
            {pipelineState === 'error' && (
              <div className="mt-6 p-4 bg-status-errorSoft border border-brand-border rounded animate-state-pop">
                <div className="flex items-center gap-2 text-status-error mb-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-sm font-bold leading-none">Extraction Pipeline Failure</span>
                </div>
                <p className="text-xs text-brand-muted mt-2 font-medium">{errorDetails}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Upload;
