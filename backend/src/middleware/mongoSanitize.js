/**
 * Middleware to sanitize user inputs against NoSQL/MongoDB query injection.
 * Recursively strips keys starting with '$' or containing '.' from req.body, req.query, and req.params.
 */
function clean(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = clean(obj[i]);
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      obj[key] = clean(obj[key]);
    }
  }

  return obj;
}

const mongoSanitize = (req, res, next) => {
  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
};

module.exports = mongoSanitize;
