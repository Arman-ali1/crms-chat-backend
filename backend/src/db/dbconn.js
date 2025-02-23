// src/db/dbconn.js
import mongoose from 'mongoose';

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://armnsrn1732000:arman12345chat@cluster0.0dw3y.mongodb.net/your_database?retryWrites=true&w=majority';

export const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connection to MongoDB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error);
    process.exit(1); // Exit the process with failure
  }
};

export default mongoose;
