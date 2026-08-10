import React from 'react';
import { ArrowDown, UploadCloud, Eye, BrainCircuit, CheckSquare, Database } from 'lucide-react';

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
      <div className="flex flex-col mb-5">
        <h3 className="text-sm font-bold tracking-tight text-brand-text uppercase">Ingestion Pipeline</h3>
        <p className="text-xs text-brand-muted mt-0.5">Current operational flow from source upload to database indexing.</p>
      </div>

      {/* Responsive horizontal flow row with scroll overflow on small screens */}
      <div className="flex flex-row items-center w-full overflow-x-auto pb-2 lg:pb-0 gap-1.5 lg:gap-2 select-none scrollbar-thin">
        {stages.map((stage, index) => {
          const Icon = iconMap[stage.name] || UploadCloud;
          const isLast = index === stages.length - 1;

          // Determine next connector style
          const nextStage = !isLast ? stages[index + 1] : null;
          
          let connectorClass = 'bg-brand-border';
          if (nextStage) {
            // Signal travels from OCR (Complete) towards Gemini AI (Processing)
            if (stage.name === 'OCR' && nextStage.name === 'Gemini AI') {
              connectorClass = 'animate-signal-connector';
            } else if (stage.status === 'Complete' && nextStage.status === 'Complete') {
              connectorClass = 'bg-primary';
            }
          }

          // Compute style configurations mapping the precise design language
          const statusConfig = {
            Complete: {
              container: 'border-brand-border bg-status-successSoft',
              icon: 'text-status-success bg-white border-brand-border animate-state-pop',
              badge: 'bg-white text-status-success border-brand-border'
            },
            Processing: {
              container: 'border-brand-border bg-status-infoSoft',
              icon: 'text-status-info bg-white border-brand-border',
              badge: 'bg-white text-status-info border-brand-border'
            },
            Waiting: {
              container: 'border-brand-border bg-background',
              icon: 'text-brand-muted bg-white border-brand-border',
              badge: 'bg-white text-brand-muted border-brand-border'
            }
          }[stage.status] || {
            container: 'border-brand-border bg-background',
            icon: 'text-brand-muted bg-white border-brand-border',
            badge: 'bg-white text-brand-muted border-brand-border'
          };

          return (
            <React.Fragment key={stage.name}>
              {/* Pipeline Stage Card - Fixed height, equal flexible width on desktop */}
              <div className={`flex-1 min-w-[190px] lg:min-w-0 shrink-0 h-[72px] border rounded p-3 flex items-center justify-between transition-all duration-150 relative ${statusConfig.container}`}>
                {/* Slow, restrained pulse ring surrounding active stage */}
                {stage.status === 'Processing' && (
                  <span className="absolute -inset-[1px] rounded border border-status-info/50 animate-pulse pointer-events-none" />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-8 w-8 rounded border flex items-center justify-center shrink-0 ${statusConfig.icon}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-brand-text leading-none">{stage.name}</h4>
                    <p className="text-[9px] text-brand-muted font-medium mt-1 leading-normal truncate max-w-[90px] sm:max-w-none">
                      {stage.description}
                    </p>
                  </div>
                </div>

                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border shrink-0 ${statusConfig.badge}`}>
                  {stage.status}
                </span>
              </div>

              {/* Connecting elements */}
              {!isLast && (
                <div className="w-5 lg:w-8 h-1 rounded-full overflow-hidden shrink-0 bg-brand-border">
                  <div className={`w-full h-full ${connectorClass}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default ProcessingPipeline;
