import React from 'react';

export const Terms = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Terms and Conditions</h1>
    <p className="text-xs text-gray-400">Effective Date: October 2026</p>
    <div className="prose text-xs text-gray-600 leading-relaxed space-y-4">
      <p>
        Welcome to NovaShop. By accessing our platform, registering an account, or placing orders, you agree to be bound by these Terms of Service.
      </p>
      <h3 className="text-sm font-bold text-gray-900">1. Order Acceptance & Inventory</h3>
      <p>
        All orders placed through NovaShop are subject to product availability. We reserve the right to refuse or cancel orders due to pricing inaccuracies or unforeseen inventory shortages.
      </p>
      <h3 className="text-sm font-bold text-gray-900">2. Pricing and Payments</h3>
      <p>
        Prices displayed include applicable regional value-added or sales taxes as calculated at checkout. Accepted payment methods include Cash on Delivery, approved credit cards, and online payment gateways.
      </p>
      <h3 className="text-sm font-bold text-gray-900">3. Shipping & Delivery</h3>
      <p>
        Delivery dates are estimates provided in good faith. NovaShop cannot be held liable for third-party courier customs or transit delays.
      </p>
    </div>
  </div>
);

export const Privacy = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
    <p className="text-xs text-gray-400">Effective Date: October 2026</p>
    <div className="prose text-xs text-gray-600 leading-relaxed space-y-4">
      <p>
        At NovaShop, protecting your personal data and shopping privacy is our highest priority.
      </p>
      <h3 className="text-sm font-bold text-gray-900">1. Information We Collect</h3>
      <p>
        We collect personal credentials necessary to process purchases and deliveries, including your full name, email, phone number, and physical shipping address.
      </p>
      <h3 className="text-sm font-bold text-gray-900">2. Security Standards</h3>
      <p>
        All financial credentials and passwords are encrypted using industry-standard bcrypt and SSL 256-bit cryptography. We never sell your personal information to third parties.
      </p>
    </div>
  </div>
);
