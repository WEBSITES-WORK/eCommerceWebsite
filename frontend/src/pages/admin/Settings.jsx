import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Store, Truck, DollarSign, Bell } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: 'NovaShop',
    storeEmail: 'support@novashop.com',
    storePhone: '+1 (800) 555-0199',
    address: '100 Market Street, Suite 400, San Francisco, CA 94105',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 8.5,
    shippingFee: 15.0,
    freeShippingThreshold: 99.0,
    announcementBar: '✨ Free express shipping on all orders over $99! Use code NOVAFIRST for 15% off.',
    showAnnouncement: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        if (res.success && res.data) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/admin/settings', {
        ...formData,
        taxRate: Number(formData.taxRate),
        shippingFee: Number(formData.shippingFee),
        freeShippingThreshold: Number(formData.freeShippingThreshold),
      });

      if (res.success) {
        showToast('Website and store settings saved!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-[#707887]">Loading store settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">Website Configuration</h1>
        <p className="text-xs text-[#707887]">Configure store branding, checkout tax calculations, and shipping thresholds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Store Profile */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-500" />
            Store Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Support Email</label>
              <input
                type="email"
                required
                value={formData.storeEmail}
                onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.storePhone}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Business Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Shipping Logistics */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-500" />
            Taxes & Delivery Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Standard Shipping Fee ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.shippingFee}
                onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Free Shipping Min Order ($)</label>
              <input
                type="number"
                step="1"
                required
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" />
            Top Announcement Bar
          </h2>

          <div>
            <label className="font-bold text-[#A5ACB8] block mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={formData.announcementBar}
              onChange={(e) => setFormData({ ...formData, announcementBar: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA]"
            />
          </div>

          <label className="flex items-center gap-2 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.showAnnouncement}
              onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
            />
            Show announcement bar on top of website
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Website Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
