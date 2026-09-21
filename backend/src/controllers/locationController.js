import Location from "../models/Location.js";

// GET all locations
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();

    res.status(200).json({
      success: true,
      locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
      error: error.message,
    });
  }
};


// POST - Add a new location
export const addLocation = async (req, res) => {
  try {
    const {
      country,
      state,
      city,
      companyName,
      address,
      latitude,
      longitude,
      phone,
      email,
    } = req.body;

    const location = await Location.create({
      country,
      state,
      city,
      companyName,
      address,
      latitude,
      longitude,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Location added successfully",
      location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add location",
      error: error.message,
    });
  }
};


// PUT - Update a location
export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message,
    });
  }
};


// DELETE - Delete a location
export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(
      req.params.id
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete location",
      error: error.message,
    });
  }
};