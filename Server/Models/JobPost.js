import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  positionTitle: { type: String, required: true },
  industry: { type: String, required: true },
  salary: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  companyName: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("Job", jobSchema);
// title,description,location,salary, jobType,skills,postedBy,applicants