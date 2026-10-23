import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Send,
  Heart,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to NovaShop newsletter! 🎉', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Truck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all orders over $99</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">100% Secure Checkout</h4>
              <p className="text-xs text-slate-400">256-Bit SSL Encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <RotateCcw className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">30 Days Return</h4>
              <p className="text-xs text-slate-400">Hassle-free guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Headphones className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Priority Support</h4>
              <p className="text-xs text-slate-400">Dedicated concierge desk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Nova<span className="text-emerald-400">Shop</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              NovaShop delivers verified genuine premium electronics, lifestyle fashion, athletic gear, and smart home appliances with guaranteed quality and swift door-step logistics.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <span className="text-xs font-semibold text-white block mb-2">
                Subscribe to get 15% off your next purchase:
              </span>
              <div className="flex max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-900 border border-slate-700 rounded-l-xl text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-r-xl transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/contact" className="hover:text-emerald-400 transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-400 transition">FAQ & Help Desk</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400 transition">Track Your Order</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition">Shipping Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/category/electronics" className="hover:text-emerald-400 transition">Electronics</Link></li>
              <li><Link to="/category/fashion" className="hover:text-emerald-400 transition">Fashion & Apparel</Link></li>
              <li><Link to="/category/home-living" className="hover:text-emerald-400 transition">Home & Living</Link></li>
              <li><Link to="/category/beauty" className="hover:text-emerald-400 transition">Beauty & Skincare</Link></li>
              <li><Link to="/category/sports" className="hover:text-emerald-400 transition">Sports & Fitness</Link></li>
            </ul>
          </div>

          {/* Corporate / Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-emerald-400 transition">About NovaShop</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link></li>
              <li><Link to="/admin/login" className="hover:text-emerald-400 transition">Merchant Portal</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Brands */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 NovaShop Inc. All rights reserved. Built with Node.js, Express, MongoDB, & React.</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Supported Payments:</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold text-[10px] border border-slate-800">VISA</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold text-[10px] border border-slate-800">Mastercard</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold text-[10px] border border-slate-800">PayPal</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold text-[10px] border border-slate-800">Apple Pay</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold text-[10px] border border-slate-800">Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
