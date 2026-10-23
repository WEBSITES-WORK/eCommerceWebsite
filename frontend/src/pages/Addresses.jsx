import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2, CheckCircle2, ChevronLeft, Building, Home, MapPinned } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const Addresses = () => {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    addressType: 'Home',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/addresses');
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/addresses', formData);
      if (res.success) {
        showToast('Address added successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          fullName: '',
          phone: '',
          streetAddress: '',
          apartment: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          addressType: 'Home',
          isDefault: false,
        });
        fetchAddresses();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add address', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.delete(`/addresses/${id}`);
      if (res.success) {
        showToast('Address removed', 'info');
        fetchAddresses();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove address', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.patch(`/addresses/${id}/default`);
      if (res.success) {
        showToast('Default address updated', 'success');
        fetchAddresses();
      }
    } catch (err) {
      showToast(err.message || 'Failed to set default', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-2 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Profile
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Address Book
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage multiple delivery destinations and default locations
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="sm"
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          <div className="h-44 bg-white rounded-2xl border border-gray-100" />
          <div className="h-44 bg-white rounded-2xl border border-gray-100" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Saved Addresses"
          description="Add your primary shipping destination for quicker, one-click checkout on future orders."
          actionText="Add Shipping Address"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a._id}
              className={`p-5 sm:p-6 rounded-2xl bg-white border transition shadow-2xs space-y-3 ${
                a.isDefault ? 'border-emerald-600 ring-2 ring-emerald-500/15' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge variant={a.isDefault ? 'success' : 'default'} size="xs">
                  {a.addressType}
                </Badge>
                {a.isDefault && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-extrabold text-gray-900 text-sm">{a.fullName}</p>
                <p className="text-gray-500">{a.phone}</p>
                <p className="text-gray-600 leading-relaxed">
                  {a.streetAddress} {a.apartment}
                </p>
                <p className="text-gray-600">
                  {a.city}, {a.state} {a.postalCode}
                </p>
                <p className="text-gray-400">{a.country}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                {!a.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(a._id)}
                    className="text-gray-500 hover:text-emerald-600 font-bold transition"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => handleDeleteAddress(a._id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-base font-extrabold text-gray-900">Add New Shipping Address</h2>

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street and house number"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Address Label</label>
                  <select
                    value={formData.addressType}
                    onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                >
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
