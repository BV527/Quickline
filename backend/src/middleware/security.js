const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const generalLimiter = createRateLimit(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again later.'
);

const authLimiter = createRateLimit(
  15 * 60 * 1000,
  5,
  'Too many login attempts from this IP, please try again after 15 minutes.'
);

const queueLimiter = createRateLimit(
  60 * 1000,
  10,
  'Too many queue requests from this IP, please try again after a minute.'
);

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/[<>]/g, '');
        if (key.includes('$') || key.includes('.')) {
          delete obj[key];
        }
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  queueLimiter,
  sanitizeInput,
  securityHeaders
};