import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  Users,
  Star,
  TicketPercent,
  Warehouse,
  BarChart3,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const navItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Categories', path: '/admin/categories', icon: Layers },
  { label: 'Brands', path: '/admin/brands', icon: Tag },
  { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  { label: 'Customers', path: '/admin/users', icon: Users },
  { label: 'Reviews', path: '/admin/reviews', icon: Star },
  { label: 'Coupons', path: '/admin/coupons', icon: TicketPercent },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.success && res.data) {
          setUnreadNotifs(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Silently catch background errors
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const currentTitle =
    navItems.find((n) =>
      n.path === '/admin'
        ? location.pathname === '/admin'
        : location.pathname.startsWith(n.path)
    )?.label || 'Control Center';

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] font-sans flex flex-col md:flex-row antialiased admin-dark selection:bg-emerald-500 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#101318] border-r border-[#252B35] flex flex-col justify-between z-50 transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 border-b border-[#252B35] flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                N
              </div>
              <div>
                <span className="font-bold text-[#F5F7FA] text-sm tracking-tight">NovaShop</span>
                <span className="block text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Admin OS
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#707887] hover:text-[#F5F7FA] p-1 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/25 font-semibold'
                      : 'text-[#A5ACB8] hover:bg-[#1B2029] hover:text-[#F5F7FA]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-[#707887]'}`} />
                    <span>{item.label}</span>
                  </span>

                  {item.label === 'Notifications' && unreadNotifs > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-600 text-white">
                      {unreadNotifs}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Storefront link & Profile */}
        <div className="p-3.5 border-t border-[#252B35] space-y-2 bg-[#0E1116]">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#A5ACB8] hover:bg-[#1B2029] hover:text-[#F5F7FA] transition border border-transparent hover:border-[#252B35]"
          >
            <span className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              Customer Storefront
            </span>
            <ExternalLink className="w-3 h-3 text-[#707887]" />
          </Link>

          <div className="pt-2 flex items-center justify-between border-t border-[#252B35]/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#F5F7FA] truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-[#707887] truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="p-1.5 text-[#707887] hover:text-rose-400 rounded-lg hover:bg-[#1B2029] transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0D10]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#101318]/90 backdrop-blur-md border-b border-[#252B35] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#A5ACB8] hover:bg-[#1B2029]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[#F5F7FA] tracking-tight">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/notifications"
              className="relative p-2 text-[#A5ACB8] hover:text-[#F5F7FA] rounded-xl hover:bg-[#1B2029] transition border border-transparent hover:border-[#252B35]"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#101318]" />
              )}
            </Link>

            <Link
              to="/admin/products/create"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              + Add Product
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 bg-[#0B0D10] text-[#F5F7FA]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
