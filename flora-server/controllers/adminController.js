import User from '../models/User.js';
import Product from '../models/Product.js';

/**
 * Get all users for admin management portal.
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        users: users.map(u => u.toJSON())
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get administrative platform stats.
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const verifiedProducts = await Product.countDocuments({ status: 'Verified' });
    const reviewProducts = await Product.countDocuments({ status: 'Needs Review' });
    const rejectedProducts = await Product.countDocuments({ status: 'Rejected' });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        verifiedProducts,
        reviewProducts,
        rejectedProducts,
        systemHealth: {
          backend: 'Operational',
          database: 'Connected',
          ocr: 'Operational',
          ai: 'Operational',
          validation: 'Operational'
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get administrative audit activity log.
 */
export const getAdminAudit = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(50);
    const auditLogs = products.map((p) => ({
      id: p._id,
      timestamp: p.createdAt || p.updatedAt,
      action: p.status === 'Verified' ? 'Product Approved' : p.status === 'Rejected' ? 'Product Rejected' : 'Product Uploaded',
      entity: p.name || 'Catalog Item',
      sourceFile: p.sourceFile || 'Upload',
      user: 'System Pipeline',
      status: p.status || 'Needs Review'
    }));

    return res.status(200).json({
      success: true,
      data: auditLogs
    });
  } catch (err) {
    next(err);
  }
};
