import mongoose from "mongoose";
import Job from "../../../models/Job.js";

// =====================================================
// GET ALL PUBLISHED JOBS
// GET /api/candidate/jobs
// =====================================================

export const getPublishedJobs = async (req, res) => {
  try {
    const {
      search = "",
      department = "",
      location = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      50
    );

    // Only published jobs are visible to candidates
    const filter = {
      status: "Published",
    };

    // Search by job title, department, or location
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { title: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
      ];
    }

    // Filter by department
    if (department.trim()) {
      filter.department = new RegExp(
        department.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    // Filter by location
    if (location.trim()) {
      filter.location = new RegExp(
        location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    const totalJobs = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .select(
        "title department employmentType location experience jobDescription requirements createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Published jobs fetched successfully",
      pagination: {
        currentPage,
        limit: pageLimit,
        totalJobs,
        totalPages: Math.ceil(totalJobs / pageLimit),
      },
      jobs,
    });
  } catch (error) {
    console.error("Candidate Job Listing Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch published jobs",
    });
  }
};

// =====================================================
// GET SINGLE PUBLISHED JOB
// GET /api/candidate/jobs/:jobId
// =====================================================

export const getPublishedJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Candidates can access published jobs only
    const job = await Job.findOne({
      _id: jobId,
      status: "Published",
    })
      .select(
        "title department employmentType location experience jobDescription requirements createdAt"
      )
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Published job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job details fetched successfully",
      job,
    });
  } catch (error) {
    console.error("Candidate Job Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
    });
  }
};