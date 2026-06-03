require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Boot-time env check: validates SUPABASE_* vars and exits if missing.
require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const supplierRoutes = require('./routes/suppliers');
const materialRoutes = require('./routes/materials');
const categoryRoutes = require('./routes/categories');
const jobRoutes = require('./routes/jobs');
const pricingRoutes = require('./routes/pricing');
const adminRoutes = require('./routes/admin');
const orderEmailRoutes = require('./routes/orderEmail');
const onboardingRoutes = require('./routes/onboarding');
const stripeRoutes = require('./routes/stripe');
const placesRoutes = require('./routes/places');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Behind Railway's proxy, so trust the first hop. Without this, express-rate-limit
// keys every request on the proxy IP and the per-client limits never bite.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        manifestSrc: ["'self'"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints. Production is tight (anti-bruteforce);
// development is lenient since dev iterations hit login often.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify', authLimiter);

// Endpoints that send an email on every call get an even tighter cap. Both are
// reachable with a freshly issued token (register hands one out before the email
// is verified), so without this a caller could bomb a victim's inbox and burn the
// email quota. Legitimate users rarely need more than one or two sends.
const emailDispatchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before requesting another email.' },
});
app.use('/api/auth/forgot-password', emailDispatchLimiter);
app.use('/api/auth/resend-code', emailDispatchLimiter);

// Body parsing: skip JSON for the Stripe webhook so signature verification
// has access to the raw body (the stripe router uses express.raw on that path).
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') return next();
  express.json({ limit: '1mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Static files: serve frontend
// ---------------------------------------------------------------------------
const frontendPath = path.join(__dirname, '..', 'frontend');

// Landing page at root (before static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'landing.html'));
});

app.use(express.static(frontendPath, { index: false }));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/order-email', orderEmailRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/places', placesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Fallback: serve app for non-API routes
// ---------------------------------------------------------------------------
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      // Frontend may not exist yet; that's fine
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// ---------------------------------------------------------------------------
// Error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server only when run directly (`node server.js`). When required by the
// test suite the app is used in-process via supertest, so we skip listen().
// ---------------------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Material Calculator API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Supabase: ${process.env.SUPABASE_URL || '(not set)'}`);
    console.log(`Frontend: ${frontendPath}`);
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    process.exit(0);
  });
}

module.exports = app;
