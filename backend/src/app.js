import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/db.js';

import itemRoutes from './routes/itemRoutes.js';

const app = express();

// Connect to MongoDB
connectDB();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/items', itemRoutes);

app.get('/', (req, res) => {
  res.send('LostLink API up and running');
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