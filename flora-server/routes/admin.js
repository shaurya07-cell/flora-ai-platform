import { Router } from 'express';
import { getUsers, getAdminStats, getAdminAudit } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin endpoints with requireAuth AND requireRole('admin')
router.use(requireAuth, requireRole('admin'));

router.get('/users', getUsers);
router.get('/stats', getAdminStats);
router.get('/audit', getAdminAudit);

export default router;
