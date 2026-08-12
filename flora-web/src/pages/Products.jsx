import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, Trash2, CheckCircle2, Award, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import axiosInstance from '../lib/axios';

const initialMockProducts = [
  {
    _id: 'prod_1',
    status: 'Verified',
    metadata: {
      filename: 'flora_grow_catalog.pdf',
      fileSize: 350100,
      uploadDate: '2026-08-09T01:48:00.000Z'
    },
    validationReport: {
      isValid: true,
      errors: [],
      warnings: [],
      confidence: {
        score: 96,
        evidenceLevel: 'High',
        evidence: ['SKU matches exact format pattern', 'Price matched currency structure']
      }
    },
    productData: {
      productName: 'Motor X200',
      sku: 'FLORA-MX-200',
      description: 'High-torque brushless motor for automated ventilation flaps.',
      brand: 'FloraGrow',
      price: 299.99,
      currency: 'USD',
      dimensions: '15 x 10 x 10 cm',
      specifications: {
        power: '200W',
        voltage: '24V',
        rpm: '3000'
      },
      complianceFlags: ['CE', 'RoHS', 'UL']
    }
  },
  {
    _id: 'prod_2',
    status: 'Needs Review',
    metadata: {
      filename: 'pump_catalog.pdf',
      fileSize: 890000,
      uploadDate: '2026-08-09T01:35:00.000Z'
    },
    validationReport: {
      isValid: false,
      errors: [
        {
          field: 'price',
          message: 'Price must be a positive decimal number',
          value: -5.0
        }
      ],
      warnings: [],
      confidence: {
        score: 85,
        evidenceLevel: 'Medium',
        evidence: ['SKU matches format pattern', 'Price currency matched']
      }
    },
    productData: {
      productName: 'Pump P100',
      sku: 'FLORA-PP-100',
      description: 'Corrosion resistant liquid catalog pump.',
      brand: 'FloraGrow',
      price: -5.0,
      currency: 'USD',
      dimensions: '20 x 15 x 12 cm',
      specifications: {
        flowRate: '100L/min',
        inlet: '1 inch'
      },
      complianceFlags: ['CE']
    }
  },
  {
    _id: 'prod_3',
    status: 'Needs Review',
    metadata: {
      filename: 'valve_catalog.pdf',
      fileSize: 450000,
      uploadDate: '2026-08-09T01:22:00.000Z'
    },
    validationReport: {
      isValid: false,
      errors: [],
      warnings: [
        {
          field: 'brand',
          message: 'Brand "Valvoco" is not matching the configured brand whitelist.',
          value: 'Valvoco'
        }
      ],
      confidence: {
        score: 72,
        evidenceLevel: 'Medium',
        evidence: ['SKU format validated', 'Price verified positive']
      }
    },
    productData: {
      productName: 'Smart Valve V40',
      sku: 'FLORA-SV-40',
      description: 'Motorized ball valve with feedback metrics.',
      brand: 'Valvoco',
      price: 89.0,
      currency: 'USD',
      dimensions: '12 x 8 x 8 cm',
      specifications: {
        pressure: 'PN16',
        thread: 'G1/2'
      },
      complianceFlags: ['CE', 'RoHS']
    }
  }
];

