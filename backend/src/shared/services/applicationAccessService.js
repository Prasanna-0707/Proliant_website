import Screening from "../../modules/screener/models/Screening.js";
import Interview from "../../modules/interviewer/models/Interview.js";
import Job from "../../modules/hr/models/HRJob.js";

import {
  isActiveAccount,
  isGlobalAdministrator,
  isDepartmentAdministrator,
  isHrOrRecruiter,
  isHod,
  isL0Screener,
  isInterviewer,
  normalizeDepartment,
} from "./authorizationService.js";

// =====================================================
// APPLICATION ACCESS
//
// Decides whether a staff member may view one application
// (a Candidate record). Used by the shared application
// details and resume endpoints.
//
//   Global Administrator      -> all applications
//   HR / Recruiter            -> all applications
//   Department Administrator  -> own department only
//   HOD                       -> own department only
//   L0 Screener               -> only applications assigned to them
//   Interviewer               -> only applications with an interview
//                                assigned to them
//   Anyone else               -> denied
// =====================================================

export const canViewApplication = async (
  user,
  candidate,
  activeRole
) => {
  if (!user || !candidate || !isActiveAccount(user)) {
    return false;
  }

  if (
    isGlobalAdministrator(user, activeRole) ||
    isHrOrRecruiter(user, activeRole)
  ) {
    return true;
  }

  if (
    isDepartmentAdministrator(user, activeRole) ||
    isHod(user, activeRole)
  ) {
    // The department is the department of the JOB the candidate applied
    // for (never an interviewer department). Candidate.department is only
    // a copy of it, used for older records without a job reference.
    let applicationDepartment = candidate.department;

    if (candidate.job) {
      const job = await Job.findById(candidate.job).select("department").lean();

      applicationDepartment = job?.department || "";
    }

    return (
      Boolean(applicationDepartment) &&
      Boolean(user.department) &&
      normalizeDepartment(applicationDepartment) ===
        normalizeDepartment(user.department)
    );
  }

  if (isL0Screener(user, activeRole)) {
    const assignment = await Screening.exists({
      application: candidate._id,
      assignedTo: user._id,
      status: { $ne: "Cancelled" },
    });

    return Boolean(assignment);
  }

  if (isInterviewer(user, activeRole)) {
    const interview = await Interview.exists({
      application: candidate._id,
      assignedTo: user._id,
    });

    return Boolean(interview);
  }

  return false;
};
