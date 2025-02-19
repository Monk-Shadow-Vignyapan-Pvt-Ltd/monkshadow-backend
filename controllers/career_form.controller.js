import getCareerFormModel from '../models/career_form.model.js';
import getCareerModel from "../models/career.model.js";
import sharp from 'sharp';

const processResume = async (resume) => {
    if (!resume.startsWith('data:')) {
        throw new Error('Invalid resume format');
    }

    const [metadata, base64Data] = resume.split(';base64,');
    const buffer = Buffer.from(base64Data, 'base64');

    if (metadata.includes('application/pdf')) {
        // Return base64 string for PDF
        return buffer.toString('base64');
    } else if (metadata.includes('image/jpeg') || metadata.includes('image/jpg') || metadata.includes('image/png')) {
        // Compress image using sharp
        const compressedBuffer = await sharp(buffer)
            .resize({ width: 800 }) // Resize to max width of 800px
            .jpeg({ quality: 70 }) // Compress image to 70% quality
            .toBuffer();

        return compressedBuffer.toString('base64');
    } else {
        throw new Error('Unsupported file format. Only PDF and JPG/PNG are allowed.');
    }
};

// Add a new career form entry
export const addCareerForm = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerForm = getCareerFormModel(region);
        const { name, phone, email, resume, city, readytoRelocate, allowYoutoContact, careerId,isCareerClose, followups} = req.body;

        if (!resume) {
            return res.status(400).json({ message: 'Resume is required', success: false });
        }

        const processedResume = await processResume(resume);

         // Check if contact exists in the selected region
    const existingCareerForm = await CareerForm.findOne({ $or: [{ email }, { phone }] });

    if (existingCareerForm) {
        existingCareerForm.name = name;
        existingCareerForm.phone = phone;
        existingCareerForm.email = email;
        existingCareerForm.resume = processedResume;
        existingCareerForm.city = city;
        existingCareerForm.readytoRelocate = readytoRelocate;
        existingCareerForm.allowYoutoContact = allowYoutoContact;
        existingCareerForm.isContactClose = isContactClose;
        existingCareerForm.careerId = careerId;
        existingCareerForm.isCareerClose = isCareerClose;
        existingCareerForm.followups = followups;
      await existingCareerForm.save();
      return res.status(200).json({ message: "Career form updated successfully", careerForm: existingCareerForm, success: true });
    }

        // Create and save the career form details in MongoDB
        const careerForm = new CareerForm({
            name,
            phone,
            email,
            resume: processedResume, // Store processed resume
            city,
            readytoRelocate,
            allowYoutoContact,
            careerId,
            isCareerClose,followups 
        });

        await careerForm.save();
        res.status(201).json({ careerForm, success: true });
    } catch (error) {
        console.error('Error adding career form:', error);
        res.status(500).json({ message: error.message || 'Failed to add career form', success: false });
    }
};

// Get all career form entries
// export const getCareerForms = async (req, res) => {
//     try {
//         const region = req.baseUrl.includes("/canada") ? "canada" : "india";
//         const CareerForm = getCareerFormModel(region);
//         const careerForms = await CareerForm.find();
//         if (!careerForms) return res.status(404).json({ message: "No career forms found", success: false });
//         return res.status(200).json({ careerForms, success: true });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Failed to fetch career forms', success: false });
//     }
// };

export const getCareerForms = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerForm = getCareerFormModel(region);
        const Career = getCareerModel(region);
        const careerForms = await CareerForm.find();
        if (!careerForms) {
          return res.status(404).json({ message: "No career forms found", success: false });
        }
        const reversedCareerForms = careerForms.reverse();
        const page = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const limit = 12;

        // Calculate the start and end indices for pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Paginate the reversed movies array
        const paginatedCareerForms = reversedCareerForms.slice(startIndex, endIndex);

        const enhancedCareerForms = await Promise.all(
            paginatedCareerForms.map(async (careerForm) => {
                if (careerForm.careerId) {
                    const career = await Career.findOne({ _id: careerForm.careerId });
                    return { ...careerForm.toObject(), career }; // Convert Mongoose document to plain object
                }
                return careerForm.toObject(); // If no invoiceId, return appointment as-is
            })
        );
        return res.status(200).json({ 
            careerForms:enhancedCareerForms, 
            success: true ,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(careerForms.length / limit),
            totalusers: careerForms.length,
        },});
    } catch (error) {
        console.error('Error fetching career forms:', error);
        res.status(500).json({ message: 'Failed to fetch career forms', success: false });
    }
};

// Get career form by ID
export const getCareerFormById = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerForm = getCareerFormModel(region);
        const careerForm = await CareerForm.findById(req.params.id);
        if (!careerForm) return res.status(404).json({ message: "Career form not found", success: false });
        return res.status(200).json({ careerForm, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch career form', success: false });
    }
};

// Update career form by ID
export const updateCareerForm = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerForm = getCareerFormModel(region);
        const { id } = req.params;
        const { name, phone, email, resume, city, readytoRelocate, allowYoutoContact, careerId,isCareerClose,followups  } = req.body;

        let updatedData = { name, phone, email, city, readytoRelocate, allowYoutoContact, careerId,isCareerClose,followups  };

        if (resume) {
            updatedData.resume = await processResume(resume);
        }

        const careerForm = await CareerForm.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!careerForm) return res.status(404).json({ message: "Career form not found", success: false });
        return res.status(200).json({ careerForm, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete career form by ID
export const deleteCareerForm = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerForm = getCareerFormModel(region);
        const { id } = req.params;
        const careerForm = await CareerForm.findByIdAndDelete(id);
        if (!careerForm) return res.status(404).json({ message: "Career form not found", success: false });
        return res.status(200).json({ message: "Career form deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete career form', success: false });
    }
};

export const searchCareerForms = async (req, res) => {
    try {
        const region = req.baseUrl.includes("/canada") ? "canada" : "india";
        const CareerForm = getCareerFormModel(region);
        const Career = getCareerModel(region);
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ message: 'Search query is required', success: false });
        }

        const regex = new RegExp(search, 'i'); // Case-insensitive search

        // Fetch CareerForms
        const careerForms = await CareerForm.find({
            $or: [
                { name: regex },
                { phone: regex },
                { email: regex },
                { city: regex }
            ]
        });

        // Fetch Careers
        const careers = await Career.find({
            $or: [
                { position: regex },
                { experience: regex },
                { jobType: regex },
                { city: regex },
                { shortDescription: regex },
                { jobDescription: regex },
                { applicationDeadline: regex },
            ]
        });

        // Merge both results
        const mergedResults = [...careerForms, ...careers];

        if (mergedResults.length === 0) {
            return res.status(404).json({ message: 'No matching results found', success: false });
        }

        const enhancedCareerForms = await Promise.all(
            mergedResults.map(async (careerForm) => {
                if (careerForm.careerId) {
                    const career = await Career.findOne({ _id: careerForm.careerId });
                    return { ...careerForm.toObject(), career }; // Convert Mongoose document to plain object
                }
                return careerForm.toObject(); // If no invoiceId, return appointment as-is
            })
        );

        return res.status(200).json({
            careerForms: enhancedCareerForms,
            success: true,
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(mergedResults.length / 12),
                totalResults: mergedResults.length,
            },
        });
    } catch (error) {
        console.error('Error searching CareerForms and Careers:', error);
        res.status(500).json({ message: 'Failed to search CareerForms and Careers', success: false });
    }
};

