import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Product from './models/Product.js';
import { seedDatabase } from './services/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

app.use(limiter);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving (files also protected via /api/photos/file/:filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Mosaic Wellness Journey API',
    version: '1.0.0',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Centralized 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit of 5 MB',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate entry error: An entry with this ${field} already exists.`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed sample products if database is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Database appears fresh. Running initial seed...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🌿 MOSAIC WELLNESS JOURNEY TRACKER SERVER RUNNING`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
