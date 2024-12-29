import mongoose from "mongoose";


const roomEnrollmentSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now }
  });

  export default mongoose.model('RoomEnrollment',roomEnrollmentSchema)