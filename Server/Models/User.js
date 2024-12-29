import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    // enum: ['jobseeker', 'jobposter', 'professional'], // Define roles
  },
  resume:{
    type:String
  },
  phone: { type: String }, // Phone number
  location: { type: String }, // Location
  skills: { type: [String] }, // Array of skills
  profilePicture: { type: String }, // Profile picture URL
  isProfessional: { type: Boolean, default: false }, // Flag for professionals
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' }, // Account status
}, { timestamps: true }); // Add createdAt and updatedAt

export default mongoose.model('User', userSchema);
