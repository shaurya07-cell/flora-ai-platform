import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Package, CheckSquare, ArrowRight } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      title: 'Upload Document',
      description: 'Ingest raw catalogs into the processing pipeline.',
      path: '/upload',
      icon: UploadCloud,
      color: 'bg-blue-50 text-primary border-blue-100 hover:bg-blue-100/50'
    },
    {
      title: 'View Products',
      description: 'Manage synchronized catalog items.',
      path: '/products',
      icon: Package,
      color: 'bg-teal-50 text-accent border-teal-100 hover:bg-teal-100/50'
    },
    {
      title: 'Review Validation',
      description: 'Resolve whitelist or formatting errors.',
      path: '/validation',
      icon: CheckSquare,
      color: 'bg-amber-50 text-status-warning border-amber-100 hover:bg-amber-100/50'
    }
  ];

  return (
    <div className="bg-surface border border-brand-border rounded shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-brand-border">
        <h3 className="text-sm font-bold tracking-tight text-brand-text uppercase">Quick Actions</h3>
        <p className="text-xs text-brand-muted mt-0.5">Quick shortcuts for core platform operators.</p>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              to={act.path}
              className={`flex items-center justify-between p-3.5 border rounded-sm transition-all duration-200 ${act.color}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <h4 className="text-xs font-bold leading-normal tracking-wide uppercase">{act.title}</h4>
                  <p className="text-[10px] text-brand-muted mt-0.5 leading-normal">{act.description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-70" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default QuickActions;
