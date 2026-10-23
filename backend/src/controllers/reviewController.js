const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review (verifies prior purchase)
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, title, images } = req.body;
    const numRating = Number(rating);

    if (!productId || rating === undefined || rating === null || !comment || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Product, rating (between 1 and 5), and review comment are required',
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product',
      });
    }

    // Check if user has actually purchased this product in any delivered/confirmed order
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: { $in: ['Delivered', 'Shipped', 'Out for Delivery', 'Confirmed', 'Processing', 'Packed'] },
    });

    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only review products that you have purchased',
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: hasPurchased ? hasPurchased._id : null,
      rating: Number(rating),
      comment: comment.trim(),
      title: title ? title.trim() : '',
      images: Array.isArray(images) ? images : [],
      isVerifiedPurchase: !!hasPurchased,
      isApproved: true,
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Must be the owner or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    if (req.body.rating !== undefined) review.rating = Number(req.body.rating);
    if (req.body.comment !== undefined) review.comment = req.body.comment.trim();
    if (req.body.title !== undefined) review.title = req.body.title.trim();
    if (Array.isArray(req.body.images)) review.images = req.body.images;

    await review.save();

    // Recalculate average rating on product
    await Review.calculateAverageRating(review.product);

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all reviews for moderation
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status === 'pending') query.isApproved = false;
    if (req.query.status === 'approved') query.isApproved = true;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'title slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle review approval status
// @route   PATCH /api/reviews/:id/approval
// @access  Private/Admin
const toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    // Recalculate average rating on product
    await Review.calculateAverageRating(review.product);

    res.json({
      success: true,
      message: `Review ${review.isApproved ? 'approved' : 'hidden'} successfully`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating on product
    await Review.calculateAverageRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  getAllReviews,
  toggleReviewApproval,
  deleteReview,
};
