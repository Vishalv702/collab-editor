import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-editor'
    );
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
