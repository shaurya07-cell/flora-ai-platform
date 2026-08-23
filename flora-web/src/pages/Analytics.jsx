import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { ValidationDistributionChart } from '../components/analytics/ValidationDistributionChart';
import axiosInstance from '../lib/axios';

export const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/products/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      } else {
        setError('Failed to load analytical statistics.');
      }
    } catch (err) {
      console.error('Analytics stats fetch error:', err);
      setError('Unable to reach analytics API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Product Intelligence Analytics"
        subtitle="Operational metrics, AI extraction confidence scores, and compliance distribution overview."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            disabled={loading}
            onClick={fetchStats}
            className={loading ? 'animate-spin' : ''}
          >
            Refresh Analytics
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-surface border border-brand-border rounded text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-status-warning mx-auto" />
          <p className="text-sm font-bold text-brand-text">{error}</p>
          <p className="text-xs text-brand-muted">Please check your backend connection and try again.</p>
          <Button variant="primary" size="sm" onClick={fetchStats} icon={RefreshCw}>
            Retry Connection
          </Button>
        </div>
      ) : stats ? (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            
            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Total Products</span>
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-extrabold text-brand-text">{stats.totalProducts}</div>
              <p className="text-[10px] text-brand-muted">In canonical database</p>
            </div>

            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Processed Documents</span>
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div className="text-2xl font-extrabold text-brand-text">{stats.processedDocuments}</div>
              <p className="text-[10px] text-brand-muted">Distinct source files</p>
            </div>

            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Validated</span>
                <CheckCircle2 className="h-4 w-4 text-status-success" />
              </div>
              <div className="text-2xl font-extrabold text-status-success">{stats.validatedProducts}</div>
              <p className="text-[10px] text-brand-muted">Verified & compliance clear</p>
            </div>

            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Needs Review</span>
                <AlertTriangle className="h-4 w-4 text-status-warning" />
              </div>
              <div className="text-2xl font-extrabold text-status-warning">{stats.needsReview}</div>
              <p className="text-[10px] text-brand-muted">Flagged for inspection</p>
            </div>

            <div className="bg-surface border border-brand-border rounded p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Avg Confidence</span>
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-brand-text">{stats.averageConfidence}%</div>
              <p className="text-[10px] text-brand-muted">AI Extraction Accuracy</p>
            </div>

          </div>

          {/* Validation Distribution & Confidence Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
            
            {/* Validation Distribution (2 cols) */}
            <div className="lg:col-span-2 bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
              <div className="border-b border-brand-border pb-3">
                <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                  <BarChart3 className="h-4 w-4 text-primary" /> Validation Distribution
                </h3>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Proportion of ingested catalogue items across validation states.
                </p>
              </div>

              <ValidationDistributionChart
                valid={stats.validationDistribution?.valid || stats.validatedProducts}
                warning={stats.validationDistribution?.warning || stats.needsReview}
                failed={stats.validationDistribution?.failed || stats.failedProducts}
                total={stats.totalProducts}
              />
            </div>

            {/* Confidence Score Gauge Card */}
            <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
              <div className="border-b border-brand-border pb-3">
                <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                  <Award className="h-4 w-4 text-emerald-600" /> Confidence Rating
                </h3>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Mean AI field extraction certainty across catalog processing.
                </p>
              </div>

              <div className="text-center py-4 space-y-2">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full border-4 border-emerald-500 bg-emerald-50/50 text-3xl font-extrabold text-brand-text">
                  {stats.averageConfidence}%
                </div>
                <span className="block text-xs font-bold text-status-success uppercase tracking-wider">
                  {stats.averageConfidence >= 80 ? 'High Evidence Confidence' : stats.averageConfidence >= 60 ? 'Moderate Evidence' : 'Low Evidence'}
                </span>
                <p className="text-[11px] text-brand-muted leading-relaxed px-2">
                  Scores above 70% meet auto-verification threshold for canonical catalog inclusion.
                </p>
              </div>
            </div>

          </div>

          {/* Recent Products Stream */}
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4 text-left">
            <div className="border-b border-brand-border pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                  <Clock className="h-4 w-4 text-accent" /> Recent Product Ingestion Analytics
                </h3>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Latest products parsed through OCR and AI extraction pipeline.
                </p>
              </div>
            </div>

            {stats.recentProducts && stats.recentProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Confidence Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {stats.recentProducts.map((p) => {
                      const score = p.extractedData?.validation?.confidence?.score ?? p.confidenceScore ?? 0;
                      return (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-brand-text">{p.name || 'Unnamed Product'}</td>
                          <td className="px-4 py-3 font-mono text-brand-muted">{p.sku || p.extractedData?.sku || '-'}</td>
                          <td className="px-4 py-3 text-brand-secondary">{p.brand || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Verified' ? 'bg-emerald-50 text-status-success border border-emerald-200' : 'bg-amber-50 text-status-warning border border-amber-200'
                            }`}>
                              {p.status || 'Needs Review'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-brand-text">
                            {score}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-brand-muted py-4">No recent products found in database.</p>
            )}
          </div>

          {/* Honest Historical Trend Notice */}
          <div className="p-4 bg-slate-50 border border-brand-border rounded text-xs text-brand-muted text-left flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-text block mb-0.5">Historical Time-Series Trend Notice</span>
              <p className="text-[11px] leading-relaxed">
                Historical time-series trend analytics will automatically populate as additional batch documents are ingested and processed over time across platform pipelines.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Analytics;
