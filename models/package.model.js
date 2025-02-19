import mongoose from "mongoose";

// Define the schema for contacts
const packageSchema = new mongoose.Schema(
  {
    packageName: { type: String, required: true, trim: true },
    services: { type: mongoose.Schema.Types.Mixed, required: false },
    noOfPages: { type: String, required: false },
    domesticPrice: { type: Number, required: false },
    duration: { type: String, required: false },
    lockingPeriod: { type: String, required: false },
    internationalPrice: { type: Number, required: false },
    note: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Dynamic model getter function
const getPackageModel = (region) => {
  const collectionName =
    region === "canada" ? "canada_packages" : "india_packages";
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, packageSchema, collectionName)
  );
};

export default getPackageModel;
