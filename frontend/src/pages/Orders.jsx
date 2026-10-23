import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Sign in to View Your Orders"
          description="Log in with your NovaShop credentials to review purchase history, track active parcels, and download invoices."
          actionText="Sign In"
          actionHref="/login?redirect=/orders"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-16 bg-gray-50 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Placed Yet"
          description="You haven't completed any purchases with NovaShop yet. Explore our featured collections to find premium products!"
          actionText="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review recent transactions, track live shipments, and request support
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusVariant = getStatusVariant(order.orderStatus);

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-sm hover:border-gray-200 transition-all p-5 sm:p-6 space-y-4"
            >
              {/* Header row: Order #, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-gray-100 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="text-sm font-extrabold text-gray-900 font-mono">
                    {order.orderNumber}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <Badge variant={statusVariant} size="sm">
                    {order.orderStatus}
                  </Badge>
                </div>
              </div>

              {/* Items row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.orderItems?.map((item) => (
                    <img
                      key={item._id}
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={item.title}
                      title={item.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                    />
                  ))}
                  <div className="text-xs text-gray-600 font-medium pl-2 whitespace-nowrap">
                    {order.orderItems?.length} {order.orderItems?.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <span className="text-base font-black text-gray-900">
                      ${order.totalPrice?.toFixed(2)}
                    </span>
                  </div>

                  <Link to={`/orders/${order._id}`}>
                    <Button variant="secondary" size="sm" icon={Eye}>
                      Details & Tracking
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
