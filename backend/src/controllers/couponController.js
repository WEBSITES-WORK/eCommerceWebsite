const Coupon = require('../models/Coupon');

// @desc    Admin: Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single coupon by ID or code
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = async (req, res, next) => {
  try {
    const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.id } : { code: req.params.id.toUpperCase() };

    const coupon = await Coupon.findOne(query);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Public/Customer: Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const amount = Number(
      req.body.subtotal !== undefined
        ? req.body.subtotal
        : req.body.cartTotal !== undefined
        ? req.body.cartTotal
        : req.body.orderAmount !== undefined
        ? req.body.orderAmount
        : req.body.amount || 0
    );

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    const userId = req.user ? req.user._id : null;
    const validation = coupon.isValid(userId, amount);

    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    res.json({
      success: true,
      message: `Coupon applied! You saved $${validation.discount}`,
      data: validation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountAmount,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      userUsageLimit,
      isActive,
    } = req.body;

    if (!code || !discountAmount || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount amount, and expiry date are required',
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A coupon with this code already exists',
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountAmount: Number(discountAmount),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : 0,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      userUsageLimit: userUsageLimit ? Number(userUsageLimit) : 1,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (req.body.code) coupon.code = req.body.code.toUpperCase();
    if (req.body.discountType) coupon.discountType = req.body.discountType;
    if (req.body.discountAmount !== undefined) coupon.discountAmount = Number(req.body.discountAmount);
    if (req.body.minOrderAmount !== undefined) coupon.minOrderAmount = Number(req.body.minOrderAmount);
    if (req.body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(req.body.maxDiscountAmount);
    if (req.body.expiryDate) coupon.expiryDate = new Date(req.body.expiryDate);
    if (req.body.usageLimit !== undefined) coupon.usageLimit = Number(req.body.usageLimit);
    if (req.body.userUsageLimit !== undefined) coupon.userUsageLimit = Number(req.body.userUsageLimit);
    if (req.body.isActive !== undefined) coupon.isActive = req.body.isActive;

    const updated = await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
