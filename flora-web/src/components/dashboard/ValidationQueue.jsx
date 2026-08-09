import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Button } from '../Button';

export const ValidationQueue = ({ queue }) => {
  return (
    <div className="bg-surface border border-brand-border rounded shadow-sm flex flex-col h-full">
      {/* Header Panel */}
      <div className="p-4 border-b border-brand-border">
        <h3 className="text-sm font-bold tracking-tight text-brand-text uppercase">Validation Alerts</h3>
        <p className="text-xs text-brand-muted mt-0.5">Level B business validation exceptions requiring inspection.</p>
      </div>

      {/* Grid List */}
      <div className="flex-1 divide-y divide-brand-border overflow-y-auto">
        {queue.map((item, idx) => {
          const statusColors = {
            'Needs Review': 'text-status-error border-red-100 bg-red-50/50',
            Warning: 'text-status-warning border-amber-100 bg-amber-50/50'
          }[item.status] || 'text-brand-muted border-slate-100 bg-slate-50';

          return (
            <div
              key={idx}
              className="p-4 flex items-start justify-between gap-4 transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex gap-3 min-w-0">
                <div className={`p-2 rounded border mt-0.5 shrink-0 ${statusColors}`}>
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-brand-text">{item.productName}</span>
                    <span className="text-[10px] font-mono text-brand-muted bg-slate-100 border border-brand-border px-1.5 py-0.2 rounded-sm">
                      Field: {item.field}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-1 leading-normal">{item.issue}</p>
                </div>
              </div>

              <Link to="/validation" className="shrink-0">
                <Button variant="outline" size="sm" icon={ArrowUpRight}>
                  Review
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ValidationQueue;
