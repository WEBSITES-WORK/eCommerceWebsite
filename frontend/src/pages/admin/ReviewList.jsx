import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/StarRating';

const ReviewList = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews');
      if (res.success && res.data) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApproval = async (id) => {
    try {
      const res = await api.patch(`/reviews/${id}/approval`);
      if (res.success) {
        showToast(res.message, 'success');
        fetchReviews();
      }
    } catch (err) {
      showToast(err.message || 'Error updating review', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.success) {
        showToast('Review removed', 'info');
        fetchReviews();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">Review Moderation</h1>
        <p className="text-xs text-[#707887]">Inspect verified shopper testimonials, ratings, and approval visibility</p>
      </div>

      <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B35] bg-[#101318]/90 text-[#707887] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#707887]">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#707887]">No customer reviews submitted yet.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-[#1B2029]/50 transition">
                    <td className="py-3 px-4 font-bold text-[#F5F7FA] max-w-[150px] truncate">
                      {r.product?.title || 'Unknown Product'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#F5F7FA]">{r.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-[#707887]">{r.user?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StarRating rating={r.rating} size="w-3.5 h-3.5" />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {r.title && <p className="font-bold text-[#F5F7FA] truncate">{r.title}</p>}
                      <p className="text-[#A5ACB8] line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4 text-[#707887]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.isApproved
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleApproval(r._id)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition ${
                            r.isApproved
                              ? 'text-amber-400 hover:bg-amber-950/40'
                              : 'text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                          title={r.isApproved ? 'Hide review' : 'Approve review'}
                        >
                          {r.isApproved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-[#707887] hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition"
                          title="Delete review"
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
    </div>
  );
};

export default ReviewList;
