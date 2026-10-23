import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  TicketPercent,
  Check,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const Cart = () => {
  const {
    cartItems,
    coupon,
    totals,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    const success = await applyCoupon(couponCode.trim());
    if (success) setCouponCode('');
    setApplying(false);
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Cart is Waiting"
        description="Sign in to your account to view your cart items, apply discount coupons, and proceed to checkout."
        actionLabel="Sign In"
        actionLink="/login"
      />
    );
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Shopping Cart is Empty"
        description="Explore our curated catalog of consumer electronics, lifestyle footwear, and home living hardware."
        actionLabel="Discover Products"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
        Shopping Bag ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
      </h1>

      {/* Free Shipping Alert Banner */}
      {totals.amountToFreeShipping > 0 ? (
        <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Add <strong className="font-bold text-slate-900">${totals.amountToFreeShipping.toFixed(2)}</strong> more to your order for <strong>Free Express Shipping</strong>.
            </span>
          </div>
          <Link to="/products" className="font-bold underline hidden sm:inline text-slate-900">
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center gap-2 text-xs font-bold border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600" />
          You have unlocked Free Express Shipping!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center gap-4 transition hover:border-slate-200"
              >
                <Link
                  to={`/products/${product._id}`}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100"
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 line-clamp-1"
                  >
                    {product.title}
                  </Link>

                  {item.selectedVariant && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {typeof item.selectedVariant === 'object' &&
                        Object.entries(item.selectedVariant).map(([k, v]) => (
                          <span key={k} className="mr-2">
                            {k}: <strong className="text-slate-600 font-medium">{v}</strong>
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="text-xs font-bold text-slate-900 mt-1.5">
                    ${item.price?.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-black text-xs sm:text-sm text-slate-900 w-16 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <div>
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <TicketPercent className="w-4 h-4 text-emerald-600" />
                    <span>Coupon: {coupon.code}</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. NOVAFIRST)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 uppercase font-semibold"
                  />
                  <Button variant="primary" size="sm" loading={applying}>
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Price lines */}
            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 pt-2.5 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 pt-2.5">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {totals.shippingPrice === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">Free</span>
                  ) : (
                    `$${totals.shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 pt-2.5">
                <span>Estimated Sales Tax</span>
                <span className="font-semibold text-slate-900">${totals.taxPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-3">
                <span>Total Amount</span>
                <span>${totals.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={ArrowRight}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5 font-medium shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted & Verified Safe Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
