import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // Reference to the Job model
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: Add any additional fields like a cover letter
  coverLetter: {
    type: String,
    default: '',
  },
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
