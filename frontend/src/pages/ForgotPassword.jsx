import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenReceived, setTokenReceived] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        showToast(res.message, 'success');
        if (res.data?.resetToken) {
          setTokenReceived(res.data.resetToken);
        }
      }
    } catch (err) {
      showToast(err.message || 'Error requesting password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        <div className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-xs text-gray-500">
            Enter your registered email and we'll generate a secure reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md transition"
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        {tokenReceived && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <p className="font-bold text-emerald-900">Simulated Reset Token Ready:</p>
            <p className="font-mono text-[11px] text-gray-700 bg-white p-2 rounded-lg break-all">
              {tokenReceived}
            </p>
            <Link
              to={`/reset-password/${tokenReceived}`}
              className="inline-block font-bold text-emerald-700 underline"
            >
              Click here to proceed with resetting password →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
