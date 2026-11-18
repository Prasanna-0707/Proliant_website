
import Admin from "../../../models/Admin.js";
import Employee from "../../../models/Employee.js";
import Job from "../../../models/job.js";
import Candidate from "../../../models/Candidate.js";
import AuditLog from "../../../models/AuditLog.js";

import Screening from "../../screener/models/Screening.js";
import Interview from "../../interviewer/models/Interview.js";

import ApplicationDecision from "../../hiring-manager/models/ApplicationDecision.js";
import HiringManagerAssignment from "../../hiring-manager/models/HiringManagerAssignment.js";

import {
  getTeamDirectoryAccess,
} from "../services/authorizationService.js";

// =====================================================
// HELPERS
// =====================================================

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getGroupedCounts = async (Model, filter, field) => {
  const results = await Model.aggregate([
    { $match: filter },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
  ]);

  return results.reduce((counts, item) => {
    const key =
      item._id === null || item._id === undefined
        ? "Unspecified"
        : String(item._id);

    counts[key] = item.count;
    return counts;
  }, {});
};

const getTotal = (counts = {}) =>
  Object.values(counts).reduce(
    (total, count) => total + count,
    0
  );

const getCount = (counts = {}, key) =>
  counts[key] || 0;

// =====================================================
// GET ADMIN DASHBOARD
// GET /api/admin/dashboard
// =====================================================

