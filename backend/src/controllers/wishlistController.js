const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'brand', select: 'name slug' },
      ],
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out any deleted products
    const validProducts = wishlist.products.filter((p) => p !== null);
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts.map((p) => p._id);
      await wishlist.save();
    }

    res.json({
      success: true,
      data: validProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist or POST /api/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.body.productId;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const alreadyAdded = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (!alreadyAdded) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate({
      path: 'products',
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'brand', select: 'name slug' },
      ],
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.body.productId;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'brand', select: 'name slug' },
      ],
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }

    res.json({
      success: true,
      message: 'Wishlist cleared',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (add or remove)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (id) => id.toString() === productId.toString()
    );

    let isAdded = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'products',
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'brand', select: 'name slug' },
      ],
    });

    res.json({
      success: true,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      data: {
        isWishlisted: isAdded,
        products: wishlist.products,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  toggleWishlist,
};
