import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FileText,
  CheckSquare,
  AlertTriangle,
  UploadCloud,
  Cpu
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
      value: '124',
      icon: Package,
      subtext: 'Extracted canonical catalogue records',
      statusColor: 'text-primary'
    },
    {
      label: 'Documents',
      value: '38',
      icon: FileText,
      subtext: 'Ingested catalogue file sources',
      statusColor: 'text-status-info'
    },
    {
      label: 'Verified',
      value: '112',
      icon: CheckSquare,
      subtext: 'Zero validation errors or warnings',
      statusColor: 'text-status-success'
    },
    {
      label: 'Needs Review',
      value: '12',
      icon: AlertTriangle,
      subtext: 'Pending manual operator validation',
      statusColor: 'text-status-warning'
    }
  ];

  // Mock processing pipeline stage states
  const pipelineStages = [
    {
      name: 'Upload',
      description: 'Ingest raw catalog file',
      status: 'Complete'
    },
    {
      name: 'OCR',
      description: 'Extract raw document text',
      status: 'Complete'
    },
    {
      name: 'Gemini AI',
      description: 'AI-assisted structural parse',
      status: 'Processing'
    },
    {
      name: 'Validation',
      description: 'Audit schema & whitelists',
      status: 'Waiting'
    },
    {
      name: 'MongoDB',
      description: 'Sync to database indexes',
      status: 'Waiting'
    }
  ];

  // Mock recently ingested documents
  const recentDocs = [
    {
      filename: 'flora_grow_catalog.pdf',
      status: 'Verified',
      time: '2 min ago'
    },
    {
      filename: 'industrial_motor_specs.pdf',
      status: 'Needs Review',
      time: '8 min ago'
    },
    {
      filename: 'pump_catalog.pdf',
      status: 'Processing',
      time: '15 min ago'
    }
  ];

  // Mock validation queue alerts
  const validationAlerts = [
    {
      productName: 'Pump P100',
      field: 'Price',
      issue: 'Price must be a positive decimal number (coerced -5.0).',
      status: 'Needs Review'
    },
    {
      productName: 'Valve V40',
      field: 'Brand',
      issue: 'Brand "Valvoco" is not matching the configured brand whitelist.',
      status: 'Warning'
    },
    {
      productName: 'Motor X200',
      field: 'Warranty',
      issue: 'Missing required validation information.',
      status: 'Warning'
    }
  ];

  // Mock recently extracted products
  const recentProducts = [
    {
      productName: 'Motor X200',
      sku: 'FLORA-MX-200',
      confidence: 96,
      status: 'Verified'
    },
    {
      productName: 'Pump P100',
      sku: 'FLORA-PP-100',
      confidence: 85,
      status: 'Needs Review'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Page Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Good morning, Flora</h1>
            <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-xs font-semibold text-status-success">Pipeline Ready</span>
          </div>
          <p className="text-sm text-brand-muted">Product intelligence and operational ingestion logs at a glance.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/upload">
            <Button variant="primary" icon={UploadCloud}>
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            subtext={kpi.subtext}
            statusColor={kpi.statusColor}
          />
        ))}
      </div>

      {/* 3. Processing Pipeline Status */}
      <ProcessingPipeline stages={pipelineStages} />

      {/* 4. Details panels grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8 flex flex-col">
          <div className="flex-1 min-h-[300px]">
            <RecentDocuments documents={recentDocs} />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ValidationQueue queue={validationAlerts} />
          </div>
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8 flex flex-col">
          <div className="flex-1 min-h-[250px]">
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
