import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FileText,
  CheckSquare,
  AlertTriangle,
  UploadCloud,
  Award,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ProcessingPipeline } from '../components/dashboard/ProcessingPipeline';
import { RecentProducts } from '../components/dashboard/RecentProducts';
import { ValidationDistribution } from '../components/dashboard/ValidationDistribution';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ProductDetailDrawer } from '../components/products/ProductDetailDrawer';
import axiosInstance from '../lib/axios';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/products/stats');
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Unable to load dashboard metrics. Backend server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Pipeline stage configs
  const pipelineStages = [
    { name: 'Upload', description: 'Ingest raw catalog file', status: 'Ready' },
    { name: 'OCR', description: 'Extract raw document text', status: 'Ready' },
    { name: 'AI Extraction', description: 'AI-assisted structural parse', status: 'Ready' },
    { name: 'Validation', description: 'Audit schema & whitelists', status: 'Ready' },
    { name: 'Database', description: 'Sync to database indexes', status: 'Ready' }
  ];

  const totalProducts = stats?.totalProducts || 0;
  const processedDocs = stats?.processedDocuments || 0;
  const validatedProducts = stats?.validatedProducts || 0;
  const needsReview = stats?.needsReview || 0;
  const averageConfidence = stats?.averageConfidence || 0;
  const recentProducts = stats?.recentProducts || [];
  const validationDist = stats?.validationDistribution || { valid: 0, warning: 0, failed: 0 };

  const kpiData = [
    {
      label: 'Total Products',
      value: loading ? '...' : String(totalProducts),
      icon: Package,
      subtext: totalProducts > 0 ? `${totalProducts} item(s) in catalog` : 'No products stored',
      statusColor: 'text-primary'
    },
    {
      label: 'Processed Documents',
      value: loading ? '...' : String(processedDocs),
      icon: FileText,
      subtext: processedDocs > 0 ? `${processedDocs} document file(s)` : 'No files uploaded',
      statusColor: 'text-status-info'
    },
    {
      label: 'Validated Products',
      value: loading ? '...' : String(validatedProducts),
      icon: CheckSquare,
      subtext: validatedProducts > 0 ? `${validatedProducts} fully conforming` : 'Zero validated items',
      statusColor: 'text-status-success'
    },
    {
      label: 'Needs Review',
      value: loading ? '...' : String(needsReview),
      icon: AlertTriangle,
      subtext: needsReview > 0 ? `${needsReview} require inspection` : 'Zero review flags',
      statusColor: 'text-status-warning'
    },
    {
      label: 'Avg Extraction Confidence',
      value: loading ? '...' : `${averageConfidence}%`,
      icon: Award,
      subtext: totalProducts > 0 ? 'Derived from Gemini AI' : 'No confidence score',
      statusColor: 'text-primary'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-brand-border animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Platform Overview</h1>
            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${error ? 'bg-status-error' : 'bg-status-success'}`} />
            <span className={`text-xs font-semibold ${error ? 'text-status-error' : 'text-status-success'}`}>
              {error ? 'Backend Offline' : 'Pipeline Ready'}
            </span>
          </div>
          <p className="text-sm text-brand-muted">Real-time MongoDB Product Intelligence metrics.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} icon={RefreshCw}>
            Refresh Stats
          </Button>
          <Link to="/upload">
            <Button
              variant="primary"
              icon={UploadCloud}
              className="active:scale-[0.98] transition-all hover:scale-[1.01] hover:shadow-sm"
            >
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-status-errorSoft border border-brand-border rounded flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3 text-status-error">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <span className="text-sm font-bold block leading-none font-sans">Connection Error</span>
              <span className="text-xs mt-1 block opacity-90">{error}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} icon={RefreshCw}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 items-stretch pt-2">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="animate-fade-in-up h-full">
            <KpiCard
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              subtext={kpi.subtext}
              statusColor={kpi.statusColor}
            />
          </div>
        ))}
      </div>

      {/* 3. Processing Pipeline Status */}
      <div className="animate-fade-in-up">
        <ProcessingPipeline stages={pipelineStages} />
      </div>

      {/* 4. Real Analytics Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch animate-fade-in-up">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="flex-1 min-h-[300px]">
            <RecentProducts
              products={recentProducts}
              onSelectProduct={(p) => setSelectedProduct(p)}
              loading={loading}
            />
          </div>
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="flex-1 min-h-[220px]">
            <ValidationDistribution
              distribution={validationDist}
              total={totalProducts}
            />
          </div>
          <div className="flex-none">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Reused ProductDetailDrawer from Phase A */}
      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDeleteSuccess={() => {
            setSelectedProduct(null);
            fetchStats();
          }}
        />
      )}
    </div>
  );
};
export default Dashboard;
