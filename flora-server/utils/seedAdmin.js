import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const seedAdminUser = async () => {
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      return; // Skip seeding if MongoDB connection is not active (e.g. unit testing)
    }
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'FLORA Administrator',
        email: 'admin@flora.ai',
        passwordHash,
        provider: 'local',
        role: 'admin'
      });
      await admin.save();
      console.log('[SEED] Default administrator account provisioned (admin@flora.ai)');
    }
  } catch (err) {
    // Silent catch during unit test mock runs
  }
};
