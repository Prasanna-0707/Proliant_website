import CandidateAccount from "../../../models/CandidateAccount.js";

// Get Candidate Profile
export const getCandidateProfile = async (req, res) => {
  try {
    const candidate = await CandidateAccount.findById(req.candidate._id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate profile fetched successfully",
      candidate: {
        id: candidate._id,
        candidateId: candidate.candidateId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        isActive: candidate.isActive,
        resume: candidate.resume || null,
        createdAt: candidate.createdAt,
      },
    });
  } catch (error) {
    console.error("Candidate Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update Candidate Profile
export const updateCandidateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const allowedFields = ["name", "phone"];

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Fields not allowed: ${invalidFields.join(", ")}`,
      });
    }

    if (name === undefined && phone === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide name or phone to update",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty",
        });
      }
    }

    const candidate = await CandidateAccount.findById(req.candidate._id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    if (name !== undefined) {
      candidate.name = name.trim();
    }

    if (phone !== undefined) {
      candidate.phone = phone.trim();
    }

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      candidate: {
        id: candidate._id,
        candidateId: candidate.candidateId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        isActive: candidate.isActive,
        resume: candidate.resume || null,
        createdAt: candidate.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Candidate Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Add or Update Candidate Resume
export const updateCandidateResume = async (req, res) => {
  try {
    const { fileName, fileUrl, fileType } = req.body;

    // Validate required fields
    if (!fileName || !fileUrl || !fileType) {
      return res.status(400).json({
        success: false,
        message: "fileName, fileUrl and fileType are required",
      });
    }

    if (
      typeof fileName !== "string" ||
      typeof fileUrl !== "string" ||
      typeof fileType !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume details",
      });
    }

    const normalizedFileType = fileType.toLowerCase();

    if (!["pdf", "docx"].includes(normalizedFileType)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF and DOCX resumes are allowed",
      });
    }

    // Find logged-in candidate
    const candidate = await CandidateAccount.findById(req.candidate._id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    // Save resume details
    candidate.resume = {
      fileName: fileName.trim(),
      fileUrl: fileUrl.trim(),
      fileType: normalizedFileType,
      uploadedAt: new Date(),
    };

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate resume updated successfully",
      resume: candidate.resume,
    });
  } catch (error) {
    console.error("Update Candidate Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete Candidate Resume
export const deleteCandidateResume = async (req, res) => {
  try {
    const candidate = await CandidateAccount.findById(req.candidate._id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    if (!candidate.resume || !candidate.resume.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "No resume found in candidate profile",
      });
    }

    candidate.resume = {
      fileName: null,
      fileUrl: null,
      fileType: null,
      uploadedAt: null,
    };

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate resume deleted successfully",
      resume: candidate.resume,
    });
  } catch (error) {
    console.error("Delete Candidate Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};