import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  ShoppingCart,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

const Login = () => {
  const { login, resendVerification } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Unverified email handling
  const [unverifiedState, setUnverifiedState] = useState({
    isUnverified: false,
    email: '',
  });
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedState({ isUnverified: false, email: '' });

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      if (err.isUnverified) {
        setUnverifiedState({
          isUnverified: true,
          email: err.email || email,
        });
        showToast('Please verify your email before signing in.', 'warning');
      } else {
        showToast(err.message || 'Invalid email or password', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedState.email || email;
    if (!targetEmail) return;

    try {
      setResending(true);
      await resendVerification(targetEmail);
      showToast('Verification email sent! Please check your inbox.', 'success');
      setResendCooldown(60);
    } catch (err) {
      showToast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Nova<span className="text-emerald-600">Shop</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Sign in to your account to continue shopping
          </p>
        </div>

        {/* Unverified Email Warning Box */}
        {unverifiedState.isUnverified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">Email Verification Required</strong>
                <span className="text-amber-800 text-[11px] leading-relaxed">
                  Your email address has not been verified yet. Check your inbox for the activation link or request a new one below.
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              loading={resending}
              disabled={resendCooldown > 0}
              icon={RefreshCw}
              onClick={handleResendVerification}
            >
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Resend Verification Email'}
            </Button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white text-xs font-medium transition"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-emerald-600 hover:text-emerald-700 font-bold transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white text-xs font-medium transition"
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
            Sign In
          </Button>
        </form>


        {/* Register footer link */}
        <div className="text-center text-xs text-stone-500 pt-1">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
