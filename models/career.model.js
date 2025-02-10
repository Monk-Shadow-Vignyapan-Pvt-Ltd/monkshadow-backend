import mongoose from "mongoose";

// Define the schema for career opportunities
const careerSchema = new mongoose.Schema(
  {
    position: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    jobType: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true, trim: true },
    applicationDeadline: { type: Date, required: true },
    status: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Dynamic model getter function
const getCareerModel = (region) => {
  const collectionName = region === "canada" ? "canada_careers" : "india_careers";
  return mongoose.models[collectionName] || mongoose.model(collectionName, careerSchema, collectionName);
};

export default getCareerModel;
