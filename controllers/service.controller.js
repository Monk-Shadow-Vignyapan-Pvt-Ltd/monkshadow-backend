import getServiceModel from "../models/service.model.js";


// Add a new Service
export const addService = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Service = getServiceModel(region);

    const { serviceName, description, message } = req.body;

    if (!serviceName || !description ) {
      return res.status(400).json({ message: "Please provide all required fields", success: false });
    }

    

    // Create a new Service document
    const newService = new Service({ serviceName, description, message });
    await newService.save();

    res.status(201).json({ message: "Service added successfully", service: newService, success: true });
  } catch (error) {
    console.error("Error adding/updating Service:", error);
    res.status(500).json({ message: "Failed to process the request", success: false });
  }
};

export const getServices = async (req, res) => {
    try {
      const region = req.baseUrl.includes("/canada") ? "canada" : "india";
      const Sertvice = getServiceModel(region);
        const service = await Sertvice.find();
        if (!service) {
          return res.status(404).json({ message: "No service found", success: false });
        }
        const reversedServices = service.reverse();
        const page = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const limit = 12;

        // Calculate the start and end indices for pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Paginate the reversed movies array
        const paginatedPackage = reversedServices.slice(startIndex, endIndex);
        return res.status(200).json({ 
            services:paginatedPackage, 
            success: true ,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(services.length / limit),
            totalusers: services.length,
        },});
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Failed to fetch services', success: false });
    }
};

// Update a servie
export const updateService = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Service = getServiceModel(region);

    const { id } = req.params;
    const { serviceName, description, message,  } = req.body;

    const updatedData = { serviceName, description, message, };

    const service_ = await Service.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!service_) return res.status(404).json({ message: "Service not found!", success: false });

    return res.status(200).json({ service_, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
};

export const deleteService = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Service = getServiceModel(region);

    const { id } = req.params;

    const service_ = await Service.findByIdAndDelete(id);

    if (!service_) {
      return res.status(404).json({ message: "service not found", success: false });
    }
    return res.status(200).json({ message: "service deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting service", error);
    res.status(500).json({ message: "Failed to delete service", success: false });
  }
};

export const searchSerives = async (req, res) => {
    try {
      const region = req.baseUrl.includes("/canada") ? "canada" : "india";
      const Serive = getServiceModel(region);
        const { search } = req.query;
        if (!search) {
            return res.status(400).json({ message: 'Search query is required', success: false });
        }

        const regex = new RegExp(search, 'i'); // Case-insensitive search

        const serives = await Serive.find({
            $or: [
                { serviceName: regex },
                { description: regex },
                { parentId: regex },
                { note: isAddOn },
                { message: regex },
            ]
        });

        if (!serives) {
            return res.status(404).json({ message: 'No serives found', success: false });
        }

        return res.status(200).json({
          serives: serives,
            success: true,
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(serives.length / 12),
                totalserives: serives.length,
            },
        });
    } catch (error) {
        console.error('Error searching serives:', error);
        res.status(500).json({ message: 'Failed to search serives', success: false });
    }
};
