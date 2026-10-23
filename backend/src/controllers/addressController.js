const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      streetAddress,
      apartment,
      city,
      state,
      postalCode,
      country,
      isDefault,
      addressType,
    } = req.body;

    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required address fields',
      });
    }

    // If marked default or first address, reset others
    const addressCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || addressCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      streetAddress,
      apartment: apartment || '',
      city,
      state,
      postalCode,
      country: country || 'United States',
      isDefault: shouldBeDefault,
      addressType: addressType || 'Home',
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
      address.isDefault = true;
    }

    const fields = ['fullName', 'phone', 'streetAddress', 'apartment', 'city', 'state', 'postalCode', 'country', 'addressType'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    const updated = await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If the deleted address was default, set another address as default if any exist
    if (address.isDefault) {
      const another = await Address.findOne({ user: req.user._id });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    res.json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
