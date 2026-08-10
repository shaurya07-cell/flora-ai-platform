import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Play, RefreshCw, Database, Eye, BrainCircuit, CheckSquare, FileText, Loader2 } from 'lucide-react';
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
  const [file, setFile] = useState(null);
  const [simulateMode, setSimulateMode] = useState(true);
  const [pipelineState, setPipelineState] = useState('idle'); // idle, processing, success, error
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [errorDetails, setErrorDetails] = useState('');
  const [successProduct, setSuccessProduct] = useState(null);
  const [stageProgress, setStageProgress] = useState(0); // 0 to 100% for active stage
  const [stageStatuses, setStageStatuses] = useState({
    upload: 'idle',
    ocr: 'idle',
    gemini: 'idle',
    validation: 'idle',
    mongodb: 'idle'
  });

  const [simulationLogs, setSimulationLogs] = useState([]);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetPipeline = () => {
    setPipelineState('idle');
    setCurrentStageIndex(-1);
    setErrorDetails('');
    setSuccessProduct(null);
    setStageProgress(0);
    setSimulationLogs([]);
    setStageStatuses({
      upload: 'idle',
      ocr: 'idle',
      gemini: 'idle',
      validation: 'idle',
      mongodb: 'idle'
    });
  };

  const triggerIngestion = () => {
    if (!file) return;
    resetPipeline();
    setPipelineState('processing');
    if (simulateMode) {
      runSimulation();
    } else {
      runRealUpload();
    }
  };

  const runSimulation = () => {
    const stages = [
      {
        id: 'upload',
        duration: 1200,
        log: 'Document parsed. File structure loaded (size: 350.1 KB).'
      },
      {
        id: 'ocr',
        duration: 1800,
        log: 'OCR extraction successful: 4,120 clean characters parsed. Markdown table schema mapped.'
      },
      {
        id: 'gemini',
        duration: 2200,
        log: 'Gemini AI generated canonical JSON. Required schema properties verified.'
      },
      {
        id: 'validation',
        duration: 1400,
        log: 'Validation complete. Confirms price constraints (isValid: true). Score: 94% (High).'
      },
      {
        id: 'mongodb',
        duration: 1000,
        log: 'MongoDB records synchronized. Document index catalog saved successfully.'
      }
    ];

    let current = 0;

    const executeNextStage = () => {
      if (current >= stages.length) {
        setPipelineState('success');
        setSuccessProduct({
          _id: 'sim_rec_' + Math.random().toString(36).substr(2, 9),
          productName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          sku: 'FLORA-SIM-' + Math.floor(100 + Math.random() * 900),
          brand: 'FloraGrow',
          price: 149.99,
          confidence: 94
        });
        return;
      }

      const activeStage = stages[current];
      setCurrentStageIndex(current);
      setStageStatuses(prev => ({ ...prev, [activeStage.id]: 'active' }));

      let progress = 0;
      const intervalTime = activeStage.duration / 10;
      const progressInterval = setInterval(() => {
        progress += 10;
        setStageProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, intervalTime);

      setTimeout(() => {
        setStageStatuses(prev => ({ ...prev, [activeStage.id]: 'success' }));
        setSimulationLogs(prev => [...prev, activeStage.log]);
        current += 1;
        setStageProgress(0);
        executeNextStage();
      }, activeStage.duration);
    };

    executeNextStage();
  };

  const runRealUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    setCurrentStageIndex(0);
    setStageStatuses(prev => ({ ...prev, upload: 'active' }));

    try {
      const response = await axiosInstance.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStageStatuses({
        upload: 'success',
        ocr: 'success',
        gemini: 'success',
        validation: 'success',
        mongodb: 'success'
      });
      setCurrentStageIndex(4);
      setPipelineState('success');
      setSuccessProduct(response.data?.data);
    } catch (err) {
      console.error(err);
      setPipelineState('error');
      const errMsg = err.response?.data?.error?.message || err.message || 'Server connection offline.';
      setErrorDetails(errMsg);

      const failedIdx = Math.min(Math.max(0, currentStageIndex), 4);
      const failedStageId = stagesConfig[failedIdx].id;
      setStageStatuses(prev => ({ ...prev, [failedStageId]: 'error' }));
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Ingest Catalog File"
        subtitle="Submit catalog files to start the AI Product Intelligence extraction pipeline."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Col: Upload dropzone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4">Select Source File</h3>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                dragActive ? 'border-primary bg-primary-soft scale-[1.005]' : 'border-brand-border bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="h-10 w-10 text-brand-muted mb-3 transition-transform duration-250 hover:scale-105" />
              <p className="text-xs text-brand-text font-semibold">Drag & drop files here</p>
              <p className="text-[10px] text-brand-muted mt-1.5 mb-4">PDF, PNG, JPG, JPEG, or XLSX (max 10MB)</p>

              <label className="relative cursor-pointer">
                <span className="bg-white border border-brand-border rounded-sm px-3 py-1.5 text-xs font-semibold text-brand-text shadow-sm hover:bg-slate-100 transition-colors duration-150">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                />
              </label>

              {file && (
                <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-border rounded-sm max-w-full animate-state-pop">
                  <FileText className="h-3.5 w-3.5 text-brand-muted shrink-0" />
                  <span className="text-[11px] font-medium text-brand-text truncate">{file.name}</span>
                </div>
              )}
            </div>

            {/* Configs */}
            <div className="mt-5 space-y-4 pt-4 border-t border-brand-border">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <span className="text-xs font-semibold text-brand-text">Simulate Ingestion Flow</span>
                  <p className="text-[10px] text-brand-muted mt-0.5">Test visual timelines inside browser</p>
                </div>
                <input
                  type="checkbox"
                  checked={simulateMode}
                  onChange={(e) => setSimulateMode(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-primary focus:ring-primary"
                />
              </label>

              <div className="pt-2">
                <Button
                  onClick={triggerIngestion}
                  disabled={!file || pipelineState === 'processing'}
                  variant="primary"
                  className="w-full text-center hover:scale-[1.01] active:scale-[0.99] transition-all"
                  icon={Play}
                >
                  {pipelineState === 'processing' ? 'Ingesting...' : 'Start Ingestion'}
                </Button>
              </div>
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
                  Clear Ingestion
                </Button>
              )}
            </div>

            {/* Pipeline Stage Nodes */}
            <div className="relative space-y-6 pl-4 border-l border-brand-border">
              {stagesConfig.map((stage, idx) => {
                const Icon = stage.icon;
                const status = stageStatuses[stage.id];

                // Dynamic configurations mapping designs
                const nodeStyles = {
                  idle: 'border-brand-border text-brand-muted bg-white',
                  active: 'border-status-info text-status-info bg-status-infoSoft',
                  success: 'border-status-success text-status-success bg-status-successSoft animate-state-pop',
                  error: 'border-status-error text-status-error bg-status-errorSoft'
                }[status] || 'border-brand-border text-brand-muted bg-white';

                return (
                  <div key={stage.id} className="relative flex items-start gap-4">
                    {/* Circle Node overlaying the timeline bar */}
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
                              Active ({stageProgress}%)
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

            {/* Ingestion Console Log Console */}
            {simulationLogs.length > 0 && (
              <div className="mt-8 p-4 bg-slate-900 text-slate-300 rounded font-mono text-[11px] space-y-1.5 text-left border border-slate-950 animate-fade-in-up">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                  <span>System Extraction Logs</span>
                  <span className="h-2 w-2 rounded-full bg-status-info animate-pulse" />
                </div>
                {simulationLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-500 font-semibold select-none">&gt;&gt;</span>
                    <span className="flex-1 truncate">{log}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success Summary Panel */}
            {pipelineState === 'success' && successProduct && (
              <div className="mt-6 p-4 bg-status-successSoft border border-brand-border rounded animate-state-pop">
                <div className="flex items-center gap-2 text-status-success mb-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-sm font-bold leading-none">Ingestion Completed Successfully</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-brand-border/40 text-left">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Product Name</span>
                    <span className="text-xs font-semibold text-brand-text mt-0.5 block truncate">{successProduct.productName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">SKU</span>
                    <span className="text-xs font-mono font-semibold text-brand-text mt-0.5 block">{successProduct.sku}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Confidence</span>
                    <span className="text-xs font-bold text-primary mt-0.5 block">{successProduct.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Status</span>
                    <span className="text-xs font-semibold text-status-success mt-0.5 block">Verified</span>
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
                <p className="text-[10px] text-brand-muted/75 mt-3 border-t border-brand-border/40 pt-2">
                  Tip: Try toggling "Simulate Ingestion Flow" to audit the visual indicators locally.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Upload;
