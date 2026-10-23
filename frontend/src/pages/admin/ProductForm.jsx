import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Upload, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploader from '../../components/ImageUploader';

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    lowStockThreshold: '5',
    category: '',
    brand: '',
    images: [],
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    isActive: true,
    specifications: [{ key: '', value: '' }],
    variants: [{ name: 'Color', options: ['Black', 'White'] }],
    tags: '',
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories?all=true'),
          api.get('/brands?all=true'),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);

        if (isEdit) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.success && prodRes.data) {
            const p = prodRes.data;
            setFormData({
              title: p.title || '',
              sku: p.sku || '',
              description: p.description || '',
              price: String(p.price || ''),
              discountPrice: String(p.discountPrice || ''),
              stock: String(p.stock || ''),
              lowStockThreshold: String(p.lowStockThreshold || '5'),
              category: p.category?._id || p.category || '',
              brand: p.brand?._id || p.brand || '',
              images: Array.isArray(p.images) ? p.images : [],
              isFeatured: !!p.isFeatured,
              isBestseller: !!p.isBestseller,
              isNewArrival: !!p.isNewArrival,
              isActive: p.isActive !== undefined ? !!p.isActive : true,
              specifications: p.specifications?.length > 0 ? p.specifications : [{ key: '', value: '' }],
              variants: p.variants?.length > 0 ? p.variants : [],
              tags: p.tags?.join(', ') || '',
            });
          }
        } else if (catRes.data?.length > 0 && brandRes.data?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: catRes.data[0]._id,
            brand: brandRes.data[0]._id,
          }));
        }
      } catch (err) {
        console.error('Failed to initialize form:', err);
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, isEdit]);

  const handleImageChange = (index, val) => {
    const updated = [...formData.images];
    updated[index] = val;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated.length > 0 ? updated : [''] });
  };

  // Spec handlers
  const handleSpecChange = (index, field, val) => {
    const updated = [...formData.specifications];
    updated[index][field] = val;
    setFormData({ ...formData, specifications: updated });
  };

  const addSpec = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }],
    });
  };

  const removeSpec = (index) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        images: formData.images.filter((img) => img && typeof img === 'string' && img.trim().length > 0),
        specifications: formData.specifications.filter((s) => s.key && s.value),
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      };

      if (!payload.images || payload.images.length === 0) {
        showToast('Please upload at least one product image before saving', 'error');
        setLoading(false);
        return;
      }

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created successfully!', 'success');
      }

      navigate('/admin/products');
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-[#707887]">Loading product editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/admin/products"
          className="p-2 text-[#A5ACB8] hover:text-[#F5F7FA] rounded-xl hover:bg-[#151922] transition border border-transparent hover:border-[#252B35]"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">
          {isEdit ? 'Edit Product' : 'Create New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Info */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA] placeholder-[#707887]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                placeholder="e.g. SONY-WH5-BLK"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-mono text-[#F5F7FA] placeholder-[#707887]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#A5ACB8] block mb-1">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe craftsmanship, acoustic fidelity, ergonomics..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-medium text-[#F5F7FA] placeholder-[#707887]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] focus:border-emerald-500"
              >
                <option value="" className="bg-[#101318] text-[#707887]">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#101318] text-[#F5F7FA]">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Brand *</label>
              <select
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] focus:border-emerald-500"
              >
                <option value="" className="bg-[#101318] text-[#707887]">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id} className="bg-[#101318] text-[#F5F7FA]">{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Base Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="299.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Discount Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="249.99"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-400 placeholder-[#707887]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                placeholder="25"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-[#F5F7FA]"
              />
            </div>

            <div>
              <label className="font-bold text-[#A5ACB8] block mb-1">Low Stock Alert</label>
              <input
                type="number"
                placeholder="5"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none focus:border-emerald-500 font-bold text-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Product Image Gallery Upload & Management */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <ImageUploader
            images={formData.images}
            onChange={(updatedImages) => setFormData({ ...formData, images: updatedImages })}
            maxImages={8}
            dark={true}
          />
        </div>

        {/* Technical Specifications */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
              Specifications
            </h2>
            <button
              type="button"
              onClick={addSpec}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Specification
            </button>
          </div>

          <div className="space-y-2">
            {formData.specifications.map((spec, i) => (
              <div key={i} className="grid grid-cols-7 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key (e.g. Battery Life)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                  className="col-span-3 px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 30 Hours)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                  className="col-span-3 px-3 py-2 bg-[#101318] border border-[#252B35] rounded-xl outline-none text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(i)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl justify-self-center transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            Badges & Display Status
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
              />
              Featured Product
            </label>

            <label className="flex items-center gap-2 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestseller}
                onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
              />
              Bestseller Badge
            </label>

            <label className="flex items-center gap-2 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
              />
              New Arrival
            </label>

            <label className="flex items-center gap-2 font-bold text-[#A5ACB8] hover:text-[#F5F7FA] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 bg-[#101318] border-[#252B35]"
              />
              Active on Storefront
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 border border-[#252B35] bg-[#101318] text-[#A5ACB8] hover:text-[#F5F7FA] hover:bg-[#1B2029] font-bold rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
