import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'body-parser';
import { Pool } from 'pg';
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

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'skillgap',
  user: process.env.POSTGRES_USER || 'skillgap_user',
  password: process.env.POSTGRES_PASSWORD || 'skillgap_pass',
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

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
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        service: 'API Gateway',
        database: 'disconnected'
      });
    } else {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'API Gateway',
        database: 'connected'
      });
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

export default app;