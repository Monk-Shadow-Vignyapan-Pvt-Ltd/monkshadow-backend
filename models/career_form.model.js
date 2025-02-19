import mongoose from "mongoose";


// Define the schema for the appointment form data
const careerFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'], // Basic email validation
    },
    resume: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    readytoRelocate: {
        type: Boolean,
        required: true,
        trim: true,
    },
    allowYoutoContact: {
        type: Boolean,
        required: true,
        trim: true,
    },
    careerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,  // Removes leading and trailing whitespace
    },
    isCareerClose:{
        type: Boolean,
        required: true,
    },
    status: { type: String, required: false, trim: true },
    followupMessage: { type: String, required: false, trim: true }, 
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Create the model from the schema
//export const CareerForm = mongoose.model('CareerForm', careerFormSchema);

const getCareerFormModel = (region) => {
  const collectionName = region === "canada" ? "canada_careerForms" : "india_careerForms";
  return mongoose.models[collectionName] || mongoose.model(collectionName, careerFormSchema, collectionName);
};

export default getCareerFormModel;
