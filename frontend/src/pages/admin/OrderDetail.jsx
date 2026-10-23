import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Truck,
  Package,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  User,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import OrderTrackingTimeline from '../../components/OrderTrackingTimeline';

const OrderDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status update states
  const [newStatus, setNewStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        const o = res.data;
        setOrder(o);
        setNewStatus(o.orderStatus);
        setCarrier(o.carrier || 'FedEx Express');
        setTrackingNumber(o.trackingNumber || '');
        setPaymentStatus(o.paymentStatus);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await api.put(`/orders/${id}/status`, {
        status: newStatus,
        carrier,
        trackingNumber,
        note,
        paymentStatus,
      });

      if (res.success && res.data) {
        showToast('Order fulfillment & status updated successfully!', 'success');
        setOrder(res.data);
        setNote('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#707887]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-3" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center bg-[#151922] border border-[#252B35] rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#F5F7FA]">Order Not Found</h2>
        <p className="text-xs text-[#A5ACB8] mt-1 mb-4">
          The requested order ID does not exist or has been deleted.
        </p>
        <Link
          to="/admin/orders"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2.5 text-[#A5ACB8] hover:text-[#F5F7FA] bg-[#151922] border border-[#252B35] hover:bg-[#1B2029] rounded-xl transition shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight font-mono">
                {order.orderNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-[#707887] mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-bold text-[#707887] tracking-wider block">
            Order Total
          </span>
          <span className="text-2xl font-black text-[#F5F7FA]">
            ${order.totalPrice?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Visual Tracking Progress Stepper */}
      <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Live Fulfillment Stepper
        </h2>
        <OrderTrackingTimeline
          currentStatus={order.orderStatus}
          statusHistory={order.statusHistory || []}
          dark={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Products & Status Updater */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Control Console */}
          <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              Update Fulfillment & Dispatch
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Fulfillment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-bold text-[#F5F7FA] focus:border-emerald-500 transition"
                  >
                    <option value="Pending" className="bg-[#101318] text-[#F5F7FA]">Pending</option>
                    <option value="Confirmed" className="bg-[#101318] text-[#F5F7FA]">Confirmed</option>
                    <option value="Processing" className="bg-[#101318] text-[#F5F7FA]">Processing</option>
                    <option value="Packed" className="bg-[#101318] text-[#F5F7FA]">Packed</option>
                    <option value="Shipped" className="bg-[#101318] text-[#F5F7FA]">Shipped</option>
                    <option value="Out for Delivery" className="bg-[#101318] text-[#F5F7FA]">Out for Delivery</option>
                    <option value="Delivered" className="bg-[#101318] text-[#F5F7FA]">Delivered (Auto-marks Paid)</option>
                    <option value="Cancelled" className="bg-[#101318] text-[#F5F7FA]">Cancelled (Restores Stock)</option>
                    <option value="Refunded" className="bg-[#101318] text-[#F5F7FA]">Refunded (Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-bold text-[#F5F7FA] focus:border-emerald-500 transition"
                  >
                    <option value="Pending" className="bg-[#101318] text-[#F5F7FA]">Pending</option>
                    <option value="Completed" className="bg-[#101318] text-[#F5F7FA]">Completed / Paid</option>
                    <option value="Failed" className="bg-[#101318] text-[#F5F7FA]">Failed</option>
                    <option value="Refunded" className="bg-[#101318] text-[#F5F7FA]">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Courier / Carrier</label>
                  <input
                    type="text"
                    placeholder="e.g. FedEx Express, DHL, UPS"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-medium text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#A5ACB8] block mb-1">Tracking Code / AWB</label>
                  <input
                    type="text"
                    placeholder="e.g. TRK-892348102"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-mono text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#A5ACB8] block mb-1">Status Note / Customer Update</label>
                <input
                  type="text"
                  placeholder="e.g. Handed over to courier driver for express transit."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#101318] border border-[#252B35] rounded-xl outline-none font-medium text-[#F5F7FA] placeholder-[#707887] focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {updating ? 'Saving Changes...' : 'Save & Push Updates'}
                </button>
              </div>
            </form>
          </div>

          {/* Ordered Products Itemization */}
          <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              Products in Order ({order.orderItems?.length})
            </h2>

            <div className="divide-y divide-[#252B35]">
              {order.orderItems?.map((item, idx) => (
                <div key={item._id || idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                      }
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl border border-[#252B35] flex-shrink-0 bg-[#101318]"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#F5F7FA] truncate text-xs">{item.title}</p>
                      <p className="text-[11px] text-[#A5ACB8]">
                        Qty: {item.quantity} × ${item.price?.toFixed(2)}
                      </p>
                      {item.variant && (
                        <p className="text-[10px] text-[#707887]">Variant: {item.variant}</p>
                      )}
                    </div>
                  </div>

                  <span className="font-black text-[#F5F7FA] text-xs flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Customer, Shipping, Financial Summary */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              Customer Profile
            </h2>
            <div className="text-xs space-y-1.5">
              <p className="font-bold text-[#F5F7FA] text-sm">
                {shipping.fullName || order.user?.name || 'Customer'}
              </p>
              <p className="text-[#A5ACB8] font-medium">{order.user?.email}</p>
              <p className="text-[#707887] font-medium">{shipping.phone || 'No phone provided'}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Shipping Address
            </h2>
            <div className="text-xs space-y-1 text-[#A5ACB8] font-medium leading-relaxed">
              <p className="font-bold text-[#F5F7FA]">{shipping.streetAddress || shipping.addressLine1}</p>
              {shipping.apartment && <p>{shipping.apartment}</p>}
              <p>
                {shipping.city}, {shipping.state} {shipping.postalCode || shipping.zipCode}
              </p>
              <p className="font-semibold text-[#F5F7FA]">{shipping.country || 'United States'}</p>
            </div>
          </div>

          {/* Payment & Financial Breakdown */}
          <div className="p-6 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Financial Breakdown
            </h2>

            <div className="space-y-2 text-xs divide-y divide-[#252B35]">
              <div className="flex justify-between py-1 text-[#A5ACB8]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#F5F7FA]">${order.itemsPrice?.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-[#A5ACB8]">
                <span>Shipping Cost</span>
                <span className="font-bold text-[#F5F7FA]">
                  {order.shippingPrice > 0 ? `$${order.shippingPrice.toFixed(2)}` : 'FREE'}
                </span>
              </div>

              <div className="flex justify-between py-1 text-[#A5ACB8]">
                <span>Estimated Tax</span>
                <span className="font-bold text-[#F5F7FA]">${order.taxPrice?.toFixed(2)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between py-1 text-emerald-400 font-bold">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 text-[#F5F7FA] font-black text-sm">
                <span>Grand Total</span>
                <span>${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#252B35] text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#707887]">Payment Gateway:</span>
                <span className="font-bold text-[#A5ACB8] capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707887]">Payment Status:</span>
                <span className="font-bold text-emerald-400">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
