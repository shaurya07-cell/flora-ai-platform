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
        {!queue || queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center select-none animate-fade-in-up">
            <ShieldAlert className="h-8 w-8 text-brand-muted mb-2 opacity-60" />
            <p className="text-sm font-semibold text-brand-text">No validation alerts</p>
            <p className="text-xs text-brand-muted mt-1 max-w-[220px] leading-normal">
              Items requiring review will appear here.
            </p>
          </div>
        ) : (
          queue.map((item, idx) => {
            const statusColors = {
              'Needs Review': 'text-status-error border-brand-border bg-status-errorSoft',
              Warning: 'text-status-warning border-brand-border bg-status-warningSoft'
            }[item.status] || 'text-brand-muted border-brand-border bg-slate-50';

            return (
              <div
                key={idx}
                className="px-4 py-3 flex items-center justify-between gap-4 transition-colors duration-150 hover:bg-slate-50/70"
              >
                <div className="flex gap-3 min-w-0">
                  <ShieldAlert className={`h-5 w-5 mt-0.5 shrink-0 ${statusColors.split(' ')[0]}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-brand-text">{item.productName}</span>
                      <span className="text-[10px] font-mono text-brand-muted bg-slate-100 px-1.5 py-0.2 rounded-sm border border-brand-border">
                        {item.field}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-0.5 leading-normal truncate max-w-lg sm:max-w-xl">
                      {item.issue}
                    </p>
                  </div>
                </div>

                <Link to="/validation" className="shrink-0">
                  <Button variant="outline" size="sm" icon={ArrowUpRight}>
                    Review
                  </Button>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default ValidationQueue;
