import getCareerModel from "../models/career.model.js";

// Add a new career opportunity
export const addCareer = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Career = getCareerModel(region);

    const { position, experience, city, jobType, shortDescription, jobDescription, applicationDeadline, status } = req.body;

    if (!position || !experience || !city || !jobType || !shortDescription || !jobDescription || !applicationDeadline) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const career = new Career({ position, experience, city, jobType, shortDescription, jobDescription, applicationDeadline, status });

    await career.save();
    res.status(201).json({ career, success: true });
  } catch (error) {
    console.error("Error adding career opportunity:", error);
    res.status(500).json({ message: "Failed to add career opportunity", success: false });
  }
};

// Get all career opportunities
export const getCareers = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Career = getCareerModel(region);

    const careers = await Career.find();
    return res.status(200).json({ careers, success: true });
  } catch (error) {
    console.error("Error fetching career opportunities:", error);
    res.status(500).json({ message: "Failed to fetch career opportunities", success: false });
  }
};

// Get career opportunity by ID
export const getCareerById = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Career = getCareerModel(region);

    const { id } = req.params;
    const career = await Career.findById(id);

    if (!career) {
      return res.status(404).json({ message: "Career opportunity not found", success: false });
    }
    return res.status(200).json({ career, success: true });
  } catch (error) {
    console.error("Error fetching career opportunity by ID:", error);
    res.status(500).json({ message: "Failed to fetch career opportunity", success: false });
  }
};

// Update career opportunity by ID
export const updateCareer = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Career = getCareerModel(region);

    const { id } = req.params;
    const { position, experience, city, jobType, shortDescription, jobDescription, applicationDeadline, status } = req.body;

    const updatedData = { position, experience, city, jobType, shortDescription, jobDescription, applicationDeadline, status };

    const career = await Career.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!career) {
      return res.status(404).json({ message: "Career opportunity not found", success: false });
    }
    return res.status(200).json({ career, success: true });
  } catch (error) {
    console.error("Error updating career opportunity:", error);
    res.status(500).json({ message: "Failed to update career opportunity", success: false });
  }
};

// Delete career opportunity by ID
export const deleteCareer = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Career = getCareerModel(region);

    const { id } = req.params;

    const career = await Career.findByIdAndDelete(id);

    if (!career) {
      return res.status(404).json({ message: "Career opportunity not found", success: false });
    }
    return res.status(200).json({ message: "Career opportunity deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting career opportunity:", error);
    res.status(500).json({ message: "Failed to delete career opportunity", success: false });
  }
};
