import Candidate from "../models/Candidate.js";

// Create a new candidate application
export const createCandidate = async (req, res) => {
  try {
    const {
      position,
      areaOfInterest,
      name,
      email,
      phone,
      isFresher,
      location,
      yearsOfExperience,
      highestQualification,
      currentCompany,
      noticePeriod,
      coverMessage,
      resume,
    } = req.body;

    const candidate = await Candidate.create({
      position,
      areaOfInterest,
      name,
      email,
      phone,
      isFresher,
      location,
      yearsOfExperience,
      highestQualification,
      currentCompany,
      noticePeriod,
      coverMessage,
      resume,
    });

    res.status(201).json({
      success: true,
      message: "Candidate application submitted successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit candidate application",
      error: error.message,
    });
  }
};
// Get all candidates
export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};

// Get a single candidate
export const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate",
      error: error.message,
    });
  }
};

// Update a candidate
export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update candidate",
      error: error.message,
    });
  }
};

// Delete a candidate
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete candidate",
      error: error.message,
    });
  }
};

