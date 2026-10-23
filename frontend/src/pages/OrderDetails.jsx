import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Truck,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const getStatusVariant = (status) => {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'Cancelled':
    case 'Refunded':
      return 'danger';
    case 'Shipped':
    case 'Out for Delivery':
      return 'info';
    case 'Processing':
    case 'Packed':
    case 'Confirmed':
      return 'warning';
    default:
      return 'default';
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    try {
      setCancelling(true);
      const res = await api.patch(`/orders/${id}/cancel`, { reason: cancelReason });
      if (res.success && res.data) {
        showToast('Order cancelled successfully', 'info');
        setOrder(res.data);
        setShowCancelModal(false);
      }
    } catch (err) {
      showToast(err.message || 'Unable to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-44 bg-white rounded-2xl border border-gray-100" />
        <div className="h-72 bg-white rounded-2xl border border-gray-100" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="Order Not Found"
          description="We couldn't locate the order details requested. It may have been removed or entered incorrectly."
          actionText="Return to Orders"
          actionHref="/orders"
        />
      </div>
    );
  }

  const cancellableStatuses = ['Pending', 'Confirmed', 'Processing'];
  const canCancel = cancellableStatuses.includes(order.orderStatus);
  const statusVariant = getStatusVariant(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-2 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <Badge variant={statusVariant} size="sm">
              {order.orderStatus}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Visual Tracking Progress Bar */}
      <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-50">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            Live Shipment Tracking
          </h2>
          {order.trackingNumber && (
            <span className="text-xs text-gray-500">
              Carrier: <strong className="text-gray-900">{order.carrier}</strong> | Tracking:{' '}
              <strong className="font-mono text-emerald-700">{order.trackingNumber}</strong>
            </span>
          )}
        </div>

        <OrderTrackingTimeline
          currentStatus={order.orderStatus}
          statusHistory={order.statusHistory}
        />
      </div>

      {/* Order Items & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Items in this Shipment ({order.orderItems?.length})
          </h2>

          <div className="divide-y divide-gray-100">
            {order.orderItems?.map((item) => (
              <div key={item._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div>
                    <Link
                      to={`/products/${item.product}`}
                      className="font-bold text-gray-900 hover:text-emerald-600 line-clamp-1 transition"
                    >
                      {item.title}
                    </Link>
                    <p className="text-gray-400 mt-0.5">
                      ${item.price?.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>

                <span className="font-black text-gray-900 text-sm flex-shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-3 text-xs">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              Delivery Destination
            </h2>
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-sm">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-500">{order.shippingAddress?.phone}</p>
              <p className="text-gray-600 leading-relaxed">
                {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city},{' '}
                {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-3 text-xs">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              Payment Breakdown
            </h2>
            <div className="space-y-2 divide-y divide-gray-100">
              <div className="flex justify-between pt-1 text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">${order.itemsPrice?.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between pt-2 text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-gray-600">
                <span>Estimated Tax</span>
                <span className="font-semibold text-gray-900">${order.taxPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 text-base font-black text-gray-900">
                <span>Total</span>
                <span className="text-emerald-700">${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-500 flex justify-between border-t border-gray-100">
              <span>Payment: <strong>{order.paymentMethod}</strong></span>
              <span>Status: <strong className="text-emerald-600 font-bold">{order.paymentStatus}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              Cancel Order #{order.orderNumber}?
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to cancel this order? Once cancelled, all items will be immediately returned to active public store inventory.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Changed my mind, found another product..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Order
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  loading={cancelling}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
