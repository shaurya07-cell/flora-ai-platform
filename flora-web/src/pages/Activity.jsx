import React, { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { ProductDetailDrawer } from '../components/products/ProductDetailDrawer';
import axiosInstance from '../lib/axios';

export const Activity = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectProduct, setInspectProduct] = useState(null);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/products');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else {
        setError('Failed to fetch activity records.');
      }
    } catch (err) {
      console.error('Activity fetch error:', err);
      setError('Unable to connect to server API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  // Filter products based on search and status
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sourceFile && p.sourceFile.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VERIFIED' && p.status === 'Verified') ||
      (statusFilter === 'NEEDS_REVIEW' && (p.status === 'Needs Review' || !p.status)) ||
      (statusFilter === 'REJECTED' && p.status === 'Rejected');

    return matchesSearch && matchesStatus;
  });

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="System Processing Activity"
        subtitle="Audit log of document ingestions, OCR text extractions, and compliance validation outcomes."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            disabled={loading}
            onClick={fetchActivity}
            className={loading ? 'animate-spin' : ''}
          >
            Refresh Activity
          </Button>
        }
      />

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface border border-brand-border rounded p-4 shadow-sm text-left">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by Product Name, SKU, Brand, or Source File..."
            className="w-full pl-9 pr-3 py-2 border border-brand-border rounded text-xs focus:outline-none focus:border-brand-borderStrong"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-brand-border rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-brand-borderStrong"
          >
            <option value="ALL">All Statuses ({products.length})</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="NEEDS_REVIEW">Needs Review Only</option>
            <option value="REJECTED">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Activity Content Table */}
      {loading ? (
        <div className="bg-surface border border-brand-border rounded shadow-sm p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-200 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-surface border border-brand-border rounded p-8 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-status-warning mx-auto" />
          <p className="text-sm font-bold text-brand-text">{error}</p>
          <p className="text-xs text-brand-muted">Check server backend connection and try again.</p>
          <Button variant="primary" size="sm" onClick={fetchActivity} icon={RefreshCw}>
            Retry Request
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-surface border border-brand-border rounded p-12 text-center space-y-3">
          <ActivityIcon className="h-8 w-8 text-brand-muted mx-auto" />
          <p className="text-sm font-bold text-brand-text">No activity records found.</p>
          <p className="text-xs text-brand-muted">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try clearing your search or status filter to view all processing activity.'
              : 'Upload product catalogs to populate the system activity log.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-brand-border rounded shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  <th className="px-6 py-3.5">Product / Item Name</th>
                  <th className="px-6 py-3.5">Source Document</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Validation Result</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredProducts.map((product) => {
                  const score = product.extractedData?.validation?.confidence?.score ?? product.confidenceScore ?? 0;
                  const isValid = product.extractedData?.validation?.isValid ?? (product.status === 'Verified');
                  const warningsCount = product.extractedData?.validation?.warnings?.length || 0;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-brand-text text-sm">
                          {product.name || 'Unnamed Product'}
                        </div>
                        <div className="text-[11px] text-brand-muted font-mono mt-0.5">
                          SKU: {product.sku || product.extractedData?.sku || 'N/A'} • Brand: {product.brand || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-secondary font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-brand-muted shrink-0" />
                          <span className="truncate max-w-xs">{product.sourceFile || product.extractedData?.document?.fileName || 'Upload'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-muted text-[11px]">
                        {formatDate(product.createdAt || product.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          product.status === 'Verified'
                            ? 'bg-emerald-50 text-status-success border border-emerald-200'
                            : product.status === 'Rejected'
                            ? 'bg-red-50 text-status-error border border-red-200'
                            : 'bg-amber-50 text-status-warning border border-amber-200'
                        }`}>
                          {product.status === 'Verified' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : product.status === 'Rejected' ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {product.status || 'Needs Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-text">
                        {score}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setInspectProduct(product)}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reused ProductDetailDrawer */}
      {inspectProduct && (
        <ProductDetailDrawer
          product={inspectProduct}
          onClose={() => setInspectProduct(null)}
          onDeleteSuccess={() => {
            setInspectProduct(null);
            fetchActivity();
          }}
        />
      )}
    </div>
  );
};

export default Activity;
