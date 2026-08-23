import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, CheckCircle2, AlertTriangle, Loader2, Play } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import axiosInstance from '../lib/axios';

const initialMockDocs = [
  {
    _id: 'doc_1',
    filename: 'flora_grow_catalog.pdf',
    fileSize: 350100,
    status: 'Processed',
    stage: 'Database Sync',
    uploadDate: '2026-08-09T01:48:00.000Z'
  },
  {
    _id: 'doc_2',
    filename: 'industrial_motor_specs.pdf',
    fileSize: 1250000,
    status: 'Processed',
    stage: 'Database Sync',
    uploadDate: '2026-08-09T01:42:00.000Z'
  },
  {
    _id: 'doc_3',
    filename: 'pump_catalog.pdf',
    fileSize: 890000,
    status: 'Processing',
    stage: 'Gemini Structuring',
    uploadDate: '2026-08-09T01:35:00.000Z'
  },
  {
    _id: 'doc_4',
    filename: 'valve_specs_corrupted.pdf',
    fileSize: 45000,
    status: 'Failed',
    stage: 'OCR Raw Parse',
    uploadDate: '2026-08-09T01:10:00.000Z',
    error: 'OCR_PARSING_FAILED: No readable characters extracted.'
  }
];

// Pulsing skeleton row for async layout state
const TableSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 w-1/3">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 bg-slate-200 rounded shrink-0" />
        <div className="h-4 bg-slate-200 rounded w-48" />
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-14" /></td>
    <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto" /></td>
  </tr>
);

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/products');
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedDocs = response.data.data.map((prod) => ({
          _id: prod._id,
          filename: prod.sourceFile || prod.extractedData?.document?.fileName || 'Uploaded Document',
          fileSize: 1048576, // Standard 1MB representation
          status: prod.status === 'Verified' ? 'Processed' : prod.status === 'Rejected' ? 'Failed' : 'Processed',
          stage: prod.status === 'Verified' ? 'Database Sync' : prod.status === 'Rejected' ? 'Schema Rejected' : 'Rules Evaluation',
          uploadDate: prod.createdAt || new Date().toISOString(),
          error: prod.extractedData?.validation?.errors?.[0]?.message || null
        }));
        setDocuments(mappedDocs);
        setIsOffline(false);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.warn('Backend server error loading documents queue.');
      setIsOffline(true);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const [feedback, setFeedback] = useState(null);

  const handleRetry = async (docId) => {
    if (retryingId) return; // Prevent duplicate clicks
    setRetryingId(docId);
    setFeedback(null);

    try {
      const response = await axiosInstance.post(`/products/${docId}/retry`);
      if (response.data?.success) {
        setFeedback({ type: 'success', message: 'Document re-processed successfully!' });
      } else {
        setFeedback({ type: 'error', message: response.data?.error?.message || 'Retry failed.' });
      }
    } catch (err) {
      console.error('Failed to retry document processing:', err);
      const errMsg = err.response?.data?.error?.message || err.message || 'Retry failed.';
      setFeedback({
        type: 'error',
        message: errMsg
      });
    } finally {
      await fetchDocuments();
      setRetryingId(null);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Ingested Documents Queue"
        subtitle="Track document processing status, retry pipeline runs, and review raw ocr extraction details."
        actions={
          <Button variant="outline" size="sm" onClick={fetchDocuments} icon={RefreshCw}>
            Sync Queue
          </Button>
        }
      />

      {feedback && (
        <div className={`p-3 border rounded text-xs font-semibold flex items-center justify-between animate-fade-in-up ${
          feedback.type === 'success'
            ? 'bg-status-successSoft text-status-success border-brand-border'
            : 'bg-status-errorSoft text-status-error border-brand-border'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-[10px] uppercase font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      <div className="bg-surface border border-brand-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                <th className="px-6 py-4">Filename</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <>
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                </>
              ) : (
                documents.map((doc) => {
                  const statusColors = {
                    Processed: 'bg-status-successSoft text-status-success border-brand-border',
                    Processing: 'bg-status-infoSoft text-status-info border-brand-border',
                    Failed: 'bg-status-errorSoft text-status-error border-brand-border',
                    Uploaded: 'bg-slate-50 text-brand-muted border-brand-border'
                  }[doc.status] || 'bg-slate-50 text-brand-muted border-brand-border';

                  return (
                    <tr key={doc._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-brand-muted shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-brand-text block truncate max-w-xs sm:max-w-md">
                              {doc.filename}
                            </span>
                            {doc.error && (
                              <span className="text-[10px] text-status-error font-medium block mt-0.5 max-w-xs sm:max-w-md truncate">
                                {doc.error}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-brand-secondary font-mono">
                        {formatBytes(doc.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-xs text-brand-muted font-medium">
                        {formatDate(doc.uploadDate)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-brand-text">
                        {doc.stage}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border inline-block ${statusColors}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.status === 'Failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={retryingId === doc._id ? Loader2 : Play}
                              disabled={retryingId === doc._id}
                              className={`hover:border-brand-borderStrong active:scale-[0.98] transition-all ${retryingId === doc._id ? 'animate-pulse' : ''
                                }`}
                              onClick={() => handleRetry(doc._id)}
                            >
                              {retryingId === doc._id ? 'Retrying...' : 'Retry Ingestion'}
                            </Button>
                          )}
                          {doc.status === 'Processed' && (
                            <span className="text-[10px] text-brand-muted font-semibold px-2 py-1 select-none">
                              Completed
                            </span>
                          )}
                          {doc.status === 'Processing' && (
                            <Loader2 className="h-4 w-4 text-primary animate-spin mr-3" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Documents;
