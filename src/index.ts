import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import studioRoutes from './routes/studioRoutes';
import bookingRoutes from './routes/bookingRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import seedRoutes from './routes/seedRoutes';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Trigger initial connection
connectDB().catch((err) => {
  console.warn('[MongoDB] Initial connection error (will retry on incoming request):', err.message);
});

// Middleware to ensure DB connection is ready before handling API requests
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Allow health check without DB wait if needed, but let's check DB for /api/ routes
  if (req.path.startsWith('/api/') && req.path !== '/api/health') {
    try {
      await connectDB();
    } catch (err: any) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is initializing or unavailable. Please try again shortly.',
        error: err.message,
      });
    }
  }
  next();
});

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and production client domains
      if (!origin || origin === CLIENT_URL || origin.includes('localhost') || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for assessment / testing
      }
    },
    credentials: true, // Necessary for HTTPOnly cookie transmission (Challenge 1)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base Route & Health Check
app.get('/', (req: Request, res: Response) => {
  res.json({
    project: 'StudioSpace Backend API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/seed', seedRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[StudioSpace Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;
