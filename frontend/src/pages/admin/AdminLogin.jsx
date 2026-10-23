import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@ecommerce.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role !== 'admin') {
        showToast('Access denied. Administrator privileges required.', 'error');
        return;
      }
      navigate('/admin');
    } catch (err) {
      showToast(err.message || 'Admin authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#151922] border border-[#252B35] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#F5F7FA]">Merchant Admin Console</h1>
          <p className="text-xs text-[#707887]">Secure entry for authorized store administrators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#A5ACB8] block mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl text-[#F5F7FA] placeholder-[#707887] outline-none focus:border-emerald-500 font-medium"
              />
              <Mail className="w-4 h-4 text-[#707887] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#A5ACB8] block mb-1">Master Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl text-[#F5F7FA] placeholder-[#707887] outline-none focus:border-emerald-500 font-medium"
              />
              <Lock className="w-4 h-4 text-[#707887] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-[#707887] hover:text-[#A5ACB8] transition">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
