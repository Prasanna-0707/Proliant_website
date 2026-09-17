import Job from "../models/Job.js";

// =====================================================
// GET ALL JOBS
// =====================================================

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE JOB
// =====================================================

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE JOB
// =====================================================

export const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      employmentType,
      location,
      status,
      jobDescription,
      requirements,
    } = req.body;

    if (
      !title ||
      !department ||
      !employmentType ||
      !location ||
      !jobDescription ||
      !requirements
    ) {
      return res.status(400).json({
        success: false,
        message: "All required job fields must be provided",
      });
    }

    const job = await Job.create({
      title,
      department,
      employmentType,
      location,
      status,
      jobDescription,
      requirements,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE JOB
// =====================================================

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE JOB
// =====================================================

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};