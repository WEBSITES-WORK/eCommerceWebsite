import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resendVerification } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'already_verified'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // 1. Check if Supabase client is configured
      if (!isSupabaseConfigured) {
        // Fallback or demo state
        setStatus('success');
        return;
      }

      try {
        // 2. Check for PKCE exchange code in query string (?code=xyz)
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus('success');
          showToast('Email verified successfully! Welcome to NovaShop.', 'success');
          return;
        }

        // 3. Check for token_hash and type (?token_hash=xyz&type=signup)
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'signup';

        if (token_hash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type });
          if (error) throw error;
          setStatus('success');
          showToast('Email verified successfully!', 'success');
          return;
        }

        // 4. Check URL hash for implicit tokens (#access_token=xyz&type=signup)
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type='))) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) {
            setStatus('success');
            showToast('Email verified successfully!', 'success');
            return;
          }
        }

        // 5. Check if user already has an active verified session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          setStatus('already_verified');
          return;
        }

        // 6. If no recognizable tokens were found
        setStatus('error');
        setErrorMessage(
          'No valid verification token was detected in the URL. The link may be incomplete or already processed.'
        );
      } catch (err) {
        console.error('Confirmation error:', err);
        setStatus('error');
        setErrorMessage(
          err.message || 'The verification link is invalid or has expired. Please request a new one below.'
        );
      }
    };

    handleEmailConfirmation();
  }, [searchParams, showToast]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    try {
      setResending(true);
      await resendVerification(resendEmail.trim());
      showToast('Verification email sent! Please check your inbox.', 'success');
      setResendCooldown(60);
    } catch (err) {
      showToast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6 text-center">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/25">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Nova<span className="text-emerald-600">Shop</span>
          </span>
        </Link>

        {/* State 1: Verifying */}
        {status === 'verifying' && (
          <div className="space-y-4 py-6">
            <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">Verifying Your Email</h1>
            <p className="text-xs text-stone-500">
              Please wait a moment while we confirm your credentials with Supabase Auth...
            </p>
          </div>
        )}

        {/* State 2: Success */}
        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Email Verified Successfully!
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your email address has been verified. You now have full access to orders, wishlist, saved addresses, and express checkout.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={ArrowRight}
                onClick={() => navigate('/')}
              >
                Start Shopping
              </Button>
              <Link
                to="/profile"
                className="text-xs font-semibold text-stone-500 hover:text-emerald-600 pt-2"
              >
                Go to My Account Settings
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Already Verified */}
        {status === 'already_verified' && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Account Already Verified</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your email is already confirmed and active. You are ready to shop.
            </p>
            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={ArrowRight}
                onClick={() => navigate('/')}
              >
                Continue to Store
              </Button>
            </div>
          </div>
        )}

        {/* State 4: Error / Expired */}
        {status === 'error' && (
          <div className="space-y-5 text-left">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verification Link Issue</h1>
              <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Request a New Verification Email
              </h2>
              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  loading={resending}
                  disabled={resendCooldown > 0}
                  icon={RefreshCw}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Verification Email'}
                </Button>
              </form>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthConfirm;
