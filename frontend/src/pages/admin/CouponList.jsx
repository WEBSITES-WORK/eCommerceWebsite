import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TicketPercent, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CouponList = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '15',
    minOrderAmount: '50',
    maxDiscountAmount: '50',
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    usageLimit: '500',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      if (res.success) setCoupons(res.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountAmount: '15',
      minOrderAmount: '50',
      maxDiscountAmount: '50',
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      usageLimit: '500',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c._id);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountAmount: String(c.discountAmount),
      minOrderAmount: String(c.minOrderAmount || 0),
      maxDiscountAmount: String(c.maxDiscountAmount || 0),
      expiryDate: new Date(c.expiryDate).toISOString().slice(0, 10),
      usageLimit: String(c.usageLimit || 100),
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountAmount: Number(formData.discountAmount),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: Number(formData.maxDiscountAmount),
        usageLimit: Number(formData.usageLimit),
      };

      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        showToast('Coupon updated successfully!', 'success');
      } else {
        await api.post('/coupons', payload);
        showToast('Coupon created successfully!', 'success');
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast(err.message || 'Error saving coupon', 'error');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast('Coupon removed', 'info');
      fetchCoupons();
    } catch (err) {
      showToast(err.message || 'Error deleting coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">Coupons & Discounts</h1>
          <p className="text-xs text-[#707887]">Configure promotional vouchers, thresholds, and limits</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B35] bg-[#101318]/90 text-[#707887] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Spend</th>
                <th className="py-3 px-4">Usage</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#707887]">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#707887]">No coupons active.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-[#1B2029]/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#F5F7FA]">
                      <span className="px-2.5 py-1 rounded-lg bg-[#101318] text-emerald-400 border border-emerald-900/60 font-mono">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-[#A5ACB8]">{c.discountType}</td>
                    <td className="py-3 px-4 font-black text-[#F5F7FA]">
                      {c.discountType === 'percentage' ? `${c.discountAmount}%` : `$${c.discountAmount}`}
                    </td>
                    <td className="py-3 px-4 text-[#A5ACB8]">${c.minOrderAmount}</td>
                    <td className="py-3 px-4 text-[#A5ACB8]">
                      {c.usedCount} / {c.usageLimit}
                    </td>
                    <td className="py-3 px-4 text-[#707887]">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.isActive
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : 'bg-[#101318] text-[#707887] border border-[#252B35]'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-[#707887] hover:text-emerald-400 rounded-lg hover:bg-[#1B2029] transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          className="p-1.5 text-[#707887] hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151922] border border-[#252B35] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#F5F7FA]">
                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#707887] hover:text-[#F5F7FA] transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#A5ACB8] block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-mono font-bold text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] focus:border-emerald-500"
                  >
                    <option value="percentage" className="bg-[#101318]">Percentage (%)</option>
                    <option value="fixed" className="bg-[#101318]">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-bold text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Min Order Amount ($)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Max Cap Amount ($)</label>
                  <input
                    type="number"
                    placeholder="50 (0 for no cap)"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] focus:border-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
                />
                Active Coupon
              </label>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#252B35] bg-[#101318] text-[#A5ACB8] hover:text-[#F5F7FA] hover:bg-[#1B2029] rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
