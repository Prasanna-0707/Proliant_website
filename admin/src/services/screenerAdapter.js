import { formatDate } from "./format.js";
import { SCREENING_STATUS } from "../data/screenerPortalData.js";

// Converts an item of GET /screenings/applications (or the dashboard's
// recent-applications) into the shape used by the screener components.
export const toScreenerApplication = (item) => {
  const application = item.application || {};

  let status = application.status;

  // The screening itself may be started while the candidate status is still
  // "assigned"; show that as In Progress.
  if (
    item.screeningStatus === "In Progress" &&
    status === SCREENING_STATUS.ASSIGNED
  ) {
    status = SCREENING_STATUS.IN_PROGRESS;
  }

  return {
    id: application._id,
    applicationId: application._id,
    screeningId: item.screeningId,
    candidateName: application.name,
    email: application.email,
    phone: application.phone,
    jobTitle: application.job?.title || application.position,
    department: application.department || application.job?.department,
    experience: application.isFresher
      ? "Fresher"
      : `${application.yearsOfExperience ?? 0} year(s)`,
    appliedDate: formatDate(application.createdAt),
    status,
    education: application.highestQualification,
    noticePeriod: application.noticePeriod,
    currentCompany: application.currentCompany,
    coverMessage: application.coverMessage,
    location: application.location,
    remarks: item.feedback || "",
    checklist: item.checklist || null,
    screeningStatus: item.screeningStatus,
    decision: item.decision,
  };
};

// A history entry from /screenings/history -> row shown in the history modal.
export const toHistoryEntry = (entry) => ({
  action: entry.action,
  by: entry.performedByName || entry.performedByType || "System",
  date: entry.createdAt,
  remarks: entry.remarks || entry.feedback || "",
});