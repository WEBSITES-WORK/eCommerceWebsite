import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If Supabase is configured, check if we have a valid recovery session
    if (isSupabaseConfigured) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('[Auth]: Password recovery event acknowledged.');
        }
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // 1. Supabase Auth reset password
      if (isSupabaseConfigured) {
        await resetPassword(password);
        setSuccess(true);
        showToast('Password updated successfully!', 'success');
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      // 2. Fallback REST API
      if (token) {
        const res = await api.post(`/auth/reset-password/${token}`, { password });
        if (res.success) {
          setSuccess(true);
          showToast(res.message || 'Password reset successfully', 'success');
          setTimeout(() => navigate('/login'), 2500);
        }
      } else {
        throw new Error('Missing password reset token');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setErrorMessage(err.message || 'Password reset failed. Link may be expired.');
      showToast(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-stone-500">
            Create a strong, unique password for your NovaShop account.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Reset Error</p>
              <p className="text-[11px] leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Password Changed!</h2>
            <p className="text-xs text-stone-600">
              Your password has been successfully updated. Redirecting you to sign in...
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate('/login')}
              icon={ArrowRight}
            >
              Sign In Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">New Password (min 6 chars)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              icon={ArrowRight}
            >
              Update Password
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-stone-500 hover:text-emerald-600"
          >
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
