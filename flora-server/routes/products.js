import { Router } from 'express';
import upload from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import {
  uploadProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsStats,
  getValidationQueue,
  approveProduct,
  rejectProduct,
  retryProductProcessing,
  recalculateProductIntelligence,
  exportProducts
} from '../controllers/productsController.js';

const router = Router();

// All product endpoints require authentication.
// Ownership scoping is enforced inside each controller based on req.user.role.
router.use(requireAuth);

// Ingest Product Document (single file or batch multi-file) — ownership derived from req.user._id
router.post('/upload', upload.any(), uploadProduct);
router.post('/analyze', upload.any(), uploadProduct);

// Catalog Export Endpoint (Must come before /:id) — scoped strictly by ownership
router.get('/export', exportProducts);

// Get All Products (user-scoped or admin-global)
router.get('/', getAllProducts);

// Get Product Stats — user-scoped dashboard data (Must come before /:id)
router.get('/stats', getProductsStats);

// Validation Queue — user-scoped review queue (Must come before /:id)
router.get('/validation', getValidationQueue);

// Approval / Rejection Endpoints — ownership enforced inside controller
router.put('/:id/approve', approveProduct);
router.put('/:id/reject', rejectProduct);

// Processing Retry & Intelligence Recalculation Endpoints — ownership enforced inside controller
router.post('/:id/retry', retryProductProcessing);
router.post('/:id/recalculate-intelligence', recalculateProductIntelligence);

// Get Product by ID — ownership enforced inside controller
router.get('/:id', getProductById);

// Update Product (Manual Override) — ownership enforced inside controller
router.put('/:id', updateProduct);

// Delete Product — ownership enforced inside controller
router.delete('/:id', deleteProduct);

export default router;
