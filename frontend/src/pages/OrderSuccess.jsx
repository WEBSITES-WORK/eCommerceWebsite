import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Truck } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Order Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          We've received your order and are dispatching the package. A confirmation email and notification have been sent.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <span className="text-xs text-gray-400">Order Number</span>
            <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Total Paid</span>
            <p className="text-sm font-black text-emerald-600">${order.totalPrice?.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Payment Status</span>
            <p className="text-sm font-bold text-gray-900">{order.paymentStatus}</p>
          </div>
        </div>

        {/* Shipping summary */}
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-bold text-gray-900">Delivery Address:</p>
          <p>{order.shippingAddress?.fullName} ({order.shippingAddress?.phone})</p>
          <p>
            {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city},{' '}
            {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
          </p>
        </div>

        {/* Order items brief */}
        <div className="pt-2 divide-y divide-gray-50">
          {order.orderItems?.map((item) => (
            <div key={item._id} className="py-2 flex items-center justify-between text-xs">
              <span className="text-gray-800 font-medium">{item.title} × {item.quantity}</span>
              <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to={`/orders/${order._id}`}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Truck className="w-4 h-4" />
          Track Order Live
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
