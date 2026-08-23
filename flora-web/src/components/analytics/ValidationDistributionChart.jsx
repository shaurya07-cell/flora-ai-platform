import React from 'react';

export const ValidationDistributionChart = ({ valid = 0, warning = 0, failed = 0, total = 0 }) => {
  const safeTotal = total || (valid + warning + failed) || 1;
  const validPct = Math.round((valid / safeTotal) * 100);
  const warningPct = Math.round((warning / safeTotal) * 100);
  const failedPct = Math.round((failed / safeTotal) * 100);

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-brand-text">Validation Status Ratio</span>
        <span className="text-brand-muted">{total} Total Items</span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {valid > 0 && (
          <div
            style={{ width: `${validPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Validated: ${valid} (${validPct}%)`}
          />
        )}
        {warning > 0 && (
          <div
            style={{ width: `${warningPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Needs Review: ${warning} (${warningPct}%)`}
          />
        )}
        {failed > 0 && (
          <div
            style={{ width: `${failedPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Failed: ${failed} (${failedPct}%)`}
          />
        )}
      </div>

      {/* Legend & Stat Breakdowns */}
      <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
        <div className="p-3 border border-emerald-200 bg-emerald-50/40 rounded">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-status-success">Validated</span>
          </div>
          <span className="text-lg font-extrabold text-brand-text block">{valid}</span>
          <span className="text-[10px] text-brand-muted">{validPct}% of catalog</span>
        </div>

        <div className="p-3 border border-amber-200 bg-amber-50/40 rounded">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="font-bold text-status-warning">Needs Review</span>
          </div>
          <span className="text-lg font-extrabold text-brand-text block">{warning}</span>
          <span className="text-[10px] text-brand-muted">{warningPct}% of catalog</span>
        </div>

        <div className="p-3 border border-rose-200 bg-rose-50/40 rounded">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="font-bold text-status-error">Failed</span>
          </div>
          <span className="text-lg font-extrabold text-brand-text block">{failed}</span>
          <span className="text-[10px] text-brand-muted">{failedPct}% of catalog</span>
        </div>
      </div>
    </div>
  );
};
