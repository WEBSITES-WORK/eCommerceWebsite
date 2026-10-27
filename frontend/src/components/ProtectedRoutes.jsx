import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CustomerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#707887]">Verifying security privileges...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated user -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Blocked user -> deny access
  if (user.isBlocked) {
    return (
      <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#151922] border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-800/40 text-rose-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-rose-400">Administrative Access Suspended</h2>
          <p className="text-xs text-[#707887]">Your account has been deactivated or blocked from accessing the administration console.</p>
          <a href="/" className="inline-block px-5 py-2.5 bg-[#1B2029] hover:bg-[#252B35] text-[#F5F7FA] text-xs font-semibold rounded-xl border border-[#252B35] transition">
            Return to Storefront
          </a>
        </div>
      </div>
    );
  }

  // 3. Customer role -> redirect to normal customer area
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4. Role = admin -> allow admin dashboard
  return children;
};
