import Application from "../../../models/Application.js";
import Job from "../../../models/Job.js";


export const getCandidateDashboard = async (req, res) => {
  try {
    const candidateId = req.candidate._id;

    // 1. Get candidate's latest application
    const currentApplication = await Application.findOne({
      candidate: candidateId,
      status: { $ne: "Withdrawn" },
    })
      .populate(
        "job",
        "title department employmentType location experience"
      )
      .sort({ createdAt: -1 })
      .lean();

    // 2. Get all application job IDs for this candidate
    const candidateApplications = await Application.find({
      candidate: candidateId,
    })
      .select("job")
      .lean();

    const appliedJobIds = candidateApplications.map(
      (application) => application.job
    );

    // 3. Get recommended jobs
    // For now: published jobs candidate has not applied to

    const currentDepartment = currentApplication?.job?.department;

    const recommendedJobs = currentDepartment
    ? await Job.find({
        status: "Published",
        department: currentDepartment,
        _id: { $nin: appliedJobIds },
        })
        .select("title department employmentType location experience")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()
    : [];

    // 4. Count all published jobs
    const totalPublishedJobs = await Job.countDocuments({
      status: "Published",
    });

    // 5. Application summary
    const applicationSummary = await Application.aggregate([
      {
        $match: {
          candidate: candidateId,
          status: { $ne: "Withdrawn" },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      totalApplications: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };

    applicationSummary.forEach((item) => {
      summary.totalApplications += item.count;

      switch (item._id) {
        case "Applied":
          summary.applied = item.count;
          break;

        case "Screening":
          summary.screening = item.count;
          break;

        case "Interview":
          summary.interview = item.count;
          break;

        case "Selected":
          summary.selected = item.count;
          break;

        case "Rejected":
          summary.rejected = item.count;
          break;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        candidate: {
          name:
            req.candidate.name ||
            req.candidate.fullName ||
            "Candidate",
        },

        applicationSummary: summary,

        currentApplication: currentApplication
          ? {
              applicationId: currentApplication.applicationId,
              job: currentApplication.job,
              status: currentApplication.status,
              appliedAt: currentApplication.createdAt,
              hiringStages: currentApplication.hiringStages,
            }
          : null,

        recommendedJobs,

        exploreJobs: {
          totalPublishedJobs,
        },
      },
    });
  } catch (error) {
    console.error("Get candidate dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate dashboard",
    });
  }
};