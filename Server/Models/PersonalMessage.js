import mongoose from "mongoose";

const personalMessageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    attachment: { type: String },  // Add this line
    timestamp: { type: Date, default: Date.now }
  });

  export default mongoose.model("PersonalMessage", personalMessageSchema)