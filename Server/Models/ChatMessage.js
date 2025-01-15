import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  attachment: {
    url: String,
    originalName: String,
    filename: String
  },
  timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;