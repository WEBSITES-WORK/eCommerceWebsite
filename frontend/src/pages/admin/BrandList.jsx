import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BrandList = () => {
  const { showToast } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    isActive: true,
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands?all=true');
      if (res.success) setBrands(res.data);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', logo: '', website: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingId(b._id);
    setFormData({
      name: b.name,
      description: b.description || '',
      logo: b.logo || '',
      website: b.website || '',
      isActive: b.isActive !== undefined ? b.isActive : true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, formData);
        showToast('Brand updated successfully!', 'success');
      } else {
        await api.post('/brands', formData);
        showToast('Brand created successfully!', 'success');
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) {
      showToast(err.message || 'Error saving brand', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      showToast('Brand deleted', 'info');
      fetchBrands();
    } catch (err) {
      showToast(err.message || 'Error deleting brand', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">Brand Directory</h1>
          <p className="text-xs text-[#707887]">Configure global partner labels, logos, and links</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(brands || []).map((b) => (
          <div
            key={b._id}
            className="p-5 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#353D4B] transition"
          >
            <div className="flex items-start gap-4">
              <img
                src={b.logo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                alt={b.name}
                className="w-16 h-16 rounded-xl object-cover border border-[#252B35] flex-shrink-0 bg-[#101318]"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-[#F5F7FA] truncate">{b.name}</h3>
                <p className="text-[10px] text-[#707887] font-mono">/{b.slug}</p>
                <p className="text-xs text-[#A5ACB8] line-clamp-2 mt-1">{b.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#252B35] flex items-center justify-between text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  b.isActive
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : 'bg-[#101318] text-[#707887] border border-[#252B35]'
                }`}
              >
                {b.isActive ? 'Active' : 'Disabled'}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 text-[#707887] hover:text-emerald-400 rounded-lg hover:bg-[#1B2029] transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b._id, b.name)}
                  className="p-1.5 text-[#707887] hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151922] border border-[#252B35] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#F5F7FA]">
                {editingId ? 'Edit Brand' : 'Create Brand'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#707887] hover:text-[#F5F7FA] transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#A5ACB8] block mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 text-[#F5F7FA] placeholder-[#707887]"
                />
              </div>

              <div>
                <label className="font-bold text-[#A5ACB8] block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brand overview"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 text-[#F5F7FA] placeholder-[#707887]"
                />
              </div>

              <div>
                <label className="font-bold text-[#A5ACB8] block mb-1">Logo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 text-[#F5F7FA] placeholder-[#707887]"
                />
              </div>

              <div>
                <label className="font-bold text-[#A5ACB8] block mb-1">Official Website</label>
                <input
                  type="url"
                  placeholder="https://brand.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 text-[#F5F7FA] placeholder-[#707887]"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
                />
                Active on Storefront
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

export default BrandList;
