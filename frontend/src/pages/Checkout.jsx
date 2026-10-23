import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import api from '../services/api';

const steps = [
  { id: 1, name: 'Contact' },
  { id: 2, name: 'Address' },
  { id: 3, name: 'Delivery' },
  { id: 4, name: 'Payment' },
  { id: 5, name: 'Review' },
];

const Checkout = () => {
  const { cartItems, coupon, totals, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [deliveryMethod, setDeliveryMethod] = useState('Standard');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    cardName: user?.name || 'Sarah Connor',
    expDate: '12/28',
    cvv: '123',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const loadAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        if (res.success && res.data.length > 0) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            streetAddress: defaultAddr.streetAddress,
            apartment: defaultAddr.apartment || '',
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country,
          });
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    };

    loadAddresses();
  }, [isAuthenticated, navigate, user]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);

      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
          title: item.product.title,
          image: item.product.images?.[0] || '',
          price: item.price,
          quantity: item.quantity,
          sku: item.product.sku,
          selectedVariant: item.selectedVariant || {},
        })),
        shippingAddress,
        paymentMethod,
        couponCode: coupon?.code || null,
      };

      const res = await api.post('/orders', orderPayload);

      if (res.success && res.data) {
        showToast('Order successfully confirmed! 🎉', 'success');
        navigate('/order-success', { state: { order: res.data } });
      }
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products to your cart before proceeding to checkout."
        actionLabel="Browse Products"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between max-w-xl mx-auto pb-6 border-b border-slate-100">
        {steps.map((s, idx) => {
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          return (
            <div key={s.id} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-slate-900 text-white ring-2 ring-slate-900/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                {s.name}
              </span>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:inline ml-1" />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Body */}
        <div className="lg:col-span-2 space-y-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs">
          {/* STEP 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Customer Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-medium cursor-not-allowed text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary" size="md" onClick={() => setCurrentStep(2)}>
                  Continue to Shipping <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Shipping Address
              </h2>

              {addresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-semibold text-slate-500 block">Choose Saved Address:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((a) => (
                      <div
                        key={a._id}
                        onClick={() => handleSelectSavedAddress(a)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition ${
                          selectedAddressId === a._id
                            ? 'border-slate-900 bg-slate-50 text-slate-900 ring-2 ring-slate-900/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-bold">{a.fullName} ({a.addressType})</p>
                        <p className="text-slate-500 mt-0.5">{a.streetAddress}, {a.city}</p>
                        <p className="text-slate-500">{a.state} {a.postalCode}, {a.country}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2 text-xs">
                <span className="font-semibold text-slate-500 block">Delivery Address Details:</span>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Market St"
                    value={shippingAddress.streetAddress}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State / Region *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!shippingAddress.streetAddress || !shippingAddress.city}
                  onClick={() => setCurrentStep(3)}
                >
                  Continue to Delivery <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Method */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Delivery Options
              </h2>
              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryMethod('Standard')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    deliveryMethod === 'Standard'
                      ? 'border-slate-900 bg-slate-50 text-slate-900 ring-2 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">Standard Tracked Express (2-4 Business Days)</p>
                      <p className="text-[11px] text-slate-500">Includes real-time courier link and SMS notifications</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold">
                    {totals.shippingPrice === 0 ? 'FREE' : `$${totals.shippingPrice.toFixed(2)}`}
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setCurrentStep(4)}>
                  Continue to Payment <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Method */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Select Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 bg-slate-50 text-slate-900 ring-2 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-slate-500">Pay upon delivery at your doorstep</p>
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition ${
                    paymentMethod === 'Card'
                      ? 'border-slate-900 bg-slate-50 text-slate-900 ring-2 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold">Credit / Debit Card</p>
                        <p className="text-[11px] text-slate-500">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'Card' && (
                    <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Exp Date</label>
                        <input
                          type="text"
                          value={cardDetails.expDate}
                          onChange={(e) => setCardDetails({ ...cardDetails, expDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">CVC</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setCurrentStep(5)}>
                  Review Order <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Order Review */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5. Review & Confirm
              </h2>

              <div className="p-4 rounded-2xl bg-slate-50 text-xs space-y-1">
                <p className="font-bold text-slate-900">Destination:</p>
                <p className="text-slate-700">{shippingAddress.fullName} ({shippingAddress.phone})</p>
                <p className="text-slate-500">
                  {shippingAddress.streetAddress}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
                <p className="text-emerald-700 font-semibold pt-1">
                  Payment Method: {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item._id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt=""
                        className="w-9 h-9 object-cover rounded-lg border border-slate-100"
                      />
                      <span className="font-medium text-slate-800 line-clamp-1">{item.product?.title} × {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  loading={placingOrder}
                  icon={Lock}
                  onClick={handlePlaceOrder}
                >
                  Place Order (${totals.totalPrice.toFixed(2)})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Order Summary
            </h3>

            <div className="space-y-2 divide-y divide-stone-100">
              <div className="flex justify-between pt-1 text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between pt-2 text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-stone-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {totals.shippingPrice === 0 ? 'FREE' : `$${totals.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-stone-600">
                <span>Tax</span>
                <span className="font-semibold text-slate-900">${totals.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 text-base font-black text-slate-900">
                <span>Total</span>
                <span>${totals.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 text-[11px] text-stone-600 text-center flex items-center justify-center gap-1.5 font-medium shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Order</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
