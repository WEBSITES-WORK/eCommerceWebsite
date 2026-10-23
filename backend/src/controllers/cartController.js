const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');

// Helper to compute cart totals
const computeTotals = async (cart, userId) => {
  let subtotal = 0;
  for (const item of cart.items) {
    if (item.product) {
      const unitPrice =
        item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      subtotal += unitPrice * item.quantity;
    }
  }

  // Get store settings
  let settings = await Setting.findOne();
  if (!settings) {
    settings = { taxRate: 8.5, shippingFee: 15.0, freeShippingThreshold: 99.0 };
  }

  let discountAmount = 0;
  let appliedCoupon = null;

  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon) {
      const validation = coupon.isValid(userId, subtotal);
      if (validation.valid) {
        discountAmount =
          validation.discount !== undefined
            ? validation.discount
            : typeof coupon.calculateDiscount === 'function'
            ? coupon.calculateDiscount(subtotal)
            : 0;
        appliedCoupon = {
          _id: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountAmount: coupon.discountAmount,
          computedDiscount: discountAmount,
        };
      } else {
        // Coupon became invalid (e.g. min order no longer met)
        cart.coupon = null;
        await cart.save();
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxPrice = Number(((taxableAmount * settings.taxRate) / 100).toFixed(2));

  let shippingPrice = 0;
  if (subtotal > 0) {
    shippingPrice =
      subtotal >= settings.freeShippingThreshold ? 0 : Number(settings.shippingFee.toFixed(2));
  }

  const totalPrice = Number((taxableAmount + taxPrice + shippingPrice).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxPrice,
    shippingPrice,
    totalPrice,
    appliedCoupon,
    freeShippingThreshold: settings.freeShippingThreshold,
    amountToFreeShipping: Math.max(0, Number((settings.freeShippingThreshold - subtotal).toFixed(2))),
  };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price discountPrice stock images isActive sku',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product may have been deleted
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const totals = await computeTotals(cart, req.user._id);

    res.json({
      success: true,
      data: {
        _id: cart._id,
        items: cart.items,
        coupon: totals.appliedCoupon,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, selectedVariant = {} } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items in stock for this product`,
      });
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product with identical variant exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Total in cart would exceed available stock (${product.stock})`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = price;
      if (selectedVariant) {
        cart.items[existingIndex].selectedVariant = selectedVariant;
      }
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price,
        selectedVariant: selectedVariant || {},
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'title slug price discountPrice stock images isActive sku',
    });

    const totals = await computeTotals(cart, req.user._id);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        _id: cart._id,
        items: cart.items,
        coupon: totals.appliedCoupon,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price discountPrice stock images isActive sku',
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = cart.items[itemIndex].product;
      if (product && qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }
      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();
    const totals = await computeTotals(cart, req.user._id);

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        _id: cart._id,
        items: cart.items,
        coupon: totals.appliedCoupon,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price discountPrice stock images isActive sku',
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    const totals = await computeTotals(cart, req.user._id);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        _id: cart._id,
        items: cart.items,
        coupon: totals.appliedCoupon,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price discountPrice stock images isActive sku',
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.product) {
        const unitPrice =
          item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
        subtotal += unitPrice * item.quantity;
      }
    }

    const validation = coupon.isValid(req.user._id, subtotal);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    cart.coupon = coupon._id;
    await cart.save();

    const totals = await computeTotals(cart, req.user._id);

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully! Saved $${totals.discountAmount}`,
      data: {
        _id: cart._id,
        items: cart.items,
        coupon: totals.appliedCoupon,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
const removeCoupon = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price discountPrice stock images isActive sku',
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.coupon = null;
    await cart.save();

    const totals = await computeTotals(cart, req.user._id);

    res.json({
      success: true,
      message: 'Coupon removed',
      data: {
        _id: cart._id,
        items: cart.items,
        coupon: null,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.coupon = null;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
        totals: {
          subtotal: 0,
          discountAmount: 0,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
};
