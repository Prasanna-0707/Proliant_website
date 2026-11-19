import Candidate from "../../modules/candidate/models/Candidate.js";
import Application from "../../modules/candidate/models/Application.js";
import CandidateNotification from "../../modules/candidate/models/CandidateNotification.js";

// =====================================================
// PORTAL APPLICATION <-> REGISTRATION LINK
//
// A candidate portal Application (one per job) is linked to a
// Candidate registration record. The registration is what HR
// review, L0 screening, interviews and hiring decisions work on.
// The two stay separate records; this service keeps them in sync.
// =====================================================

// Finds the registration for (account email, job) or creates one.
// Never creates a second registration for the same email and job.
export const getOrCreateRegistration = async ({
  account,
  job,
  resume,
}) => {
  const email = String(account.email || "").trim().toLowerCase();

  const existing = await Candidate.findOne({
    email,
    job: job._id,
  });

  if (existing) {
    if (!existing.portalAccount) {
      existing.portalAccount = account._id;
      await existing.save();
    }

    return { registration: existing, created: false };
  }

  const registration = await Candidate.create({
    source: "PORTAL",
    portalAccount: account._id,
    position: job.title,
    name: account.name,
    email,
    phone: account.phone,
    location: "",
    resume: resume?.fileUrl || undefined,
    job: job._id,
    department: job.department || "",
    currentStage: "L0_SCREENING",
    assignedScreener: null,
    status: "New",
  });

  return { registration, created: true };
};

// Position of a workflow stage among the job's enabled INTERVIEW stages.
export const getInterviewStageIndex = (job, stageCode) => {
  const interviewStages = (job?.interviewWorkflow || [])
    .filter((stage) => stage.isEnabled && stage.stageType === "INTERVIEW")
    .sort((a, b) => a.stageOrder - b.stageOrder);

  return interviewStages.findIndex(
    (stage) => stage.stageCode === stageCode
  );
};

const EVENT_TEXT = {
  ASSIGNED: {
    status: "Screening",
    title: "Application under review",
    message: "Your application has been assigned to a screener for review.",
    type: "STATUS_UPDATE",
  },
  SHORTLISTED: {
    status: "Screening",
    title: "You have been shortlisted",
    message:
      "Good news: your application passed the initial screening. An interview will be scheduled soon.",
    type: "STATUS_UPDATE",
  },
  SCREENING_REJECTED: {
    status: "Rejected",
    title: "Application update",
    message:
      "Thank you for your interest. We will not be moving forward with your application at this time.",
    type: "STATUS_UPDATE",
  },
  INTERVIEW_SCHEDULED: {
    status: "Interview",
    title: "Interview scheduled",
    message: "An interview has been scheduled for your application.",
    type: "INTERVIEW",
  },
  INTERVIEW_RESCHEDULED: {
    status: "Interview",
    title: "Interview rescheduled",
    message: "Your interview has been rescheduled.",
    type: "INTERVIEW",
  },
  INTERVIEW_CANCELLED: {
    status: "Interview",
    title: "Interview cancelled",
    message:
      "Your interview has been cancelled. We will contact you about next steps.",
    type: "INTERVIEW",
  },
  ADVANCED: {
    status: "Interview",
    title: "You are moving forward",
    message: "Your application has advanced to the next stage.",
    type: "STATUS_UPDATE",
  },
  REJECTED: {
    status: "Rejected",
    title: "Application update",
    message:
      "Thank you for your time. We will not be moving forward with your application.",
    type: "STATUS_UPDATE",
  },
  SELECTED: {
    status: "Selected",
    title: "Congratulations!",
    message: "You have been selected. HR will contact you with next steps.",
    type: "STATUS_UPDATE",
  },
};

const sortedStages = (application, stageType) =>
  application.hiringStages
    .filter((stage) => stage.stageType === stageType)
    .sort((a, b) => a.stageOrder - b.stageOrder);

// Applies a workflow event to every portal application linked to the
// registration, and notifies the candidate. Never throws.
export const applyPortalEvent = async (
  registrationId,
  event,
  { interviewIndex = -1, scheduledAt = null } = {}
) => {
  try {
    const text = EVENT_TEXT[event];

    if (!registrationId || !text) return;

    const applications = await Application.find({
      registration: registrationId,
    });

    for (const application of applications) {
      const now = new Date();
      const screeningStage = sortedStages(application, "Screening")[0];
      const interviewStage =
        interviewIndex >= 0
          ? sortedStages(application, "Interview")[interviewIndex]
          : null;
      const decisionStage = sortedStages(application, "Decision")[0];

      application.status = text.status;

      switch (event) {
        case "ASSIGNED":
          break;

        case "SHORTLISTED":
          if (screeningStage) {
            screeningStage.status = "Completed";
            screeningStage.result = "Passed";
            screeningStage.completedAt = now;
          }
          application.screening.result = "Passed";
          application.screening.reviewedAt = now;
          break;

        case "SCREENING_REJECTED":
          if (screeningStage) {
            screeningStage.status = "Failed";
            screeningStage.result = "Rejected";
            screeningStage.completedAt = now;
          }
          application.screening.result = "Failed";
          application.screening.reviewedAt = now;
          break;

        case "INTERVIEW_SCHEDULED":
        case "INTERVIEW_RESCHEDULED":
          if (interviewStage) {
            interviewStage.status = "In Progress";
            interviewStage.scheduledAt = scheduledAt;
            interviewStage.startedAt = interviewStage.startedAt || now;
          }
          break;

        case "INTERVIEW_CANCELLED":
          if (interviewStage) {
            interviewStage.status = "Pending";
            interviewStage.scheduledAt = null;
          }
          break;

        case "ADVANCED":
          if (interviewStage) {
            interviewStage.status = "Completed";
            interviewStage.result = "Passed";
            interviewStage.completedAt = now;
          }
          break;

        case "REJECTED":
          if (interviewStage) {
            interviewStage.status = "Failed";
            interviewStage.result = "Rejected";
            interviewStage.completedAt = now;
          }
          application.interviewFailedAt = now;
          break;

        case "SELECTED":
          if (interviewStage) {
            interviewStage.status = "Completed";
            interviewStage.result = "Passed";
            interviewStage.completedAt = now;
          }
          if (decisionStage) {
            decisionStage.status = "Completed";
            decisionStage.result = "Selected";
            decisionStage.completedAt = now;
          }
          break;

        default:
          break;
      }

      await application.save();

      await CandidateNotification.create({
        candidate: application.candidate,
        title: text.title,
        message: text.message,
        type: text.type,
        relatedApplication: application._id,
      });
    }
  } catch (error) {
    console.error("Portal application sync failed:", error.message);
  }
};
