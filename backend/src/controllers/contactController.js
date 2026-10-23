const Contact = require('../models/Contact');
const Notification = require('../models/Notification');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required',
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    // Notify admins
    await Notification.create({
      user: null,
      title: 'New Customer Inquiry',
      message: `${name} (${email}) sent a message: "${subject}"`,
      type: 'system',
      link: '/admin/settings',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all inquiries
// @route   GET /api/contact
// @access  Private/Admin
const getAllMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update message status / reply
// @route   PATCH /api/contact/:id
// @access  Private/Admin
const updateContactStatus = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (status) contact.status = status;
    if (adminReply !== undefined) contact.adminReply = adminReply;

    await contact.save();

    res.json({
      success: true,
      message: 'Support ticket updated',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getAllMessages,
  updateContactStatus,
};
