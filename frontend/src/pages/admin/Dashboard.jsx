import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Eye,
  RefreshCw,
  Calendar,
  Layers,
  ArrowUpRight,
  Edit,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('revenue'); // 'revenue' or 'orders'

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await api.get('/admin/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-[#151922] rounded-2xl border border-[#252B35]" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#151922] rounded-2xl border border-[#252B35]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-[#151922] rounded-2xl border border-[#252B35]" />
          <div className="h-72 bg-[#151922] rounded-2xl border border-[#252B35]" />
        </div>
      </div>
    );
  }

  const {
    summary = {},
    dailySales = [],
    topProducts = [],
    recentOrders = [],
    recentCustomers = [],
    lowStockProducts = [],
    categoryBreakdown = [],
  } = data || {};

  const maxDaySale = Math.max(...dailySales.map((d) => d.sales), 100);
  const maxDayOrders = Math.max(...dailySales.map((d) => d.orders), 5);

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252B35]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Executive Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#707887] mt-0.5">
            Real-time business telemetry and transactional intelligence
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="px-3 py-1.5 bg-[#151922] hover:bg-[#1B2029] border border-[#252B35] text-[#A5ACB8] hover:text-[#F5F7FA] text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link
            to="/admin/products/create"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* 1. Primary Revenue KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#707887] uppercase tracking-wider">
              Total Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            ${(summary.totalSales || summary.totalRevenue || 0).toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>All time verified sales</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#707887] uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/50 border border-sky-800/40 text-sky-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            ${(summary.todayRevenue || 0).toFixed(2)}
          </p>
          <p className="text-xs text-[#707887] pt-1">
            Settled orders since 12:00 AM
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#707887] uppercase tracking-wider">
              Monthly Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-950/50 border border-purple-800/40 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            ${(summary.monthlyRevenue || 0).toFixed(2)}
          </p>
          <p className="text-xs text-[#707887] pt-1">
            Current calendar month gross
          </p>
        </div>
      </div>

      {/* 2. Operational Metrics (6 Cards: Total Orders, Pending, Completed, Customers, Products, Low Stock) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Orders */}
        <Link
          to="/admin/orders"
          className="p-4 sm:p-5 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 hover:bg-[#1B2029] hover:border-[#323B49] transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-sky-950/40 border border-sky-800/40 text-sky-400 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#707887] group-hover:text-emerald-400 transition" />
          </div>
          <p className="text-[10px] font-semibold text-[#707887] uppercase tracking-wider">Total Orders</p>
          <p className="text-xl font-bold text-[#F5F7FA]">{summary.totalOrders || 0}</p>
        </Link>

        {/* Pending Orders */}
        <Link
          to="/admin/orders?status=Processing"
          className="p-4 sm:p-5 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 hover:bg-[#1B2029] hover:border-[#323B49] transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#707887] group-hover:text-amber-400 transition" />
          </div>
          <p className="text-[10px] font-semibold text-[#707887] uppercase tracking-wider">Pending Orders</p>
          <p className="text-xl font-bold text-amber-400">{summary.pendingOrders || 0}</p>
        </Link>

        {/* Completed Orders */}
        <Link
          to="/admin/orders?status=Delivered"
          className="p-4 sm:p-5 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 hover:bg-[#1B2029] hover:border-[#323B49] transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#707887] group-hover:text-emerald-400 transition" />
          </div>
          <p className="text-[10px] font-semibold text-[#707887] uppercase tracking-wider">Delivered</p>
          <p className="text-xl font-bold text-emerald-400">{summary.completedOrders || 0}</p>
        </Link>

        {/* Total Customers */}
        <Link
          to="/admin/users"
          className="p-4 sm:p-5 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 hover:bg-[#1B2029] hover:border-[#323B49] transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#707887] group-hover:text-purple-400 transition" />
          </div>
          <p className="text-[10px] font-semibold text-[#707887] uppercase tracking-wider">Customers</p>
          <p className="text-xl font-bold text-[#F5F7FA]">{summary.totalCustomers || 0}</p>
        </Link>

        {/* Total Products */}
        <Link
          to="/admin/products"
          className="p-4 sm:p-5 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 hover:bg-[#1B2029] hover:border-[#323B49] transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#707887] group-hover:text-indigo-400 transition" />
          </div>
          <p className="text-[10px] font-semibold text-[#707887] uppercase tracking-wider">Products</p>
          <p className="text-xl font-bold text-[#F5F7FA]">{summary.totalProducts || 0}</p>
        </Link>

        {/* Low Stock Alerts */}
        <Link
          to="/admin/inventory"
          className="p-4 sm:p-5 rounded-2xl bg-[#151922] border border-[#252B35] space-y-2 hover:bg-[#1B2029] hover:border-[#323B49] transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#707887] group-hover:text-rose-400 transition" />
          </div>
          <p className="text-[10px] font-semibold text-[#707887] uppercase tracking-wider">Low Stock</p>
          <p className={`text-xl font-bold ${summary.lowStockCount > 0 ? 'text-rose-400' : 'text-[#F5F7FA]'}`}>
            {summary.lowStockCount || 0}
          </p>
        </Link>
      </div>

      {/* 3. Charts: Sales Trajectory & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue / Orders Over Time */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252B35]">
            <div>
              <h2 className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">
                Sales Velocity (Last 7 Days)
              </h2>
              <p className="text-xs text-[#707887]">Daily revenue throughput and transaction volume</p>
            </div>

            <div className="flex p-0.5 bg-[#101318] border border-[#252B35] rounded-xl self-start sm:self-auto text-xs">
              <button
                onClick={() => setActiveChartTab('revenue')}
                className={`px-3 py-1 font-semibold rounded-lg transition ${
                  activeChartTab === 'revenue'
                    ? 'bg-[#1B2029] text-emerald-400 border border-[#252B35]'
                    : 'text-[#707887] hover:text-[#F5F7FA]'
                }`}
              >
                Revenue ($)
              </button>
              <button
                onClick={() => setActiveChartTab('orders')}
                className={`px-3 py-1 font-semibold rounded-lg transition ${
                  activeChartTab === 'orders'
                    ? 'bg-[#1B2029] text-sky-400 border border-[#252B35]'
                    : 'text-[#707887] hover:text-[#F5F7FA]'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Dynamic Dark Bar Chart */}
          <div className="pt-6 grid grid-cols-7 gap-2.5 sm:gap-4 items-end h-64 border-b border-[#252B35]/60 pb-2">
            {dailySales.map((day) => {
              const val = activeChartTab === 'revenue' ? day.sales : day.orders;
              const maxVal = activeChartTab === 'revenue' ? maxDaySale : maxDayOrders;
              const heightPct = Math.max(10, Math.round((val / (maxVal || 1)) * 100));

              return (
                <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {activeChartTab === 'revenue' ? `$${day.sales.toFixed(0)}` : `${day.orders} ord`}
                  </span>

                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      activeChartTab === 'revenue'
                        ? 'bg-emerald-500/70 group-hover:bg-emerald-500'
                        : 'bg-sky-500/70 group-hover:bg-sky-500'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${day.label}: $${day.sales.toFixed(2)} (${day.orders} orders)`}
                  />

                  <span className="text-[10px] text-[#707887] font-medium truncate max-w-full">
                    {day.label.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Sales by Category */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
            <div>
              <h2 className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">
                Sales by Category
              </h2>
              <p className="text-xs text-[#707887]">Department gross distribution</p>
            </div>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-4 pt-1">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#707887] py-8 text-center">No category sales recorded yet.</p>
            ) : (
              categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-[#F5F7FA]">{cat.category}</span>
                    <span className="text-emerald-400 font-bold">
                      ${cat.total.toFixed(2)}{' '}
                      <span className="text-[10px] text-[#707887] font-normal">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#101318] overflow-hidden border border-[#252B35]">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#707887] block">{cat.count} units fulfilled</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Top-Selling Products Leaderboard */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
          <div>
            <h2 className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">
              Top Products Performance
            </h2>
            <p className="text-xs text-[#707887]">Ranked by confirmed order line items</p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs text-emerald-400 font-medium hover:underline flex items-center gap-1"
          >
            Catalog Matrix <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {topProducts.map((p, idx) => (
            <div
              key={p._id || idx}
              className="p-3.5 rounded-xl bg-[#101318] border border-[#252B35] flex items-center gap-3.5"
            >
              <div className="relative">
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt=""
                  className="w-11 h-11 rounded-lg object-cover border border-[#252B35] flex-shrink-0"
                />
                <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-[#F5F7FA] truncate">{p.title}</p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-bold text-emerald-400">
                    ${p.totalRevenue?.toFixed(0)} <span className="text-[10px] text-[#707887] font-normal">gross</span>
                  </span>
                  <Badge variant="adminDark" size="xs">
                    {p.totalSold} sold
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tables: Recent Orders & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table 1: Recent Orders */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
            <div>
              <h2 className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">
                Recent Orders
              </h2>
              <p className="text-xs text-[#707887]">Live fulfillment dispatch stream</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs text-emerald-400 font-medium hover:underline flex items-center gap-1"
            >
              All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252B35] bg-[#101318] text-[#707887] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252B35]/60">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#1B2029] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-emerald-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#F5F7FA]">{ord.user?.name || ord.shippingAddress?.fullName}</p>
                      <p className="text-[10px] text-[#707887]">{ord.user?.email}</p>
                    </td>
                    <td className="py-3 px-3 text-[#A5ACB8]">
                      {ord.orderItems?.length} items
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#F5F7FA]">
                      ${ord.totalPrice?.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          ord.orderStatus === 'Delivered'
                            ? 'adminDelivered'
                            : ord.orderStatus === 'Cancelled'
                            ? 'adminCancelled'
                            : ord.orderStatus === 'Shipped'
                            ? 'adminShipped'
                            : ord.orderStatus === 'Processing'
                            ? 'adminProcessing'
                            : 'adminPending'
                        }
                        size="xs"
                      >
                        {ord.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="px-2.5 py-1 bg-[#101318] hover:bg-[#1B2029] border border-[#252B35] text-emerald-400 text-[11px] font-medium rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Customers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
            <div>
              <h2 className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">
                New Customers
              </h2>
              <p className="text-xs text-[#707887]">Newly registered accounts</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs text-emerald-400 font-medium hover:underline flex items-center gap-1"
            >
              View Directory <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#252B35]/60">
            {recentCustomers.map((cust) => (
              <div key={cust._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2029] border border-[#252B35] text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {cust.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#F5F7FA] truncate">{cust.name}</p>
                    <p className="text-[10px] text-[#707887] truncate">{cust.email}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-bold text-emerald-400 block text-xs">
                    ${cust.totalSpent?.toFixed(0) || 0}
                  </span>
                  <span className="text-[10px] text-[#707887]">{cust.orderCount || 0} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table 3: Low-Stock Products Alert Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#151922] border border-[#252B35] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">
                Low-Stock Inventory Re-Order Matrix
              </h2>
              <p className="text-xs text-[#707887]">
                SKUs reaching warehouse replenishment limit (&le; threshold)
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory"
            className="text-xs text-emerald-400 font-medium hover:underline flex items-center gap-1"
          >
            Inventory Hub <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#707887]">
            All active catalog products have healthy warehouse inventory levels.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252B35] bg-[#101318] text-[#707887] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Unit Price</th>
                  <th className="py-2.5 px-3">Stock Remaining</th>
                  <th className="py-2.5 px-3">Threshold</th>
                  <th className="py-2.5 px-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252B35]/60">
                {lowStockProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1B2029] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#F5F7FA] flex items-center gap-2.5 min-w-[200px]">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border border-[#252B35]"
                      />
                      <span className="truncate">{p.title}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#A5ACB8]">{p.sku}</td>
                    <td className="py-3 px-3 text-[#A5ACB8]">{p.category?.name || 'General'}</td>
                    <td className="py-3 px-3 font-semibold text-[#F5F7FA]">${p.price?.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-950/50 border border-rose-800/50 text-rose-300">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#707887]">{p.lowStockThreshold} units</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/products/${p._id}/edit`}
                        className="px-3 py-1 bg-[#101318] hover:bg-[#1B2029] border border-[#252B35] text-emerald-400 text-[11px] font-medium rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Adjust Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
