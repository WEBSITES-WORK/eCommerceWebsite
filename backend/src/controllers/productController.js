const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

// @desc    Get all products with full filtering, search, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Only active products for regular customers unless admin queries all
    if (req.query.all !== 'true') {
      query.isActive = true;
    }

    // Keyword / search term (supports keyword, search, query, or q)
    const searchTerm = req.query.keyword || req.query.search || req.query.query || req.query.q;
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ];
    }

    // Category filter (by id or slug)
    if (req.query.category) {
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) query.category = cat._id;
      }
    }

    // Brand filter (by id or slug)
    if (req.query.brand) {
      if (req.query.brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brand = req.query.brand;
      } else {
        const br = await Brand.findOne({ slug: req.query.brand });
        if (br) query.brand = br._id;
      }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Rating filter
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    // In stock filter
    if (req.query.inStock === 'true' || req.query.stockStatus === 'in-stock') {
      query.stock = { $gt: 0 };
    } else if (req.query.stockStatus === 'out-of-stock') {
      query.stock = { $lte: 0 };
    } else if (req.query.stockStatus === 'low-stock') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    // Active / Inactive status filter
    if (req.query.status === 'active') {
      query.isActive = true;
    } else if (req.query.status === 'inactive') {
      query.isActive = false;
    }

    // Featured / Bestseller / New arrival filters
    if (req.query.isFeatured === 'true') query.isFeatured = true;
    if (req.query.isBestseller === 'true') query.isBestseller = true;
    if (req.query.isNewArrival === 'true') query.isNewArrival = true;

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sort = { price: 1 };
          break;
        case 'price-desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'popular':
          sort = { numReviews: -1 };
          break;
        case 'newest':
        default:
          sort = { createdAt: -1 };
          break;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get search suggestions
// @route   GET /api/products/suggestions
// @access  Public
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length === 0) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await Product.find(
      {
        title: { $regex: query, $options: 'i' },
        isActive: true,
      },
      'title slug price images category'
    )
      .populate('category', 'name')
      .limit(6);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id or slug
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };

    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .limit(4);

    // If fewer than 4 related items in category, supplement with matching brand or tags
    if (related.length < 4) {
      const existingIds = [product._id, ...related.map((r) => r._id)];
      const supplemental = await Product.find({
        $or: [
          { brand: product.brand },
          { tags: { $in: product.tags || [] } },
        ],
        _id: { $nin: existingIds },
        isActive: true,
      })
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .limit(4 - related.length);

      related = [...related, ...supplemental];
    }

    res.json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      stock,
      lowStockThreshold,
      category,
      brand,
      images,
      isFeatured,
      isBestseller,
      isNewArrival,
      isActive,
      specifications,
      variants,
      tags,
      sku,
    } = req.body;

    if (!title || !description || price === undefined || stock === undefined || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, stock, category, brand',
      });
    }

    const baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const finalSku = (sku || `SKU-${Date.now().toString().slice(-6)}`).toUpperCase();

    const product = await Product.create({
      title,
      slug: finalSlug,
      sku: finalSku,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
      category,
      brand,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      isFeatured: !!isFeatured,
      isBestseller: !!isBestseller,
      isNewArrival: isNewArrival !== undefined ? !!isNewArrival : true,
      isActive: isActive !== undefined ? !!isActive : true,
      specifications: Array.isArray(specifications) ? specifications : [],
      variants: Array.isArray(variants) ? variants : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    const populated = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('brand', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (req.body.title && req.body.title !== product.title) {
      product.title = req.body.title;
      product.slug = slugify(req.body.title);
    }
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.discountPrice !== undefined) product.discountPrice = Number(req.body.discountPrice);
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (req.body.lowStockThreshold !== undefined) product.lowStockThreshold = Number(req.body.lowStockThreshold);
    if (req.body.category) product.category = req.body.category;
    if (req.body.brand) product.brand = req.body.brand;
    if (req.body.sku) product.sku = req.body.sku.toUpperCase();
    if (Array.isArray(req.body.images) && req.body.images.length > 0) product.images = req.body.images;
    if (req.body.isFeatured !== undefined) product.isFeatured = !!req.body.isFeatured;
    if (req.body.isBestseller !== undefined) product.isBestseller = !!req.body.isBestseller;
    if (req.body.isNewArrival !== undefined) product.isNewArrival = !!req.body.isNewArrival;
    if (req.body.isActive !== undefined) product.isActive = !!req.body.isActive;
    if (Array.isArray(req.body.specifications)) product.specifications = req.body.specifications;
    if (Array.isArray(req.body.variants)) product.variants = req.body.variants;
    if (Array.isArray(req.body.tags)) product.tags = req.body.tags;

    const updated = await product.save();
    const populated = await Product.findById(updated._id)
      .populate('category', 'name')
      .populate('brand', 'name');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update inventory stock
// @route   PATCH /api/products/:id/inventory
// @access  Private/Admin
const updateInventory = async (req, res, next) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Math.max(0, Number(lowStockThreshold));

    await product.save();

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        _id: product._id,
        title: product.title,
        sku: product.sku,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Bulk delete products
// @route   POST /api/products/bulk/delete
// @access  Private/Admin
const bulkDeleteProducts = async (req, res, next) => {
  try {
    const ids = req.body.ids || req.body.productIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of product IDs' });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`,
      data: { count: result.deletedCount, deletedCount: result.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Bulk update product status (active/disabled)
// @route   PATCH /api/products/bulk/status
// @access  Private/Admin
const bulkUpdateProductStatus = async (req, res, next) => {
  try {
    const ids = req.body.ids || req.body.productIds;
    const { isActive } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || isActive === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide product IDs and isActive boolean' });
    }

    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: !!isActive } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: { count: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getSearchSuggestions,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
};
