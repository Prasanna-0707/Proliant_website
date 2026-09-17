import Candidate from "../models/Candidate.js";

import {
  generateCandidatesExcel,
} from "../services/excelService.js";

// =====================================================
// CREATE CANDIDATE
// =====================================================

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

    if (
      !position ||
      !areaOfInterest ||
      !name ||
      !email ||
      !phone ||
      isFresher === undefined ||
      !highestQualification ||
      !noticePeriod
    ) {
      return res.status(400).json({
        success: false,
        message: "Required candidate fields are missing",
      });
    }

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

    return res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      candidate,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Candidate creation failed",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL CANDIDATES
// =====================================================

export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      candidates,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE CANDIDATE
// =====================================================

export const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(
      req.params.id
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      candidate,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE CANDIDATE
// =====================================================

export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(
      req.params.id
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

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
      status,
    } = req.body;

    // Update only fields that were provided

    if (position !== undefined) {
      candidate.position = position;
    }

    if (areaOfInterest !== undefined) {
      candidate.areaOfInterest = areaOfInterest;
    }

    if (name !== undefined) {
      candidate.name = name;
    }

    if (email !== undefined) {
      candidate.email = email;
    }

    if (phone !== undefined) {
      candidate.phone = phone;
    }

    if (isFresher !== undefined) {
      candidate.isFresher = isFresher;
    }

    if (location !== undefined) {
      candidate.location = location;
    }

    if (yearsOfExperience !== undefined) {
      candidate.yearsOfExperience =
        yearsOfExperience;
    }

    if (highestQualification !== undefined) {
      candidate.highestQualification =
        highestQualification;
    }

    if (currentCompany !== undefined) {
      candidate.currentCompany = currentCompany;
    }

    if (noticePeriod !== undefined) {
      candidate.noticePeriod = noticePeriod;
    }

    if (coverMessage !== undefined) {
      candidate.coverMessage = coverMessage;
    }

    if (resume !== undefined) {
      candidate.resume = resume;
    }

    if (status !== undefined) {
      candidate.status = status;
    }

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      candidate,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Candidate update failed",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CANDIDATE
// =====================================================

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(
      req.params.id
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    await Candidate.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Candidate deletion failed",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CANDIDATES TO EXCEL
// =====================================================

export const exportCandidatesExcel = async (
  req,
  res
) => {
  try {
    // Get all candidates from MongoDB
    const candidates = await Candidate.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
      Resume Storage is not implemented yet.

      Later, when we build the SharePoint Resume API,
      this property will contain the actual resume URL.

      For now:
      resumeUrl = null
    */

    const candidatesForExcel = candidates.map(
      (candidate) => ({
        ...candidate,
        resumeUrl: null,
      })
    );

    // Generate Excel file
    const excelBuffer =
      await generateCandidatesExcel(
        candidatesForExcel
      );

    // Tell browser that response is an Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // File name when downloaded
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="candidates.xlsx"'
    );

    return res.status(200).send(excelBuffer);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Candidate Excel export failed",
      error: error.message,
    });
  }
};