import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import jdRoutes from './routes/jd';
import skillRoutes from './routes/skills';
import roadmapRoutes from './routes/roadmap';
import projectRoutes from './routes/projects';
import githubRoutes from './routes/github';
import verificationRoutes from './routes/verification';
import adminRoutes from './routes/admin';
import { errorHandler, notFound } from './middleware/errorMiddleware';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jd', jdRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'API Gateway'
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillgap')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`API Gateway running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;