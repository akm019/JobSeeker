import mongoose from 'mongoose'

const chatRoomSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    domain: {
      type: String,
      required: true
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  
  export default mongoose.model("ChatRoom", chatRoomSchema);