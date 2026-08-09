import React from 'react';
import { ArrowRight, ArrowDown, UploadCloud, Eye, BrainCircuit, CheckSquare, Database, Loader2 } from 'lucide-react';

const iconMap = {
  Upload: UploadCloud,
  OCR: Eye,
  'Gemini AI': BrainCircuit,
  Validation: CheckSquare,
  MongoDB: Database
};

export const ProcessingPipeline = ({ stages }) => {
  return (
    <div className="bg-surface border border-brand-border rounded p-6 shadow-sm">
      <div className="flex flex-col mb-4">
        <h3 className="text-sm font-bold tracking-tight text-brand-text uppercase">Ingestion Pipeline</h3>
        <p className="text-xs text-brand-muted mt-0.5">Current operational flow from source upload to database indexing.</p>
      </div>

      {/* Desktop view: Horizontal Row. Mobile view: Column list with connectors. */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-2">
        {stages.map((stage, index) => {
          const Icon = iconMap[stage.name] || UploadCloud;
          const isLast = index === stages.length - 1;

          // Compute style tokens
          const statusStyles = {
            Complete: {
              container: 'border-emerald-200 bg-emerald-50/50',
              icon: 'text-status-success bg-emerald-50 border-emerald-200',
              badge: 'bg-emerald-100 text-status-success border-emerald-200'
            },
            Processing: {
              container: 'border-cyan-200 bg-cyan-50/30 animate-pulse',
              icon: 'text-status-info bg-cyan-50 border-cyan-200',
              badge: 'bg-cyan-100 text-status-info border-cyan-200'
            },
            Waiting: {
              container: 'border-slate-200 bg-slate-50/30',
              icon: 'text-brand-muted bg-slate-50 border-slate-200',
              badge: 'bg-slate-100 text-brand-muted border-slate-200'
            }
          }[stage.status] || {
            container: 'border-slate-200 bg-slate-50/30',
            icon: 'text-brand-muted bg-slate-50 border-slate-200',
            badge: 'bg-slate-100 text-brand-muted border-slate-200'
          };

          return (
            <React.Fragment key={stage.name}>
              {/* Pipeline Stage Card */}
              <div className={`flex-1 border rounded p-4 flex items-center justify-between transition-all duration-200 ${statusStyles.container}`}>
                <div className="flex items-center gap-3">
                  {/* Icon with spinner indicator for processing */}
                  <div className={`h-10 w-10 rounded border flex items-center justify-center relative ${statusStyles.icon}`}>
                    <Icon className="h-5 w-5" />
                    {stage.status === 'Processing' && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                        <Loader2 className="h-3 w-3 text-status-info animate-spin" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-text">{stage.name}</h4>
                    <p className="text-[10px] text-brand-muted font-medium mt-0.5">{stage.description}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${statusStyles.badge}`}>
                  {stage.status}
                </span>
              </div>

              {/* Responsive Connectors */}
              {!isLast && (
                <>
                  {/* Desktop connector (Right Arrow) */}
                  <div className="hidden lg:flex items-center justify-center px-1 text-slate-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  {/* Mobile connector (Down Arrow) */}
                  <div className="lg:hidden flex items-center justify-center text-slate-300 py-0.5">
                    <ArrowDown className="h-4 w-4" />
                  </div>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default ProcessingPipeline;
