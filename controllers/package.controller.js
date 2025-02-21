import getPackageModel from "../models/package.model.js";

// Add a new package
export const addPackage_ = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Package = getPackageModel(region);

    const { packageName, services, noOfPages, domesticPrice, duration, lockingPeriod,internationalPrice,note } = req.body;

    if (!packageName || !services ) {
      return res.status(400).json({ message: "Please provide all required fields", success: false });
    }
       

    console.log(packageName);
    // Create a new Package document
    const newPackage = new Package({ packageName, services, noOfPages, lockingPeriod,domesticPrice,internationalPrice,duration,note });
    await newPackage.save();

    

    res.status(201).json({ message: "Package added successfully", package: newPackage, success: true });
  } catch (error) {
    console.error("Error adding/updating Package:", error);
    res.status(500).json({ message: "Failed to process the request", success: false });
  }
};

export const getPackages = async (req, res) => {
    try {
      const region = req.baseUrl.includes("/canada") ? "canada" : "india";
      const Package = getPackageModel(region);
        const packages = await Package.find();
        console.log("packages",packages);
        
        if (!packages) {
          return res.status(404).json({ message: "No packages found", success: false });
        }
        const reversedPackages = packages.reverse();
        const page = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const limit = 12;

        // Calculate the start and end indices for pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Paginate the reversed movies array
        const paginatedPackage = reversedPackages.slice(startIndex, endIndex);
        return res.status(200).json({ 
            packages:paginatedPackage, 
            success: true ,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(packages.length / limit),
            totalusers: packages.length,
        },});
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Failed to fetch packages', success: false });
    }
};

// Update a package
export const updatePackage = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Package = getPackageModel(region);

    const { id } = req.params;
    const { packageName, services, noOfPages, lockingPeriod,domesticPrice, internationalPrice,duration, note } = req.body;

    const updatedData = { packageName, services, noOfPages,lockingPeriod,domesticPrice,internationalPrice,duration,note};

    const package_ = await Package.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!package_) return res.status(404).json({ message: "Package not found!", success: false });

    return res.status(200).json({ package_, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Package = getPackageModel(region);

    const { id } = req.params;

    const package_ = await Package.findByIdAndDelete(id);

    if (!package_) {
      return res.status(404).json({ message: "package not found", success: false });
    }
    return res.status(200).json({ message: "package deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting package", error);
    res.status(500).json({ message: "Failed to delete package", success: false });
  }
};

export const searchPackages = async (req, res) => {
    try {
      const region = req.baseUrl.includes("/canada") ? "canada" : "india";
      const Package = getPackageModel(region);
        const { search } = req.query;
        if (!search) {
            return res.status(400).json({ message: 'Search query is required', success: false });
        }

        const regex = new RegExp(search, 'i'); // Case-insensitive search

        const packages = await Package.find({
            $or: [
                { packageName: regex },
                { services: regex },
                { noOfPages: regex },
                { lockingPeriod: regex },
                { domesticPrice: regex },
                { internationalPrice: regex },
                { duration: regex },
                { note: regex }
            ]
        });

        if (!packages) {
            return res.status(404).json({ message: 'No packages found', success: false });
        }

        return res.status(200).json({
          packages: packages,
            success: true,
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(packages.length / 12),
                totalpackages: packages.length,
            },
        });
    } catch (error) {
        console.error('Error searching packages:', error);
        res.status(500).json({ message: 'Failed to search packages', success: false });
    }
};
