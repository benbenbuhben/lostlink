import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';

import connectDB from './config/db.js';

import itemRoutes from './routes/itemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import { authenticate } from './middleware/auth.js';
import { attachUser } from './middleware/attachUser.js';

const app = express();

// Connect to MongoDB
connectDB();

// Global middlewares
// CORS 설정: 프로덕션에서는 Vercel 도메인만 허용, 개발환경에서는 모든 origin 허용
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:19006']
  : ['http://localhost:3000', 'http://localhost:19006', '*'];

app.use(cors({
  origin: function (origin, callback) {
    // 개발환경 또는 origin이 없으면 허용 (같은 origin 요청)
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // 프로덕션: 허용된 origin만 허용
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.use(authenticate);   // ← verify access-token, sets req.auth
app.use(attachUser);     // ← find-or-create User, sets req.userDoc

// Routes
app.use('/items', itemRoutes);
app.use('/auth', authRoutes);
app.use('/claims', claimRoutes);

app.get('/', (req, res) => {
  res.send('LostLink API up and running');
});

// Test endpoint for API connectivity
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    data: [
      {
        _id: 'test1',
        title: 'Test Item 1',
        location: 'Test Location 1',
        description: 'This is a test item',
        imageUrl: 'https://via.placeholder.com/300x200',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'test2',
        title: 'Test Item 2',
        location: 'Test Location 2',
        description: 'Another test item',
        imageUrl: 'https://via.placeholder.com/300x200',
        createdAt: new Date().toISOString()
      }
    ],
    pagination: {
      total: 2,
      page: 1,
      limit: 10
    }
  });
});

// Environment variables check endpoint
app.get('/env-check', (req, res) => {
  res.json({
    message: 'Environment variables status',
    timestamp: new Date().toISOString(),
    env: {
      mongo: {
        configured: !!process.env.MONGO_URI && !process.env.MONGO_URI.includes('xxxxx'),
        uri: process.env.MONGO_URI ? (process.env.MONGO_URI.includes('@') ? '***configured***' : process.env.MONGO_URI) : 'not set',
      },
      awsRekognition: {
        configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        region: process.env.AWS_REGION || 'not set',
      },
      awsS3: {
        configured: !!(process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY),
        bucket: process.env.MINIO_BUCKET_NAME || 'not set',
        region: process.env.MINIO_REGION || 'not set',
        publicUrl: process.env.MINIO_PUBLIC_URL || 'not set',
      },
      auth0: {
        configured: !!(process.env.AUTH0_DOMAIN && process.env.AUTH0_AUDIENCE),
        domain: process.env.AUTH0_DOMAIN || 'not set',
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'not set',
      },
      nodeEnv: process.env.NODE_ENV || 'not set',
      port: process.env.PORT || 'not set',
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app; 