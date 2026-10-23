const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    return 'dev_fallback_jwt_key_novashop_2026';
  }
  return secret;
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const verifyToken = (token, options = {}) => {
  return jwt.verify(token, getJwtSecret(), options);
};

module.exports = {
  getJwtSecret,
  generateToken,
  verifyToken,
};
