import StaffNotification from "../../modules/notifications/models/StaffNotification.js";
import User from "../../modules/auth/models/Users.js";
import { toRoleKey } from "../constants/roles.js";

// Notification failures must never fail the business operation,
// so every helper here swallows (and logs) its own errors.

export const notifyStaff = async (
  recipientId,
  {
    title,
    message,
    type = "GENERAL",
    link = "",
    relatedApplication = null,
    relatedInterview = null,
    recipientModel = "User",
  }
) => {
  try {
    if (!recipientId) return null;

    return await StaffNotification.create({
      recipient: recipientId,
      recipientModel,
      title,
      message,
      type,
      link,
      relatedApplication,
      relatedInterview,
    });
  } catch (error) {
    console.error("Staff notification failed:", error.message);
    return null;
  }
};

export const notifyStaffMany = async (recipientIds, payload) => {
  const seen = new Set();

  for (const id of recipientIds || []) {
    const key = String(id || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    await notifyStaff(id, payload);
  }
};

// Active HR / Recruiter accounts (User collection).
export const getActiveHrUserIds = async () => {
  try {
    const users = await User.find({
      status: "Active",
      deletedAt: null,
    })
      .select("_id role")
      .lean();

    return users
      .filter((user) => {
        const key = toRoleKey(user.role);
        return (
          key === "HR" ||
          key === "RECRUITER"
        );
      })
      .map((user) => user._id);
  } catch (error) {
    console.error("HR lookup failed:", error.message);
    return [];
  }
};

export const notifyHr = async (payload) => {
  await notifyStaffMany(await getActiveHrUserIds(), payload);
};


// Interview evaluation submitted / corrected: tell the job's Hiring
// Managers, the person who scheduled the interview, and HR.
export const notifyEvaluationEvent = async (interview, kind) => {
  try {
    const [{ default: HiringManagerAssignment }, { default: Candidate }] =
      await Promise.all([
        import("../../modules/hiring-manager/models/HiringManagerAssignment.js"),
        import("../../modules/candidate/models/Candidate.js"),
      ]);

    const candidate = await Candidate.findById(interview.application)
      .select("name")
      .lean();

    const assignments = await HiringManagerAssignment.find({
      job: interview.job,
      status: "Active",
    })
      .select("hiringManager")
      .lean();

    const payload = {
      title:
        kind === "corrected"
          ? "Interview evaluation corrected"
          : "Interview evaluation submitted",
      message: `${interview.stageName} evaluation for ${
        candidate?.name || "a candidate"
      } was ${kind}.`,
      type: "EVALUATION",
      relatedApplication: interview.application,
      relatedInterview: interview._id,
    };

    await notifyStaffMany(
      assignments.map((item) => item.hiringManager),
      { ...payload, link: "/hiring-manager/evaluations" }
    );

    if (interview.assignedByModel === "User") {
      await notifyStaff(interview.assignedBy, payload);
    }

    await notifyHr(payload);
  } catch (error) {
    console.error("Evaluation notification failed:", error.message);
  }
};