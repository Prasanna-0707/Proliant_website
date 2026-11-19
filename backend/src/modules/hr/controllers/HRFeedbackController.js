import Contact from "../models/HRFeedback.js";
import { sendError } from "../../../shared/utils/httpErrors.js";

// Create a new enquiry
export const createContact = async (req, res) => {
  try {
    const { name, email, company, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      company,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      contact,
    });
  } catch (error) {
    return sendError(res, error, "Failed to submit enquiry");
  }
};

// Get all enquiries
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch enquiries");
  }
};

// Get a single enquiry
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch enquiry");
  }
};

// Update enquiry status
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully",
      contact,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update enquiry status");
  }
};

// Delete an enquiry
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete enquiry");
  }
};