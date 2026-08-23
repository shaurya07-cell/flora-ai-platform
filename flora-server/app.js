import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js';
import { seedAdminUser } from './utils/seedAdmin.js';

const app = express();

// Enable CORS
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Flora API is running'
  });
});

// Mount routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/products', productsRouter);

// Provision initial admin user
seedAdminUser();

// Register error handling middleware
app.use(errorHandler);

export default app;
