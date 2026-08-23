import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export const ValidationDistribution = ({ distribution, total }) => {
  const valid = distribution?.valid || 0;
  const warning = distribution?.warning || 0;
  const failed = distribution?.failed || 0;

  const validPct = total > 0 ? Math.round((valid / total) * 100) : 0;
  const warningPct = total > 0 ? Math.round((warning / total) * 100) : 0;
  const failedPct = total > 0 ? Math.round((failed / total) * 100) : 0;

  return (
    <div className="bg-surface border border-brand-border rounded shadow-sm p-4 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-1">Validation Audit Distribution</h3>
        <p className="text-[11px] text-brand-muted mb-4">Breakdown of schema compliance across catalog items.</p>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-brand-border mb-4">
          <div 
            style={{ width: `${validPct}%` }} 
            className="bg-status-success transition-all duration-500" 
            title={`Valid: ${valid} (${validPct}%)`} 
          />
          <div 
            style={{ width: `${warningPct}%` }} 
            className="bg-status-warning transition-all duration-500" 
            title={`Needs Review: ${warning} (${warningPct}%)`} 
          />
          <div 
            style={{ width: `${failedPct}%` }} 
            className="bg-status-error transition-all duration-500" 
            title={`Failed: ${failed} (${failedPct}%)`} 
          />
        </div>

        {/* Distribution Details Legend */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-status-success" />
              <span className="font-semibold text-brand-text">Validated / Conforming</span>
            </div>
            <span className="font-bold text-brand-text">{valid} ({validPct}%)</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-status-warning" />
              <span className="font-semibold text-brand-text">Needs Review / Warnings</span>
            </div>
            <span className="font-bold text-brand-text">{warning} ({warningPct}%)</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-error" />
              <span className="font-semibold text-brand-text">Validation Failures</span>
            </div>
            <span className="font-bold text-brand-text">{failed} ({failedPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ValidationDistribution;
