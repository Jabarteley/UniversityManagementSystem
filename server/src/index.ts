import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import fileUpload from 'express-fileupload';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import staffRoutes from './routes/staff.js';
import documentsRoutes from './routes/documents.js';
import reportsRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import searchRoutes from './routes/search.js';
import backupRoutes from './routes/backup.js';
import filterRoutes from './routes/filters.js';
import courseRoutes from './routes/courses.js';

// Import services

import SearchService from './services/searchService.js';
import BackupService from './services/backupService.js';

import { errorHandler } from './middleware/errorHandler.js';


dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();

// General request logger
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize document processing service
    // const documentProcessor = DocumentProcessingService.getInstance();
    // await documentProcessor.initializeOCR();
    // logger.info('Document processing service initialized');

    // Initialize search service
    const searchService = SearchService.getInstance();
    await searchService.initializeIndexes();
    logger.info('Search service initialized');

    // Initialize backup service
    const backupService = BackupService.getInstance();
    backupService.initialize();
    logger.info('Backup service initialized');
  } catch (error) {
    logger.error('Error initializing services:', error);
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory');
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  },
}));

// Compression middleware
app.use(compression());

// MongoDB injection prevention
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.webcontainer-api\.io$/,
    /\.local-credentialless\.webcontainer-api\.io$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: os.tmpdir(),
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Serve uploaded files (fallback for local files)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/courses', courseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV,
    service: 'University Records Management System (URMS)',
    database: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured',
    version: '2.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'University Records Management System (URMS) API v2.0',
    version: '2.0.0',
    features: [
      'Document Management with Cloudinary',
      'OCR Text Extraction',
      'Advanced Search & Indexing',
      'Automated Backups',
      'Role-based Access Control',
      'Audit Trails',
      'Analytics & Reporting'
    ],
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      students: '/api/students',
      staff: '/api/staff',
      documents: '/api/documents',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      users: '/api/users',
      search: '/api/search',
      backup: '/api/backup',
      filters: '/api/filters'
    }
  });
});

// Error handling middleware
app.use(errorHandler);





// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/students',
      '/api/staff',
      '/api/documents',
      '/api/reports',
      '/api/dashboard',
      '/api/users',
      '/api/search',
      '/api/backup',
      '/api/filters'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Cleanup services
  try {
    // const documentProcessor = DocumentProcessingService.getInstance();
    // await documentProcessor.cleanup();
    // logger.info('Document processing service cleaned up');
  } catch (error) {
    logger.error('Error cleaning up services:', error);
  }
  
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  logger.success(`University Records Management System (URMS) v2.0 running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
  logger.info(`Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured'}`);
  
  // Initialize services after server starts
  await initializeServices();
});

export default app;