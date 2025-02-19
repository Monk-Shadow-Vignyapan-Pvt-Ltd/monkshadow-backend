import getContactModel from "../models/contact.model.js";

// Add a new contact
export const addContact = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Contact = getContactModel(region);

    const { name, phone, email, message,companyName,pageName,websiteUrl, isContactClose,showForAll,followups } = req.body;

    if (!name || !phone || !email ) {
      return res.status(400).json({ message: "Please provide all required fields", success: false });
    }

    // Check if contact exists in the selected region
    const existingContact = await Contact.findOne({ $or: [{ email }, { phone }] });

    if (existingContact) {
      existingContact.name = name;
      existingContact.phone = phone;
      existingContact.email = email;
      existingContact.message = message;
      existingContact.companyName = companyName;
      existingContact.pageName = pageName;
      existingContact.websiteUrl = websiteUrl;
      existingContact.isContactClose = isContactClose;
      existingContact.showForAll = showForAll;
      existingContact.followups = followups;
      await existingContact.save();
      return res.status(200).json({ message: "Contact updated successfully", contact: existingContact, success: true });
    }

    // Create a new contact document
    const newContact = new Contact({ name, phone, email, message,companyName,pageName,websiteUrl, isContactClose,showForAll,followups });
    await newContact.save();

    res.status(201).json({ message: "Contact added successfully", contact: newContact, success: true });
  } catch (error) {
    console.error("Error adding/updating contact:", error);
    res.status(500).json({ message: "Failed to process the request", success: false });
  }
};

// Get all contacts
// export const getContacts = async (req, res) => {
//   try {
//     const region = req.baseUrl.includes("/canada") ? "canada" : "india";
//     const Contact = getContactModel(region);

//     const contacts = await Contact.find();
//     if (!contacts) {
//       return res.status(404).json({ message: "No contacts found", success: false });
//     }

//     return res.status(200).json({ contacts });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to fetch contacts", success: false });
//   }
// };

export const getContacts = async (req, res) => {
    try {
      const region = req.baseUrl.includes("/canada") ? "canada" : "india";
      const Contact = getContactModel(region);
        const contacts = await Contact.find();
        if (!contacts) {
          return res.status(404).json({ message: "No contacts found", success: false });
        }
        const reversedContacts = contacts.reverse();
        const page = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const limit = 12;

        // Calculate the start and end indices for pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Paginate the reversed movies array
        const paginatedContacts = reversedContacts.slice(startIndex, endIndex);
        return res.status(200).json({ 
            contacts:paginatedContacts, 
            success: true ,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(contacts.length / limit),
            totalusers: contacts.length,
        },});
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Failed to fetch contacts', success: false });
    }
};

// Update a contact
export const updateContact = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Contact = getContactModel(region);

    const { id } = req.params;
    const { name, phone, email, message,companyName,pageName,websiteUrl, isContactClose,showForAll,followups } = req.body;

    const updatedData = { name, phone, email, message,companyName,pageName,websiteUrl, isContactClose,showForAll,followups };

    const contact = await Contact.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!contact) return res.status(404).json({ message: "Contact not found!", success: false });

    return res.status(200).json({ contact, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const region = req.baseUrl.includes("/canada") ? "canada" : "india";
    const Contact = getContactModel(region);

    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found", success: false });
    }
    return res.status(200).json({ message: "Contact deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting contact", error);
    res.status(500).json({ message: "Failed to delete contact", success: false });
  }
};

export const searchContacts = async (req, res) => {
    try {
      const region = req.baseUrl.includes("/canada") ? "canada" : "india";
      const Contact = getContactModel(region);
        const { search } = req.query;
        if (!search) {
            return res.status(400).json({ message: 'Search query is required', success: false });
        }

        const regex = new RegExp(search, 'i'); // Case-insensitive search

        const contacts = await Contact.find({
            $or: [
                { name: regex },
                { phone: regex },
                { email: regex },
                { message: regex },
                { companyName: regex },
                { websiteUrl: regex },
                { pageName: regex }
            ]
        });

        if (!contacts) {
            return res.status(404).json({ message: 'No contacts found', success: false });
        }

        return res.status(200).json({
          contacts: contacts,
            success: true,
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(contacts.length / 12),
                totalContacts: contacts.length,
            },
        });
    } catch (error) {
        console.error('Error searching contacts:', error);
        res.status(500).json({ message: 'Failed to search contacts', success: false });
    }
};
