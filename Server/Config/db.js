import mongoose from 'mongoose';
import dotenv from 'dotenv'
// import DB_NAME from '../Constants.js';

dotenv.config();


const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);

    console.log("MongoDB connected successfully ");
  } catch (err) {
    console.error("Mongoose Connection Error:", err);
    process.exit(1); // Exit the process with failure code
  }
};

export default connectDB;
