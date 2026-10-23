import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    freeShippingThreshold: 99,
    amountToFreeShipping: 99,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCoupon(null);
      setTotals({
        subtotal: 0,
        discountAmount: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
        freeShippingThreshold: 99,
        amountToFreeShipping: 99,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setCartItems(res.data.items || []);
        setCoupon(res.data.coupon || null);
        if (res.data.totals) {
          setTotals(res.data.totals);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1, selectedVariant = {}) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'info');
      return false;
    }

    try {
      const res = await api.post('/cart', {
        productId: product._id,
        quantity,
        selectedVariant,
      });

      if (res.success && res.data) {
        setCartItems(res.data.items);
        setCoupon(res.data.coupon);
        setTotals(res.data.totals);
        showToast(`Added "${product.title}" to your cart! 🛒`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to add item to cart', 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.success && res.data) {
        setCartItems(res.data.items);
        setCoupon(res.data.coupon);
        setTotals(res.data.totals);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.success && res.data) {
        setCartItems(res.data.items);
        setCoupon(res.data.coupon);
        setTotals(res.data.totals);
        showToast('Item removed from cart', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      if (res.success && res.data) {
        setCoupon(res.data.coupon);
        setTotals(res.data.totals);
        showToast(res.message, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Invalid coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await api.delete('/cart/coupon');
      if (res.success && res.data) {
        setCoupon(null);
        setTotals(res.data.totals);
        showToast('Coupon removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove coupon', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
      setCoupon(null);
      setTotals({
        subtotal: 0,
        discountAmount: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
        freeShippingThreshold: 99,
        amountToFreeShipping: 99,
      });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        totals,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
