import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, KeyRound, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      setEmailSent(true);
      setCooldown(60);
      showToast('Password reset link sent! Check your inbox.', 'success');
    } catch (err) {
      showToast(err.message || 'Error requesting password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-emerald-600 font-semibold transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        <div className="space-y-1 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs text-stone-500">
            Enter your registered email and we'll send you a secure password reset link.
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-4 py-2 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Reset Link Sent</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                We have emailed a secure reset link to <strong>{email}</strong>. Open the link to set your new password.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              disabled={cooldown > 0}
              onClick={handleSubmit}
              loading={loading}
            >
              {cooldown > 0
                ? `Resend available in ${cooldown}s`
                : 'Resend Reset Link'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
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
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
