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
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* List Queue */}
      <div className="flex-1 divide-y divide-brand-border overflow-y-auto">
        {documents.map((doc) => {
          // Status Badge / Icon styling mappings
          const statusConfig = {
            Verified: {
              badge: 'bg-emerald-50 text-status-success border-emerald-100',
              icon: <CheckCircle2 className="h-4 w-4 text-status-success" />
            },
            'Needs Review': {
              badge: 'bg-amber-50 text-status-warning border-amber-100',
              icon: <AlertCircle className="h-4 w-4 text-status-warning" />
            },
            Processing: {
              badge: 'bg-cyan-50 text-status-info border-cyan-100',
              icon: <Loader2 className="h-4 w-4 text-status-info animate-spin" />
            }
          }[doc.status] || {
            badge: 'bg-slate-50 text-brand-muted border-slate-100',
            icon: <FileText className="h-4 w-4 text-brand-muted" />
          };

          return (
            <div
              key={doc.filename}
              className="p-4 flex items-center justify-between transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-slate-50 border border-brand-border text-brand-muted">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-text truncate">{doc.filename}</p>
                  <span className="text-[10px] text-brand-muted font-medium block mt-0.5">{doc.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${statusConfig.badge}`}>
                  {doc.status}
                </span>
                {statusConfig.icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RecentDocuments;