// Pulsing loader grid
const TableSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4 w-12"><div className="h-3.5 w-3.5 bg-slate-200 rounded-sm" /></td>
    <td className="px-5 py-4 w-1/4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
    <td className="px-5 py-4 w-1/6"><div className="h-4 bg-slate-200 rounded w-24" /></td>
    <td className="px-5 py-4 w-1/6"><div className="h-4 bg-slate-200 rounded w-20" /></td>
    <td className="px-5 py-4 w-1/12"><div className="h-4 bg-slate-200 rounded w-16" /></td>
    <td className="px-5 py-4 w-1/6"><div className="h-4 bg-slate-200 rounded w-12" /></td>
    <td className="px-5 py-4 w-1/12"><div className="h-5 bg-slate-200 rounded w-16" /></td>
    <td className="px-5 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto" /></td>
  </tr>
);

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (brandFilter !== 'ALL') params.brand = brandFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await axiosInstance.get('/products', { params });

      // Delay for skeleton transition
      setTimeout(() => {
        setProducts(response.data?.data || []);
        setIsOffline(false);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.warn('Backend server offline. Utilizing local mock products.');

      // Delay for skeleton transition
      setTimeout(() => {
        setProducts(initialMockProducts);
        setIsOffline(true);
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, brandFilter]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchProducts();
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkVerify = () => {
    setProducts(prev => prev.map(p => {
      if (selectedIds.includes(p._id)) {
        return {
          ...p,
          status: 'Verified',
          validationReport: {
            ...p.validationReport,
            isValid: true,
            errors: [],
            warnings: []
          }
        };
      }
      return p;
    }));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedIds.includes(p._id)));
    setSelectedIds([]);
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    if (isOffline) {
      setProducts(prev => prev.filter(p => p._id !== id));
    } else {
      try {
        await axiosInstance.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const brandsList = Array.from(new Set(products.map(p => p.productData?.brand || p.brand))).filter(Boolean);

  const filteredProducts = isOffline
    ? products.filter(p => {
      const matchesQuery = searchQuery
        ? (p.productData?.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.productData?.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      const matchesStatus = statusFilter !== 'ALL' ? p.status === statusFilter : true;
      const matchesBrand = brandFilter !== 'ALL' ? (p.productData?.brand === brandFilter) : true;
      return matchesQuery && matchesStatus && matchesBrand;
    })
    : products;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Canonical Products Catalogue"
        subtitle="Manage and inspect AI-extracted canonical product records from catalogues."
        actions={
          <Button variant="outline" size="sm" onClick={fetchProducts} icon={RefreshCw}>
            Refresh
          </Button>
        }
      />

      {isOffline && (
        <div className="p-3 bg-status-warningSoft border border-brand-border rounded text-xs font-semibold text-status-warning flex items-center justify-between">
          <span>Backend offline. Ingestion catalogue running in offline evaluation mode.</span>
          <span className="bg-white border border-brand-border px-1.5 py-0.5 rounded text-[10px] font-mono select-none">
            DEMO
          </span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-surface border border-brand-border rounded p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by name or SKU... (Press Enter)"
            className="w-full pl-10 pr-4 py-2 border border-brand-border rounded text-sm focus:outline-none focus:border-brand-borderStrong"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-brand-muted font-semibold">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          <select
            className="border border-brand-border rounded text-xs font-semibold px-3 py-2 bg-white focus:outline-none focus:border-brand-borderStrong"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Needs Review">Needs Review</option>
          </select>

          <select
            className="border border-brand-border rounded text-xs font-semibold px-3 py-2 bg-white focus:outline-none focus:border-brand-borderStrong"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="ALL">All Brands</option>
            {brandsList.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="p-3 bg-primary-soft border border-blue-100 rounded flex items-center justify-between animate-fade-in-up">
          <span className="text-xs font-semibold text-primary">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={handleBulkVerify}>
              Bulk Verify
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>
              Bulk Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table grid layout */}
      <div className="bg-surface border border-brand-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                <th className="px-5 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-brand-border text-primary focus:ring-primary h-3.5 w-3.5"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-5 py-4">Product Name</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Brand</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Confidence</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border animate-fade-in-up">
              {loading ? (
                <>
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                </>
              ) : (
                filteredProducts.map((p) => {
                  const data = p.productData || p;
                  const score = p.validationReport?.confidence?.score || p.confidence || 90;
                  const isVerified = p.status === 'Verified';

                  const badgeColors = isVerified
                    ? 'bg-status-successSoft text-status-success border-brand-border'
                    : 'bg-status-warningSoft text-status-warning border-brand-border';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-brand-border text-primary focus:ring-primary h-3.5 w-3.5"
                          checked={selectedIds.includes(p._id)}
                          onChange={(e) => handleSelectOne(p._id, e.target.checked)}
                        />
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-brand-text truncate max-w-xs">
                        {data.productName}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-brand-secondary">
                        {data.sku}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-brand-secondary">
                        {data.brand}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-brand-text">
                        {data.price} {data.currency}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold text-brand-text">{score}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border inline-block ${badgeColors}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedProduct(p)}
                          >
                            Inspect
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-status-error hover:bg-status-errorSoft hover:border-red-200 hover:scale-105 active:scale-95 transition-all"
                            icon={Trash2}
                            onClick={() => handleDeleteOne(p._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details inspector modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
export default Products;
