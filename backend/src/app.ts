import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import routes from './routes';
import { corsOptions, logCorsConfig } from './config/cors.config';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // CORS middleware - must be before other middleware
  app.use(cors(corsOptions));
  logCorsConfig();

  // Cookie parser middleware
  app.use(cookieParser());

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use('/api', routes);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
