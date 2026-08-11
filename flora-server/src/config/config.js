import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || ''
};

export default config;
