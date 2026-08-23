import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`[DB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[DB] Active Database Name: ${conn.connection.name}`);
    console.log(`[DB] Connection State: ${conn.connection.readyState === 1 ? 'Connected (1)' : conn.connection.readyState}`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;