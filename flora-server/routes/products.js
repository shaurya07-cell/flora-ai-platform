import { Router } from 'express';
import upload from '../middleware/upload.js';
import {
  uploadProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';

const router = Router();

// Ingest Product Document
router.post('/upload', upload.single('file'), uploadProduct);
router.post('/analyze', upload.single('file'), uploadProduct);

// Get All Products
router.get('/', getAllProducts);

// Get Product by ID
router.get('/:id', getProductById);

// Update Product (Manual Override)
router.put('/:id', updateProduct);

// Delete Product
router.delete('/:id', deleteProduct);

export default router;
