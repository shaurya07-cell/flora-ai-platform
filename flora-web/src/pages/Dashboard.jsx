import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FileText,
  CheckSquare,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import { Button } from '../components/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ProcessingPipeline } from '../components/dashboard/ProcessingPipeline';
import { RecentDocuments } from '../components/dashboard/RecentDocuments';
import { ValidationQueue } from '../components/dashboard/ValidationQueue';
import { RecentProducts } from '../components/dashboard/RecentProducts';
import { QuickActions } from '../components/dashboard/QuickActions';

export const Dashboard = () => {
  // Mock Ingestion KPIs
  const kpiData = [
    {
      label: 'Products Processed',
      value: '0',
      icon: Package,
      subtext: 'No products processed yet',
      statusColor: 'text-primary'
    },
    {
      label: 'Documents',
      value: '0',
      icon: FileText,
      subtext: 'No documents uploaded yet',
      statusColor: 'text-status-info'
    },
    {
      label: 'Verified',
      value: '0',
      icon: CheckSquare,
      subtext: 'No validation results yet',
      statusColor: 'text-status-success'
    },
    {
      label: 'Needs Review',
      value: '0',
      icon: AlertTriangle,
      subtext: 'No items require review',
      statusColor: 'text-status-warning'
    }
  ];

  // Mock processing pipeline stage states
  const pipelineStages = [
    {
      name: 'Upload',
      description: 'Ingest raw catalog file',
      status: 'Ready'
    },
    {
      name: 'OCR',
      description: 'Extract raw document text',
      status: 'Ready'
    },
    {
      name: 'Gemini AI',
      description: 'AI-assisted structural parse',
      status: 'Ready'
    },
    {
      name: 'Validation',
      description: 'Audit schema & whitelists',
      status: 'Ready'
    },
    {
      name: 'MongoDB',
      description: 'Sync to database indexes',
      status: 'Ready'
    }
  ];

  // Mock recently ingested documents
  const recentDocs = [];

  // Mock validation queue alerts
  const validationAlerts = [
  ];

  // Mock recently extracted products
  const recentProducts = [

  ];

  return (
    <div className="space-y-6 lg:space-y-8 select-none">
      {/* 1. Page Header (Stagger Item 1 - 0ms delay) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-brand-border animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Good morning, Flora</h1>
            <div className="h-2.5 w-2.5 rounded-full bg-status-success shrink-0" />
            <span className="text-xs font-semibold text-status-success">Pipeline Ready</span>
          </div>
          <p className="text-sm text-brand-muted">Product intelligence at a glance.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/upload">
            <Button
              variant="primary"
              icon={UploadCloud}
              className="active:scale-[0.98] transition-all hover:scale-[1.01] hover:shadow-sm hover:brightness-105 focus:ring-primary"
            >
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards (Stagger Item 2 - 0ms to 180ms delay) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {kpiData.map((kpi, idx) => {
          const delayClass = [
            '',
            'animation-delay-60',
            'animation-delay-120',
            'animation-delay-180'
          ][idx] || '';

          return (
            <div key={kpi.label} className={`animate-fade-in-up ${delayClass}`}>
              <KpiCard
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                subtext={kpi.subtext}
                statusColor={kpi.statusColor}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Processing Pipeline (Stagger Item 3 - 240ms delay) */}
      <div className="animate-fade-in-up animation-delay-240">
        <ProcessingPipeline stages={pipelineStages} />
      </div>

      {/* 4. Activity Logs Layout (Stagger Item 4 - 300ms delay) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch animate-fade-in-up animation-delay-300">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8 flex flex-col">
          <div className="flex-1 min-h-[260px]">
            <RecentDocuments documents={recentDocs} />
          </div>
          <div className="flex-1 min-h-[260px]">
            <ValidationQueue queue={validationAlerts} />
          </div>
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8 flex flex-col">
          <div className="flex-1 min-h-[260px]">
            <RecentProducts products={recentProducts} />
          </div>
          <div className="flex-none">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
