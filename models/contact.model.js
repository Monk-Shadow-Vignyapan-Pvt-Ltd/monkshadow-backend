import mongoose from "mongoose";

// Define the schema for contacts
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    message: { type: String, required: false, trim: true },
    companyName: { type: String, required: false, trim: true },
    websiteUrl: { type: String, required: false, trim: true },
    pageName: { type: String, required: false, trim: true },
    isContactClose: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Dynamic model getter function
const getContactModel = (region) => {
  const collectionName = region === "canada" ? "canada_contacts" : "india_contacts"; 
  return mongoose.models[collectionName] || mongoose.model(collectionName, contactSchema, collectionName);
};

export default getContactModel;
