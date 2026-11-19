// Status values used by the L0 screening workflow. These match the
// statuses returned by the backend (Candidate.status). All application data
// itself now comes from the /api/screenings endpoints.

export const SCREENING_STATUS = {
  ASSIGNED: "ASSIGNED_TO_L0",
  IN_PROGRESS: "L0_IN_PROGRESS",
  SHORTLISTED: "L0_SHORTLISTED",
  REJECTED: "L0_REJECTED",
  ON_HOLD: "L0_ON_HOLD",
  HR_REVIEW: "HR_REVIEW_REQUIRED",
  L1_PENDING: "L1_PENDING",
};