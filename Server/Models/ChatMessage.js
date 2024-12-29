import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  attachment: {
    type: String, // URL to the uploaded file
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;