export const getAdminDashboard = async (req, res) => {
  try {
    // 1. VERIFY ADMINISTRATOR ACCESS

    const access =
      req.adminAccess ||
      getTeamDirectoryAccess(req.admin, req.activeRole);

    if (
      !access ||
      !["GLOBAL", "DEPARTMENT_ADMIN"].includes(access.type)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view the Administrator dashboard.",
      });
    }

    const isGlobal = access.type === "GLOBAL";

    // 2. DEPARTMENT FILTERS

    const departmentRegex = isGlobal
      ? null
      : new RegExp(
          `^${escapeRegex(access.department)}$`,
          "i"
        );

    const adminFilter = {
      deletedAt: null,
      ...(isGlobal ? {} : { department: departmentRegex }),
    };

    const employeeFilter = isGlobal
      ? {}
      : { department: departmentRegex };

    const jobFilter = isGlobal
      ? {}
      : { department: departmentRegex };

    const auditFilter = isGlobal
      ? {}
      : { department: departmentRegex };

    // 3. GET DEPARTMENT ADMINISTRATORS AND JOBS

    const [departmentJobIds, departmentAdminIds] =
      await Promise.all([
        Job.distinct("_id", jobFilter),
        Admin.distinct("_id", adminFilter),
      ]);

    const screeningFilter = isGlobal
      ? {}
      : { assignedTo: { $in: departmentAdminIds } };

    const interviewFilter = isGlobal
      ? {}
      : { job: { $in: departmentJobIds } };

    const decisionFilter = isGlobal
      ? {}
      : { job: { $in: departmentJobIds } };

    const assignmentFilter = isGlobal
      ? {}
      : { job: { $in: departmentJobIds } };

    // 4. FETCH DASHBOARD STATISTICS

    const now = new Date();

    const [
      adminStatusCounts,
      employeeStatusCounts,
      jobStatusCounts,
      candidateStatusCounts,
      screeningStatusCounts,
      screeningDecisionCounts,
      interviewStatusCounts,
      evaluationStatusCounts,
      recommendationCounts,
      hiringDecisionCounts,
      hiringAssignmentStatusCounts,
      upcomingInterviews,
      recentActivity,
    ] = await Promise.all([
      getGroupedCounts(Admin, adminFilter, "status"),

      getGroupedCounts(Employee, employeeFilter, "status"),

      getGroupedCounts(Job, jobFilter, "status"),

      // Candidate has no job/department reference.
      // Department candidate totals cannot be calculated
      // reliably until that relationship is added.
      isGlobal
        ? getGroupedCounts(Candidate, {}, "status")
        : Promise.resolve(null),

      getGroupedCounts(Screening, screeningFilter, "status"),

      getGroupedCounts(Screening, screeningFilter, "decision"),

      getGroupedCounts(Interview, interviewFilter, "status"),

      getGroupedCounts(
        Interview,
        interviewFilter,
        "evaluation.status"
      ),

      getGroupedCounts(
        Interview,
        interviewFilter,
        "evaluation.recommendation"
      ),

      getGroupedCounts(
        ApplicationDecision,
        decisionFilter,
        "decision"
      ),

      getGroupedCounts(
        HiringManagerAssignment,
        assignmentFilter,
        "status"
      ),

      Interview.countDocuments({
        ...interviewFilter,
        scheduledAt: { $gte: now },
        status: {
          $in: ["Scheduled", "Confirmed", "Rescheduled"],
        },
      }),

      AuditLog.find(auditFilter)
        .select(
          "_id actorName actorEmail roleUsed action targetType targetLabel department createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // 5. BUILD DASHBOARD RESPONSE

    const dashboard = {
      generatedAt: now,

      scope: {
        type: access.type,
        department: access.department || null,
      },

      administrators: {
        total: getTotal(adminStatusCounts),
        active: getCount(adminStatusCounts, "Active"),
        inactive: getCount(adminStatusCounts, "Inactive"),
      },

      employees: {
        total: getTotal(employeeStatusCounts),
        active: getCount(employeeStatusCounts, "Active"),
        inactive: getCount(employeeStatusCounts, "Inactive"),
      },

      jobs: {
        total: getTotal(jobStatusCounts),
        published: getCount(jobStatusCounts, "Published"),
        draft: getCount(jobStatusCounts, "Draft"),
        byStatus: jobStatusCounts,
      },

      candidates: isGlobal
        ? {
            available: true,
            total: getTotal(candidateStatusCounts),
            new: getCount(candidateStatusCounts, "New"),
            shortlisted: getCount(candidateStatusCounts, "Shortlisted"),
            interview: getCount(candidateStatusCounts, "Interview"),
            selected: getCount(candidateStatusCounts, "Selected"),
            rejected: getCount(candidateStatusCounts, "Rejected"),
            onHold: getCount(candidateStatusCounts, "On Hold"),
            byStatus: candidateStatusCounts,
          }
        : {
            available: false,
            reason:
              "Department-specific candidate statistics are unavailable because Candidate records do not currently reference a job or department.",
          },

      screenings: {
        total: getTotal(screeningStatusCounts),
        pending: getCount(screeningStatusCounts, "Pending"),
        completed: getCount(screeningStatusCounts, "Completed"),

        decisions: {
          selected: getCount(screeningDecisionCounts, "Selected"),
          rejected: getCount(screeningDecisionCounts, "Rejected"),
          onHold: getCount(screeningDecisionCounts, "On Hold"),
        },
      },

      interviews: {
        total: getTotal(interviewStatusCounts),
        scheduled: getCount(interviewStatusCounts, "Scheduled"),
        confirmed: getCount(interviewStatusCounts, "Confirmed"),
        completed: getCount(interviewStatusCounts, "Completed"),
        rescheduled: getCount(interviewStatusCounts, "Rescheduled"),
        cancelled: getCount(interviewStatusCounts, "Cancelled"),
        noShow: getCount(interviewStatusCounts, "No-Show"),
        upcoming: upcomingInterviews,

        evaluations: {
          draft: getCount(evaluationStatusCounts, "Draft"),
          submitted: getCount(evaluationStatusCounts, "Submitted"),
        },

        recommendations: {
          advance: getCount(recommendationCounts, "Advance"),
          reject: getCount(recommendationCounts, "Reject"),
          hold: getCount(recommendationCounts, "Hold"),
        },
      },

      hiringDecisions: {
        totalRecords: getTotal(hiringDecisionCounts),
        advance: getCount(hiringDecisionCounts, "Advance"),
        reject: getCount(hiringDecisionCounts, "Reject"),
        hold: getCount(hiringDecisionCounts, "Hold"),
      },

      hiringAssignments: {
        total: getTotal(hiringAssignmentStatusCounts),
        active: getCount(hiringAssignmentStatusCounts, "Active"),
        revoked: getCount(hiringAssignmentStatusCounts, "Revoked"),
      },

      recentActivity,
    };

    return res.status(200).json({
      success: true,
      dashboard,
    });

  } catch (error) {
    console.error("Administrator dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve Administrator dashboard statistics.",
    });
  }
};
