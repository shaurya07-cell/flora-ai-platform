import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  getOAuthConfig,
  googleAuth,
  githubAuth,
  getMe,
  logout,
  changePassword,
  updateProfile
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Auth Endpoints
router.get('/oauth/config', getOAuthConfig);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/oauth/google', googleAuth);
router.post('/oauth/github', githubAuth);

// Protected Auth Endpoints
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.put('/change-password', requireAuth, changePassword);
router.post('/change-password', requireAuth, changePassword);
router.put('/profile', requireAuth, updateProfile);

export default router;
