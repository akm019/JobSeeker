import mongoose from 'mongoose';

const QuizSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    id: String,
    type: String,
    question: String,
    options: [String],
    correctAnswer: String,
    difficulty: String,
    topic: String,
    explanation: String
  }],
  position: String,
  experienceLevel: String,
  timestamp: Date
});

export default mongoose.model('QuizSession', QuizSessionSchema);