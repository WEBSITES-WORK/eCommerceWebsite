const Category = require('../models/Category');
const Product = require('../models/Product');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

// @desc    Get all categories with dynamic product counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ name: 1 }).lean();

    // Aggregate product counts per category
    const productCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat._id.toString()] || 0,
    }));

    res.json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug or id with product count
// @route   GET /api/categories/:slug
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const isId = req.params.slug.match(/^[0-9a-fA-F]{24}$/);
    const query = isId
      ? { $or: [{ _id: req.params.slug }, { slug: req.params.slug }] }
      : { slug: req.params.slug };

    const category = await Category.findOne(query).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        ...category,
        productCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      image: image || '',
      icon: icon || '',
      isActive: isActive !== undefined ? !!isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        ...category.toObject(),
        productCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (req.body.name && req.body.name.trim() !== category.name) {
      category.name = req.body.name.trim();
      category.slug = slugify(req.body.name);
    }
    if (req.body.description !== undefined) category.description = req.body.description.trim();
    if (req.body.image !== undefined) category.image = req.body.image;
    if (req.body.icon !== undefined) category.icon = req.body.icon;
    if (req.body.isActive !== undefined) category.isActive = !!req.body.isActive;

    const updated = await category.save();

    const productCount = await Product.countDocuments({
      category: updated._id,
      isActive: true,
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        ...updated.toObject(),
        productCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if products exist in category
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because it contains ${productCount} active products. Reassign or delete products first, or pass ?force=true.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
