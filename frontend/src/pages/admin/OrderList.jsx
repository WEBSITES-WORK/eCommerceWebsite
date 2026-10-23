import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Search,
  Filter,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const OrderList = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('paymentStatus', paymentFilter);

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, paymentFilter, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentFilter('');
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter || paymentFilter;

  // Status color helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/60';
      case 'Packed':
      case 'Processing':
        return 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60';
      case 'Confirmed':
      case 'Pending':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/60';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/60';
      default:
        return 'bg-[#101318] text-[#A5ACB8] border-[#252B35]';
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50';
      case 'Pending':
        return 'bg-amber-950/60 text-amber-400 border border-amber-800/50';
      case 'Failed':
      case 'Refunded':
        return 'bg-rose-950/60 text-rose-400 border border-rose-800/50';
      default:
        return 'bg-[#101318] text-[#707887] border border-[#252B35]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">Order Management</h1>
          <p className="text-xs text-[#707887] mt-0.5">
            Monitor incoming customer purchases, track fulfillment states, and manage dispatch logistics ({total} total orders)
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="p-2.5 text-[#A5ACB8] hover:text-[#F5F7FA] bg-[#151922] border border-[#252B35] hover:bg-[#1B2029] rounded-xl transition shadow-xs self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#707887] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order number (ORD-...), customer name, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 transition text-[#F5F7FA] placeholder-[#707887]"
            />
          </div>

          {/* Status Dropdowns */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 text-[#F5F7FA]"
            >
              <option value="" className="bg-[#101318] text-[#707887]">All Fulfillment Statuses</option>
              <option value="Pending" className="bg-[#101318] text-[#F5F7FA]">Pending</option>
              <option value="Confirmed" className="bg-[#101318] text-[#F5F7FA]">Confirmed</option>
              <option value="Processing" className="bg-[#101318] text-[#F5F7FA]">Processing</option>
              <option value="Packed" className="bg-[#101318] text-[#F5F7FA]">Packed</option>
              <option value="Shipped" className="bg-[#101318] text-[#F5F7FA]">Shipped</option>
              <option value="Out for Delivery" className="bg-[#101318] text-[#F5F7FA]">Out for Delivery</option>
              <option value="Delivered" className="bg-[#101318] text-[#F5F7FA]">Delivered</option>
              <option value="Cancelled" className="bg-[#101318] text-[#F5F7FA]">Cancelled</option>
              <option value="Refunded" className="bg-[#101318] text-[#F5F7FA]">Refunded</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 text-[#F5F7FA]"
            >
              <option value="" className="bg-[#101318] text-[#707887]">All Payment Statuses</option>
              <option value="Completed" className="bg-[#101318] text-[#F5F7FA]">Paid / Completed</option>
              <option value="Pending" className="bg-[#101318] text-[#F5F7FA]">Payment Pending</option>
              <option value="Failed" className="bg-[#101318] text-[#F5F7FA]">Failed</option>
              <option value="Refunded" className="bg-[#101318] text-[#F5F7FA]">Refunded</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#252B35] text-xs">
            <span className="text-[#A5ACB8] font-medium">Filtering orders.</span>
            <button
              onClick={clearFilters}
              className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B35] bg-[#101318]/90 text-[#707887] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#707887]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#707887]">
                    <p className="font-semibold text-[#F5F7FA] mb-1">No orders found</p>
                    <p className="text-[11px]">No orders match the current search or filters.</p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const itemsCount = ord.orderItems?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;
                  const firstThumb = ord.orderItems?.[0]?.image;

                  return (
                    <tr key={ord._id} className="hover:bg-[#1B2029]/50 transition">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          className="font-black text-[#F5F7FA] hover:text-emerald-400 font-mono tracking-tight block transition"
                        >
                          {ord.orderNumber}
                        </Link>
                        <span className="text-[10px] text-[#707887] block mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="min-w-[140px]">
                          <p className="font-bold text-[#F5F7FA]">
                            {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                          </p>
                          <p className="text-[10px] text-[#707887] truncate max-w-[180px]">
                            {ord.user?.email || ord.shippingAddress?.phone}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {firstThumb ? (
                            <img
                              src={firstThumb}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-[#252B35] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#101318] border border-[#252B35] flex items-center justify-center text-[#707887]">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-[#F5F7FA] block">
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                            </span>
                            <span className="text-[10px] text-[#707887] truncate max-w-[120px] block">
                              {ord.orderItems?.[0]?.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-[#F5F7FA] text-sm">
                          ${ord.totalPrice?.toFixed(2)}
                        </span>
                        {ord.discountAmount > 0 && (
                          <span className="block text-[9px] text-emerald-400 font-semibold">
                            Saved ${ord.discountAmount.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-[#A5ACB8] block text-[11px]">
                            {ord.paymentMethod === 'stripe'
                              ? 'Credit Card'
                              : ord.paymentMethod === 'paypal'
                              ? 'PayPal'
                              : 'Cash on Delivery'}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getPaymentBadge(
                              ord.paymentStatus
                            )}`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            ord.orderStatus
                          )}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          className="px-3 py-1.5 bg-[#1B2029] hover:bg-emerald-600 border border-[#252B35] hover:border-emerald-500 text-[#F5F7FA] font-bold rounded-xl transition inline-flex items-center gap-1.5 text-xs shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#252B35] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#707887]">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-[#101318] border border-[#252B35] rounded-lg font-bold text-[#F5F7FA] outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page · Total {total} orders</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-[#252B35] bg-[#101318] rounded-xl font-bold text-[#A5ACB8] hover:text-[#F5F7FA] hover:bg-[#1B2029] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <span className="px-3 py-1 font-bold text-[#F5F7FA]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-[#252B35] bg-[#101318] rounded-xl font-bold text-[#A5ACB8] hover:text-[#F5F7FA] hover:bg-[#1B2029] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
