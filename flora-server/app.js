import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import errorHandler from './middleware/errorHandler.js';

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
app.use('/api/v1/products', productsRouter);

// Register error handling middleware
app.use(errorHandler);

export default app;
