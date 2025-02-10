import mongoose from "mongoose";

// Define the schema for contact follow-ups
const contactFollowupSchema = new mongoose.Schema(
  {
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Contact", // Reference to the Contact model
    },
    status: { type: String, required: true, trim: true },
    followupMessage: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Dynamic model getter function
const getContactFollowupModel = (region) => {
  const collectionName = region === "canada" ? "canada_contact_followups" : "india_contact_followups";
  return mongoose.models[collectionName] || mongoose.model(collectionName, contactFollowupSchema, collectionName);
};

export default getContactFollowupModel;
