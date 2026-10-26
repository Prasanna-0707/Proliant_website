import mongoose from "mongoose";

import Application from "../../../models/Application.js";
import Job from "../../../models/Job.js";

import generateApplicationId from "../../../shared/utils/generateApplicationId.js";

import CandidateAccount from "../../../models/CandidateAccount.js";
import CandidateNotification from "../../../models/CandidateNotification.js";

export const applyForJob = async (req, res) => {
  try {
    // Candidate ID from authentication middleware
    const candidateId = req.candidate._id;

    const { jobId, resume } = req.body;

    // 1. Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // 2. Fetch Candidate Account
    const candidate = await CandidateAccount.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    // 3. Determine which resume to use
    // If a resume is provided in the request, use it.
    // Otherwise, use the resume saved in the candidate profile.
    let resumeToUse;

    if (resume !== undefined) {
      // Validate provided resume details
      if (
        !resume ||
        typeof resume.fileName !== "string" ||
        !resume.fileName.trim() ||
        typeof resume.fileUrl !== "string" ||
        !resume.fileUrl.trim() ||
        typeof resume.fileType !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid resume details",
        });
      }

      resumeToUse = {
        fileName: resume.fileName.trim(),
        fileUrl: resume.fileUrl.trim(),
        fileType: resume.fileType.toLowerCase(),
      };
    } else {
      // Use resume saved in candidate profile
      resumeToUse = candidate.resume;
    }

    // 4. Validate Resume Availability
    if (
      !resumeToUse ||
      !resumeToUse.fileName ||
      !resumeToUse.fileUrl ||
      !resumeToUse.fileType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload your resume in your profile or provide resume details",
      });
    }

    // 5. Validate Resume File Type
    const allowedFileTypes = ["pdf", "docx"];

    if (!allowedFileTypes.includes(resumeToUse.fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Only PDF and DOCX resumes are allowed",
      });
    }

    // 6. Check whether the Job exists and is Published
    const job = await Job.findOne({
      _id: jobId,
      status: "Published",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Published job not found",
      });
    }

    // 7. Check whether Candidate already applied
    const existingApplication = await Application.findOne({
      candidate: candidateId,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
        applicationId: existingApplication.applicationId,
      });
    }

    // 8. Generate Application ID
    const applicationId = await generateApplicationId();

    // 9. Create Application
    const application = await Application.create({
      applicationId,
      candidate: candidateId,
      job: jobId,

      // Save a snapshot of the selected resume
      resume: {
        fileName: resumeToUse.fileName,
        fileUrl: resumeToUse.fileUrl,
        fileType: resumeToUse.fileType.toLowerCase(),
      },

      status: "Applied",
    });

    // 10. Create Candidate Notification
      try {
        await CandidateNotification.create({
          candidate: candidateId,

          title: "Application Submitted",

          message: `Your application for ${job.title} has been submitted successfully.`,

          type: "APPLICATION",

          relatedApplication: application._id,

          isRead: false,
        });
      } catch (notificationError) {
        // Application is already created.
        // Notification failure should not fail the application request.
        console.error(
          "Application Notification Creation Error:",
          notificationError
        );
      }

    // 11. Send Response
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: {
        applicationId: application.applicationId,
        candidate: application.candidate,
        job: application.job,
        resume: application.resume,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Apply for Job Error:", error);

    // Handle duplicate application race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    // Authenticated candidate ID
    const candidateId = req.candidate._id;

    // Fetch only this candidate's applications
    const applications = await Application.find({
      candidate: candidateId,
    })
      .populate({
        path: "job",
        select: "title department employmentType location experience",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "My applications fetched successfully",
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your applications",
    });
  }
};

export const getMyApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const candidateId = req.candidate._id;

    const application = await Application.findOne({
      applicationId,
      candidate: candidateId,
    })
      .populate("job", "title department employmentType location experience")
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Get application details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
    });
  }
};
