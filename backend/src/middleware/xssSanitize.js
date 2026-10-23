/**
 * Middleware to sanitize user input against Cross-Site Scripting (XSS).
 * Sanitizes dangerous script tags, event handlers, and javascript: protocols from string inputs.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onclick\s*=/gi, '')
    .replace(/onmouseover\s*=/gi, '');
}

function cleanXSS(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = sanitizeString(obj[i]);
      } else if (typeof obj[i] === 'object') {
        cleanXSS(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      cleanXSS(obj[key]);
    }
  }

  return obj;
}

const xssSanitize = (req, res, next) => {
  if (req.body) cleanXSS(req.body);
  if (req.query) cleanXSS(req.query);
  next();
};

module.exports = xssSanitize;
