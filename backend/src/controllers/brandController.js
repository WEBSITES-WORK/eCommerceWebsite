const Brand = require('../models/Brand');
const Product = require('../models/Product');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

// @desc    Get all brands with product counts
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    const brands = await Brand.find(query).sort({ name: 1 }).lean();

    const productCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    });

    const enrichedBrands = brands.map((brand) => ({
      ...brand,
      productCount: countMap[brand._id.toString()] || 0,
    }));

    res.json({
      success: true,
      data: enrichedBrands,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single brand by slug or id
// @route   GET /api/brands/:slug
// @access  Public
const getBrand = async (req, res, next) => {
  try {
    const isId = req.params.slug.match(/^[0-9a-fA-F]{24}$/);
    const query = isId
      ? { $or: [{ _id: req.params.slug }, { slug: req.params.slug }] }
      : { slug: req.params.slug };

    const brand = await Brand.findOne(query).lean();

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    const productCount = await Product.countDocuments({
      brand: brand._id,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        ...brand,
        productCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = async (req, res, next) => {
  try {
    const { name, description, logo, website, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required',
      });
    }

    const slug = slugify(name);
    const existing = await Brand.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A brand with this name already exists',
      });
    }

    const brand = await Brand.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      logo: logo || '',
      website: website ? website.trim() : '',
      isActive: isActive !== undefined ? !!isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: {
        ...brand.toObject(),
        productCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    if (req.body.name && req.body.name.trim() !== brand.name) {
      brand.name = req.body.name.trim();
      brand.slug = slugify(req.body.name);
    }
    if (req.body.description !== undefined) brand.description = req.body.description.trim();
    if (req.body.logo !== undefined) brand.logo = req.body.logo;
    if (req.body.website !== undefined) brand.website = req.body.website.trim();
    if (req.body.isActive !== undefined) brand.isActive = !!req.body.isActive;

    const updated = await brand.save();

    const productCount = await Product.countDocuments({
      brand: updated._id,
      isActive: true,
    });

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: {
        ...updated.toObject(),
        productCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    const productCount = await Product.countDocuments({ brand: brand._id });
    if (productCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand because it contains ${productCount} active products. Pass ?force=true to override.`,
      });
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Brand removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};
