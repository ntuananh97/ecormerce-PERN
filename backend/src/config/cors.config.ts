import { CorsOptions } from 'cors';

/**
 * Allowed origins for CORS
 * In production, these should be set via environment variables
 */
const getAllowedOrigins = (): string[] => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'production') {
    // Production origins - should be set via environment variable
    const productionOrigins = process.env.ALLOWED_ORIGINS;
    if (productionOrigins) {
      return productionOrigins.split(',').map(origin => origin.trim());
    }
    // Fallback to empty array if not set (will block all origins)
    return [];
  }

  // Development origins
  return [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000',
  ];
};

/**
 * CORS configuration
 * Production-ready setup with security best practices
 */
export const corsOptions: CorsOptions = {
  // Dynamic origin validation
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },

  // Allow credentials (cookies, authorization headers, etc.)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  // Exposed headers (headers that the browser can access)
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Total-Count',
    'X-Page',
    'X-Limit',
  ],

  // Preflight cache duration (in seconds)
  // Browser will cache preflight response for 24 hours
  maxAge: 86400,

  // Pass the CORS preflight response to the next handler
  preflightContinue: false,

  // Successful OPTIONS requests return 204 instead of 200
  optionsSuccessStatus: 204,
};

/**
 * Development-only: Log CORS configuration on startup
 */
export const logCorsConfig = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 CORS Configuration:');
    console.log('   Allowed Origins:', getAllowedOrigins());
    console.log('   Credentials:', corsOptions.credentials);
    console.log('   Methods:', corsOptions.methods);
  }
};
