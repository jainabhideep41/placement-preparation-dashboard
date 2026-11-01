import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { memoryCache } from './cache/memoryCache.js';
import { clearProblemStore } from './data/problemStore.js';

import dashboardRoutes from './routes/dashboard.routes.js';
import dsaRoutes from './routes/dsa.routes.js';
import webDevRoutes from './routes/webdev.routes.js';
import systemDesignRoutes from './routes/systemdesign.routes.js';
import githubRoutes from './routes/github.routes.js';
import readinessRoutes from './routes/readiness.routes.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging for developer visibility
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Clear cache endpoint
app.post('/api/cache/clear', (req, res) => {
  memoryCache.clear();
  clearProblemStore();
  res.json({ success: true, message: 'Server in-memory cache and problem store cleared successfully' });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/webdev', webDevRoutes);
app.use('/api/systemdesign', systemDesignRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public/profile', profileRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

if (!process.env.VERCEL && !process.env.VERCEL_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Placement Prep Backend running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available at /api/dashboard, /api/dsa, etc.`);
    console.log(`===================================================`);
  });
}

export default app;
