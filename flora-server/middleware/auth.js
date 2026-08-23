import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Retrieve active JWT Secret.
 * Refuses execution in production environment if JWT_SECRET environment variable is missing.
 */
export const getJwtSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is NOT set in production environment. Refusing to launch application with insecure default.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not set. Using an insecure fallback. Set JWT_SECRET in your .env file before production deployment.');
  }
  return process.env.JWT_SECRET || 'flora-dev-fallback-secret-change-in-production';
};

/**
 * Middleware to verify JWT token from Authorization header or query token.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is missing. Please sign in.'
        }
      });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account not found or deactivated.'
        }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.message && err.message.includes('[FATAL SECURITY ERROR]')) {
      return next(err);
    }
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Authentication session expired or invalid. Please log in again.'
      }
    });
  }
};

/**
 * Middleware to enforce role requirements (e.g. requireRole('admin')).
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.'
        }
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. ${role.toUpperCase()} privileges required.`
        }
      });
    }

    next();
  };
};

/**
 * Helper to generate JWT token for user.
 */
export const generateToken = (user) => {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
};
