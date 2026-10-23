import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  Filter,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  RefreshCw,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ProductList = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Metadata for filter options
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Load filter metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (brandRes.success) setBrands(brandRes.data || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        all: 'true',
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
      });

      if (search.trim()) params.append('keyword', search.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (stockFilter) params.append('stockStatus', stockFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Failed to load product catalog', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedCategory, selectedBrand, stockFilter, statusFilter, sortBy, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle single deletion
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        showToast('Product removed successfully', 'info');
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkStatus = async (isActive) => {
    if (!selectedIds.length) return;
    const actionLabel = isActive ? 'activate' : 'disable';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${selectedIds.length} products?`)) return;

    try {
      setBulkProcessing(true);
      const res = await api.patch('/products/bulk/status', {
        productIds: selectedIds,
        isActive,
      });
      if (res.success) {
        showToast(`Successfully updated ${res.data?.modifiedCount || selectedIds.length} products`, 'success');
        setSelectedIds([]);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Bulk status update failed', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `DANGER: Are you sure you want to permanently delete ${selectedIds.length} products? This action cannot be undone.`
      )
    )
      return;

    try {
      setBulkProcessing(true);
      const res = await api.post('/products/bulk/delete', {
        productIds: selectedIds,
      });
      if (res.success) {
        showToast(`Successfully deleted ${res.data?.deletedCount || selectedIds.length} products`, 'info');
        setSelectedIds([]);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message || 'Bulk delete failed', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setStockFilter('');
    setStatusFilter('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    search || selectedCategory || selectedBrand || stockFilter || statusFilter || sortBy !== 'newest';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">Product Catalog Matrix</h1>
          <p className="text-xs text-[#707887] mt-0.5">
            Manage your store's inventory, variants, pricing, and merchandising flags ({total} total products)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="p-2.5 text-[#A5ACB8] hover:text-[#F5F7FA] bg-[#151922] border border-[#252B35] hover:bg-[#1B2029] rounded-xl transition shadow-xs"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <Link
            to="/admin/products/create"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#707887] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, SKU, tags or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#12161F] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 transition text-[#F5F7FA] placeholder-[#707887]"
            />
          </div>

          {/* Faceted Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-[#12161F] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-[#12161F] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Stock Level */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-[#12161F] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
            >
              <option value="">All Stock</option>
              <option value="in-stock">In Stock (&gt;0)</option>
              <option value="low-stock">Low Stock (≤ Alert)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>

            {/* Publication Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-[#12161F] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-[#12161F] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Reviewed</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#252B35] text-xs">
            <span className="text-[#707887] font-medium">
              Filters applied. Showing results matching criteria.
            </span>
            <button
              onClick={clearFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Floating / Sticky Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#101318] text-[#F5F7FA] rounded-xl shadow-lg border border-[#252B35] animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              disabled={bulkProcessing}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Set Active
            </button>

            <button
              onClick={() => handleBulkStatus(false)}
              disabled={bulkProcessing}
              className="px-3 py-1 bg-[#1B2029] hover:bg-[#252B35] text-[#A5ACB8] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 border border-[#252B35]"
            >
              <XCircle className="w-3.5 h-3.5" /> Disable
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-[#707887] hover:text-[#F5F7FA] text-xs transition"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B35] bg-[#101318] text-[#707887] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-[#707887] hover:text-[#F5F7FA] flex items-center"
                    title={selectedIds.length === products.length ? 'Deselect All' : 'Select All'}
                  >
                    {products.length > 0 && selectedIds.length === products.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#707887]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                      <span>Loading catalog products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#707887]">
                    <p className="font-semibold text-[#A5ACB8] mb-1">No products found</p>
                    <p className="text-[11px]">Try modifying your search or clearing active filters.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const effectivePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                  const isLow = p.stock <= (p.lowStockThreshold || 5);
                  const isOut = p.stock === 0;
                  const isSelected = selectedIds.includes(p._id);

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-[#1B2029] transition-colors ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelectOne(p._id)}
                          className="text-[#707887] hover:text-[#F5F7FA] flex items-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt=""
                            className="w-10 h-10 object-cover rounded-xl border border-[#252B35] flex-shrink-0 bg-[#12161F]"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#F5F7FA] truncate" title={p.title}>
                              {p.title}
                            </p>
                            <p className="text-[10px] text-[#707887] font-mono">SKU: {p.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#A5ACB8]">
                        {p.category?.name || <span className="text-[#707887] italic">None</span>}
                      </td>
                      <td className="py-3 px-4 text-[#A5ACB8]">
                        {p.brand?.name || <span className="text-[#707887] italic">None</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#F5F7FA]">${effectivePrice.toFixed(2)}</span>
                          {p.discountPrice > 0 && (
                            <span className="text-[10px] text-[#707887] line-through">
                              ${p.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isOut
                              ? 'text-rose-400'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-[#F5F7FA]'
                          }`}
                        >
                          {(isLow || isOut) && <AlertTriangle className="w-3.5 h-3.5" />}
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40 text-sky-300 text-[9px] font-bold">
                              Featured
                            </span>
                          )}
                          {p.isBestseller && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[9px] font-bold">
                              Bestseller
                            </span>
                          )}
                          {p.isNewArrival && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[9px] font-bold">
                              New
                            </span>
                          )}
                          {!p.isFeatured && !p.isBestseller && !p.isNewArrival && (
                            <span className="text-[10px] text-[#707887]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            p.isActive
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                              : 'bg-[#1B2029] text-[#707887] border-[#252B35]'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/${p._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#707887] hover:text-[#F5F7FA] rounded-lg hover:bg-[#1B2029] transition"
                            title="Preview in Storefront"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="p-1.5 text-[#707887] hover:text-emerald-400 rounded-lg hover:bg-[#1B2029] transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="p-1.5 text-[#707887] hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#252B35] bg-[#101318] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#707887]">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-[#12161F] border border-[#252B35] rounded-lg font-semibold text-[#F5F7FA] outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <span>per page · Total {total} products</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-[#252B35] bg-[#12161F] text-[#F5F7FA] rounded-xl font-semibold hover:bg-[#1B2029] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <span className="px-3 py-1 font-semibold text-[#F5F7FA]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-[#252B35] bg-[#12161F] text-[#F5F7FA] rounded-xl font-semibold hover:bg-[#1B2029] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
