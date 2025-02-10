import getCareerFollowupModel from '../models/career_followup.model.js';

// Add a new follow-up
export const addCareerFollowup = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerFollowup = getCareerFollowupModel(region);
        const { careerFormId, status, followupMessage } = req.body;

        // Validate required fields
        if (!careerFormId || !status || !followupMessage) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        const followup = new CareerFollowup({
            careerFormId,
            status,
            followupMessage
        });

        await followup.save();
        res.status(201).json({ followup, success: true });
    } catch (error) {
        console.error('Error adding follow-up:', error);
        res.status(500).json({ message: 'Failed to add follow-up', success: false });
    }
};

// Get all follow-ups
export const getCareerFollowups = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerFollowup = getCareerFollowupModel(region);
        const followups = await CareerFollowup.find();
        if (!followups) {
            return res.status(404).json({ message: 'No follow-ups found', success: false });
        }
        return res.status(200).json({ followups, success: true });
    } catch (error) {
        console.error('Error fetching follow-ups:', error);
        res.status(500).json({ message: 'Failed to fetch follow-ups', success: false });
    }
};

// Get follow-up by ID
export const getCareerFollowupById = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerFollowup = getCareerFollowupModel(region);
        const { id } = req.params;
        const followup = await CareerFollowup.findById(id);

        if (!followup) {
            return res.status(404).json({ message: 'Follow-up not found', success: false });
        }
        return res.status(200).json({ followup, success: true });
    } catch (error) {
        console.error('Error fetching follow-up by ID:', error);
        res.status(500).json({ message: 'Failed to fetch follow-up', success: false });
    }
};

// Update follow-up by ID
export const updateCareerFollowup = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerFollowup = getCareerFollowupModel(region);
        const { id } = req.params;
        const { careerFormId, status, followupMessage } = req.body;

        const updatedData = { careerFormId, status, followupMessage };

        const followup = await CareerFollowup.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!followup) {
            return res.status(404).json({ message: 'Follow-up not found', success: false });
        }
        return res.status(200).json({ followup, success: true });
    } catch (error) {
        console.error('Error updating follow-up:', error);
        res.status(500).json({ message: 'Failed to update follow-up', success: false });
    }
};

// Delete follow-up by ID
export const deleteCareerFollowup = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerFollowup = getCareerFollowupModel(region);
        const { id } = req.params;

        const followup = await CareerFollowup.findByIdAndDelete(id);

        if (!followup) {
            return res.status(404).json({ message: 'Follow-up not found', success: false });
        }
        return res.status(200).json({ message: 'Follow-up deleted successfully', success: true });
    } catch (error) {
        console.error('Error deleting follow-up:', error);
        res.status(500).json({ message: 'Failed to delete follow-up', success: false });
    }
};
