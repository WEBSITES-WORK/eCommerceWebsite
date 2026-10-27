import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Layers,
  Award,
  Users,
  Calendar,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const Analytics = () => {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [activeChartTab, setActiveChartTab] = useState('revenue');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/analytics?range=${range}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      showToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  }, [range, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const {
    range: currentRange,
    totalRevenue = 0,
    totalOrders = 0,
    averageOrderValue = 0,
    salesTrends = [],
    topProducts = [],
    categoryStats = [],
    customerStats = {},
  } = data || {};

  // Find max values for chart scale
  const maxRevenue = Math.max(...(salesTrends || []).map((t) => Number(t.revenue || 0)), 100);
  const maxOrders = Math.max(...(salesTrends || []).map((t) => Number(t.orders || 0)), 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-[#707887] mt-0.5">
            Real-time business intelligence computed dynamically from your database
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time range picker */}
          <div className="bg-[#101318] border border-[#252B35] p-1 rounded-xl flex items-center text-xs font-bold text-[#A5ACB8]">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1Y' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  range === tab.id
                    ? 'bg-[#1B2029] text-[#F5F7FA] shadow-xs'
                    : 'hover:text-[#F5F7FA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics()}
            className="p-2 text-[#A5ACB8] hover:text-[#F5F7FA] bg-[#151922] border border-[#252B35] hover:bg-[#1B2029] rounded-xl transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Period Revenue */}
        <div className="p-5 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#707887] uppercase tracking-wider">
              Period Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#F5F7FA]">${Number(totalRevenue || 0).toFixed(2)}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active transactions</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#707887] uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#F5F7FA]">{totalOrders || 0}</p>
          <p className="text-[11px] text-[#707887] font-medium">Orders fulfilled or pending</p>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#707887] uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#F5F7FA]">${Number(averageOrderValue || 0).toFixed(2)}</p>
          <p className="text-[11px] text-[#707887] font-medium">Per checkout conversion</p>
        </div>

        {/* Customer Registrations */}
        <div className="p-5 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#707887] uppercase tracking-wider">
              Customer Growth
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#F5F7FA]">
            {customerStats.newCustomersInRange ?? 0}
          </p>
          <p className="text-[11px] text-[#707887] font-medium">
            {customerStats.totalCustomers ?? 0} total registered
          </p>
        </div>
      </div>

      {/* Main Trends Chart */}
      <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Trajectories Over Time
            </h2>
            <p className="text-[11px] text-[#707887] mt-0.5">
              Daily revenue and transaction volumes for range: {range.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#101318] border border-[#252B35] p-1 rounded-xl text-xs font-bold text-[#A5ACB8]">
            <button
              onClick={() => setActiveChartTab('revenue')}
              className={`px-3 py-1 rounded-lg transition ${
                activeChartTab === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:text-[#F5F7FA]'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setActiveChartTab('orders')}
              className={`px-3 py-1 rounded-lg transition ${
                activeChartTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:text-[#F5F7FA]'
              }`}
            >
              Order Count
            </button>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-4">
          {salesTrends.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#707887]">
              No sales data recorded in this timeframe.
            </div>
          ) : (
            <div className="h-64 flex items-end gap-2 sm:gap-4 overflow-x-auto pb-4 pt-6">
              {salesTrends.map((point) => {
                const value = activeChartTab === 'revenue' ? point.revenue : point.orders;
                const max = activeChartTab === 'revenue' ? maxRevenue : maxOrders;
                const heightPercent = Math.max(8, Math.min(100, (value / max) * 100));

                return (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col items-center gap-2 min-w-[32px] group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-[#0B0D10] border border-[#252B35] text-white px-2 py-1 rounded-lg text-[10px] whitespace-nowrap shadow-lg z-10 font-mono">
                      <span>{point.date}</span>
                      <span className="font-bold text-emerald-400">
                        {activeChartTab === 'revenue'
                          ? `$${Number(point.revenue || 0).toFixed(2)}`
                          : `${point.orders || 0} orders`}
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-[#101318] rounded-t-xl relative overflow-hidden flex items-end h-44">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          activeChartTab === 'revenue'
                            ? 'bg-emerald-500 hover:bg-emerald-400'
                            : 'bg-blue-500 hover:bg-blue-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Date label */}
                    <span className="text-[10px] text-[#707887] font-medium truncate max-w-[44px]">
                      {typeof point.date === 'string' ? point.date.slice(5) : point.date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Share */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Category Performance Distribution
          </h2>

          <div className="space-y-3 pt-2">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-[#707887] py-6 text-center">No categories recorded.</p>
            ) : (
              categoryStats.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#F5F7FA]">{cat.category}</span>
                    <div className="text-right">
                      <span className="font-black text-[#F5F7FA] mr-2">
                        ${Number(cat.revenue || 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#707887] font-bold">
                        ({cat.percentage || 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#101318] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, cat.percentage || 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top-Selling Products */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            Top-Selling Products by Revenue
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252B35] text-[#707887] uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5">Units Sold</th>
                  <th className="py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252B35]/40">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-[#707887]">
                      No sales for products in this range.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-[#1B2029]/50 transition">
                      <td className="py-2.5 flex items-center gap-2.5">
                        <img
                          src={
                            p.image ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                          }
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-[#252B35] bg-[#101318]"
                        />
                        <span className="font-bold text-[#F5F7FA] truncate max-w-[160px]">
                          {p.title}
                        </span>
                      </td>
                      <td className="py-2.5 text-[#A5ACB8] font-semibold">{p.totalUnits}</td>
                      <td className="py-2.5 text-right font-black text-[#F5F7FA]">
                        ${Number(p.totalRevenue || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
