import React from 'react';
import { ShieldCheck, Truck, Award, Users, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Our Brand Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Redefining E-Commerce through Trust, Speed, and Quality.
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Founded in 2024, NovaShop was built to bridge the gap between premium global electronics and authentic, hassle-free doorstep delivery. We partner directly with verified tier-1 hardware and lifestyle brands.
        </p>
      </div>

      {/* Visual Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">50,000+</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Orders Delivered</p>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">99.8%</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Satisfaction Rate</p>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">48h</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Average Delivery</p>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">24/7</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Concierge Support</p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">100% Genuine Guaranteed</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every product in our catalog comes sealed from certified brand distributors with active manufacturer warranties.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Carbon-Neutral Logistics</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            We partner with green logistics providers and use recyclable packaging materials to minimize our global footprint.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">30-Day Money-Back</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            If you aren't completely thrilled with your purchase, our zero-friction return process gives you an instant refund.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
