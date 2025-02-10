import mongoose from "mongoose";


// Define the schema for the appointment form data
const careerFollowupSchema = new mongoose.Schema({
    careerFormId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required:true
     },
    status: {
        type: String,
        required: true,
        trim: true,  // Removes leading and trailing whitespace
    },
    followupMessage: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Create the model from the schema
//export const CareerFollowup = mongoose.model('CareerFollowup', careerFollowupSchema);

const getCareerFollowupModel = (region) => {
  const collectionName = region === "canada" ? "canada_careerFollowups" : "india_careerFollowups";
  return mongoose.models[collectionName] || mongoose.model(collectionName, careerFollowupSchema, collectionName);
};

export default getCareerFollowupModel;


