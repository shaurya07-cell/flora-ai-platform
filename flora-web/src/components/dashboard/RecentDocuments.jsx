import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const RecentDocuments = ({ documents }) => {
  return (
    <div className="bg-surface border border-brand-border rounded shadow-sm flex flex-col h-full">
      {/* Header Panel */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-brand-text uppercase">Recent Documents</h3>
          <p className="text-xs text-brand-muted mt-0.5">Lately ingested catalog files and processing logs.</p>
        </div>
        <Link
          to="/documents"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5 transition-colors duration-150"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* List Queue */}
      <div className="flex-1 divide-y divide-brand-border overflow-y-auto">
        {!documents || documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center select-none animate-fade-in-up">
            <FileText className="h-8 w-8 text-brand-muted mb-2 opacity-60" />
            <p className="text-sm font-semibold text-brand-text">No documents yet</p>
            <p className="text-xs text-brand-muted mt-1 max-w-[220px] leading-normal">
              Upload a document to begin processing.
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const statusConfig = {
              Verified: {
                badge: 'bg-status-successSoft text-status-success border-brand-border',
                icon: <CheckCircle2 className="h-4 w-4 text-status-success" />
              },
              'Needs Review': {
                badge: 'bg-status-warningSoft text-status-warning border-brand-border',
                icon: <AlertCircle className="h-4 w-4 text-status-warning" />
              },
              Processing: {
                badge: 'bg-status-infoSoft text-status-info border-brand-border',
                icon: <Loader2 className="h-4 w-4 text-status-info animate-spin" />
              }
            }[doc.status] || {
              badge: 'bg-slate-50 text-brand-muted border-brand-border',
              icon: <FileText className="h-4 w-4 text-brand-muted" />
            };

            return (
              <div
                key={doc.filename}
                className="px-4 py-3 flex items-center justify-between transition-colors duration-150 hover:bg-slate-50/70"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-brand-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-text truncate">{doc.filename}</p>
                    <span className="text-[10px] text-brand-muted font-medium block mt-0.5">{doc.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${statusConfig.badge}`}>
                    {doc.status}
                  </span>
                  {statusConfig.icon}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default RecentDocuments;
