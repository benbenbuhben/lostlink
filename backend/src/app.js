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
app.use(cors());
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