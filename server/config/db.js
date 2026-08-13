import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/life-leveling';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
