
import mongoose from "mongoose";

import Candidate from "../../candidate/models/Candidate.js";

import {
  getDepartmentAdminDashboardOverview,
  getDepartmentAdminRecruitmentReport as fetchDepartmentAdminRecruitmentReport,
} from "../services/departmentAdminDashboardService.js";

import {
  listDepartmentAdminCandidates,
  getDepartmentAdminCandidateProfile,
  getDepartmentAdminCandidateHistory as fetchDepartmentAdminCandidateHistory,
  getDepartmentAdminCandidateInterviews as fetchDepartmentAdminCandidateInterviews,
} from "../services/departmentAdminCandidateService.js";

// =====================================================
// CONSTANTS
// =====================================================

const ALLOWED_PAGE_SIZES = [10, 20, 50];

const ALLOWED_SORT_FIELDS = [
  "appliedAt",
  "name",
  "joiningDate",
  "status",
];

const ALLOWED_JOINING_STATUSES = [
  "ALL",
  "JOINED",
  "NOT_JOINED",
];

// =====================================================
// COMMON HELPERS
// =====================================================

const getQueryString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const badRequest = (res, message) => {
  return res.status(400).json({
    success: false,
    message,
  });
};

// =====================================================
// API 1: DASHBOARD OVERVIEW
// GET /api/department-admin/dashboard/overview
// =====================================================

export const getDashboardOverview = async (req, res) => {
  try {
    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    // Dashboard statistics are organization-wide.
    // Do not filter aggregate statistics by the
    // authenticated user's department.

    const overview =
      await getDepartmentAdminDashboardOverview();

    return res.status(200).json({
      success: true,

      message:
        "Department Administrator dashboard overview retrieved successfully.",

      data: {
        summary: {
          totalJoinedCandidates:
            overview.totalJoinedCandidates,
        },

        departmentWiseJoined:
          overview.departmentWiseJoined,

        meta: overview.meta,

        access: {
          scope: access.scope,
          readOnly: true,
        },
      },
    });
  } catch (error) {
    console.error(
      "Department Admin dashboard overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve Department Administrator dashboard overview.",
    });
  }
};

// =====================================================
// API 2: CANDIDATE LISTING
// GET /api/department-admin/candidates
// =====================================================

export const getDepartmentAdminCandidates = async (
  req,
  res
) => {
  try {
    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    const scope = String(access.scope || "").toUpperCase();

    const requestedDepartment = getQueryString(
      req.query.department
    );

    let departmentFilter;

    // -------------------------------------------------
    // DEPARTMENT ADMINISTRATOR ACCESS
    // -------------------------------------------------

    if (scope === "DEPARTMENT") {
      if (!access.department) {
        return res.status(403).json({
          success: false,
          message:
            "No department is assigned to this account.",
        });
      }

      if (
        requestedDepartment &&
        requestedDepartment.toLowerCase() !==
          String(access.department).trim().toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot access another department's candidates.",
        });
      }

      departmentFilter = access.department;
    } else if (scope === "GLOBAL") {
      departmentFilter = requestedDepartment || undefined;
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator access scope.",
      });
    }

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    const search = getQueryString(req.query.search);

    if (search.length > 100) {
      return badRequest(
        res,
        "Search text cannot exceed 100 characters."
      );
    }

    // -------------------------------------------------
    // JOB ID
    // -------------------------------------------------

    const jobId = getQueryString(req.query.jobId);

    if (jobId && !mongoose.isValidObjectId(jobId)) {
      return badRequest(res, "Invalid job ID.");
    }

    // -------------------------------------------------
    // CANDIDATE STATUS
    // -------------------------------------------------

    const status = getQueryString(req.query.status);

    const allowedStatuses =
      Candidate.schema.path("status")?.enumValues || [];

    if (
      status &&
      allowedStatuses.length > 0 &&
      !allowedStatuses.includes(status)
    ) {
      return badRequest(
        res,
        "Invalid candidate status."
      );
    }

    // -------------------------------------------------
    // JOINING STATUS
    // -------------------------------------------------

    const joiningStatus = (
      getQueryString(req.query.joiningStatus) || "ALL"
    ).toUpperCase();

    if (
      !ALLOWED_JOINING_STATUSES.includes(joiningStatus)
    ) {
      return badRequest(
        res,
        "joiningStatus must be ALL, JOINED or NOT_JOINED."
      );
    }

    // -------------------------------------------------
    // APPLICATION DATE FILTERS
    // -------------------------------------------------

    const appliedFromRaw = getQueryString(
      req.query.appliedFrom
    );

    const appliedToRaw = getQueryString(
      req.query.appliedTo
    );

    if (
      appliedFromRaw &&
      !isValidDateOnly(appliedFromRaw)
    ) {
      return badRequest(
        res,
        "appliedFrom must use YYYY-MM-DD format."
      );
    }

    if (
      appliedToRaw &&
      !isValidDateOnly(appliedToRaw)
    ) {
      return badRequest(
        res,
        "appliedTo must use YYYY-MM-DD format."
      );
    }

    if (
      appliedFromRaw &&
      appliedToRaw &&
      appliedFromRaw > appliedToRaw
    ) {
      return badRequest(
        res,
        "appliedFrom cannot be later than appliedTo."
      );
    }

    const appliedFrom = appliedFromRaw
      ? new Date(`${appliedFromRaw}T00:00:00.000Z`)
      : undefined;

    const appliedToExclusive = appliedToRaw
      ? new Date(
          new Date(
            `${appliedToRaw}T00:00:00.000Z`
          ).getTime() + 24 * 60 * 60 * 1000
        )
      : undefined;

    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const page = Number(
      getQueryString(req.query.page) || "1"
    );

    const limit = Number(
      getQueryString(req.query.limit) || "10"
    );

    if (!Number.isInteger(page) || page < 1) {
      return badRequest(
        res,
        "page must be a positive integer."
      );
    }

    if (
      !Number.isInteger(limit) ||
      !ALLOWED_PAGE_SIZES.includes(limit)
    ) {
      return badRequest(
        res,
        "limit must be 10, 20 or 50."
      );
    }

    // -------------------------------------------------
    // SORTING
    // -------------------------------------------------

    const sortBy =
      getQueryString(req.query.sortBy) || "appliedAt";

    const sortOrder = (
      getQueryString(req.query.sortOrder) || "desc"
    ).toLowerCase();

    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
      return badRequest(
        res,
        "Invalid sortBy field."
      );
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return badRequest(
        res,
        "sortOrder must be asc or desc."
      );
    }

    // -------------------------------------------------
    // FETCH CANDIDATES
    // -------------------------------------------------

    const result = await listDepartmentAdminCandidates({
      filters: {
        department: departmentFilter,
        jobId: jobId || undefined,
        status: status || undefined,
        joiningStatus,
        appliedFrom,
        appliedToExclusive,
        search: search || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      },
    });

    return res.status(200).json({
      success: true,

      message: "Candidates retrieved successfully.",

      candidates: result.candidates,

      pagination: {
        page: result.page,
        limit: result.limit,
        totalCandidates: result.total,
        totalPages: result.totalPages,
        hasNextPage: page < result.totalPages,
        hasPreviousPage: page > 1,
      },

      filtersApplied: {
        department: departmentFilter || null,
        jobId: jobId || null,
        status: status || null,
        joiningStatus,
        appliedFrom: appliedFromRaw || null,
        appliedTo: appliedToRaw || null,
        search: search || null,
        sortBy,
        sortOrder,
      },

      access: {
        scope,

        department:
          scope === "DEPARTMENT"
            ? access.department
            : departmentFilter || null,

        readOnly: true,
      },
    });
  } catch (error) {
    console.error(
      "Department Admin candidate listing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve candidates.",
    });
  }
};

// =====================================================
// API 3: CANDIDATE PROFILE DETAILS
// GET /api/department-admin/candidates/:candidateId
// =====================================================

export const getDepartmentAdminCandidateDetails = async (
  req,
  res
) => {
  try {
    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    const candidateId = req.params.candidateId;

    if (!mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    const scope = String(access.scope || "").toUpperCase();

    if (
      scope !== "GLOBAL" &&
      scope !== "DEPARTMENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator access scope.",
      });
    }

    if (
      scope === "DEPARTMENT" &&
      !access.department
    ) {
      return res.status(403).json({
        success: false,
        message:
          "No department is assigned to this account.",
      });
    }

    const candidate =
      await getDepartmentAdminCandidateProfile({
        candidateId,
        scope,
        department: access.department,
      });

    // Same 404 for nonexistent and out-of-scope candidates.

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message:
          "Candidate not found in your accessible department.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Candidate profile retrieved successfully.",

      candidate,

      access: {
        scope,

        department:
          scope === "DEPARTMENT"
            ? access.department
            : candidate.department,

        readOnly: true,
      },
    });
  } catch (error) {
    console.error(
      "Department Admin candidate profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve candidate profile.",
    });
  }
};

// =====================================================
// API 4: CANDIDATE RECRUITMENT HISTORY
// GET /api/department-admin/candidates/:candidateId/history
// =====================================================

export const getDepartmentAdminCandidateHistory = async (
  req,
  res
) => {
  try {
    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    const candidateId = req.params.candidateId;

    if (!mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    const scope = String(access.scope || "").toUpperCase();

    if (
      scope !== "GLOBAL" &&
      scope !== "DEPARTMENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator access scope.",
      });
    }

    if (
      scope === "DEPARTMENT" &&
      !access.department
    ) {
      return res.status(403).json({
        success: false,
        message:
          "No department is assigned to this account.",
      });
    }

    const history =
      await fetchDepartmentAdminCandidateHistory({
        candidateId,
        scope,
        department: access.department,
      });

    if (!history) {
      return res.status(404).json({
        success: false,
        message:
          "Candidate history not found in your accessible department.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Candidate recruitment history retrieved successfully.",

      data: {
        candidate: history.candidate,

        summary: history.summary,

        timeline: history.timeline,

        access: {
          scope,

          department:
            scope === "DEPARTMENT"
              ? access.department
              : history.candidate.department,

          readOnly: true,
        },

        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Department Admin candidate history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve candidate recruitment history.",
    });
  }
};

// =====================================================
// API 5: CANDIDATE INTERVIEW DETAILS
// GET /api/department-admin/candidates/:candidateId/interviews
// =====================================================

export const getDepartmentAdminCandidateInterviews = async (
  req,
  res
) => {
  try {
    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    // -------------------------------------------------
    // VALIDATE CANDIDATE ID
    // -------------------------------------------------

    const candidateId = req.params.candidateId;

    if (!mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    // -------------------------------------------------
    // VALIDATE ADMINISTRATOR SCOPE
    // -------------------------------------------------

    const scope = String(access.scope || "").toUpperCase();

    if (
      scope !== "GLOBAL" &&
      scope !== "DEPARTMENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator access scope.",
      });
    }

    if (
      scope === "DEPARTMENT" &&
      !access.department
    ) {
      return res.status(403).json({
        success: false,
        message:
          "No department is assigned to this account.",
      });
    }

    // -------------------------------------------------
    // FETCH INTERVIEW DETAILS
    // -------------------------------------------------

    const result =
      await fetchDepartmentAdminCandidateInterviews({
        candidateId,
        scope,
        department: access.department,
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Candidate interviews not found in your accessible department.",
      });
    }

    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Candidate interview details retrieved successfully.",

      data: {
        candidate: result.candidate,

        workflow: result.workflow,

        summary: result.summary,

        stages: result.stages,

        interviews: result.interviews,

        access: {
          scope,

          department:
            scope === "DEPARTMENT"
              ? access.department
              : result.candidate.department,

          readOnly: true,
        },

        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Department Admin candidate interviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve candidate interview details.",
    });
  }
};

// =====================================================
// API 6: RECRUITMENT REPORT
// GET /api/department-admin/reports/recruitment
// =====================================================

export const getDepartmentAdminRecruitmentReport = async (
  req,
  res
) => {
  try {
    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    // -------------------------------------------------
    // VALIDATE ADMINISTRATOR SCOPE
    // -------------------------------------------------

    const scope = String(access.scope || "").toUpperCase();

    if (
      scope !== "GLOBAL" &&
      scope !== "DEPARTMENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator access scope.",
      });
    }

    // -------------------------------------------------
    // DEPARTMENT FILTER
    // -------------------------------------------------

    const requestedDepartment = getQueryString(
      req.query.department
    );

    if (requestedDepartment.length > 100) {
      return badRequest(
        res,
        "Department filter cannot exceed 100 characters."
      );
    }

    let departmentFilter;

    if (scope === "DEPARTMENT") {
      if (!access.department) {
        return res.status(403).json({
          success: false,
          message:
            "No department is assigned to this account.",
        });
      }

      // Department Admin can see organization-wide
      // aggregate comparisons or their own department.
      // They cannot request another department's report.

      if (
        requestedDepartment &&
        requestedDepartment.toLowerCase() !==
          String(access.department).trim().toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot filter reports for another department.",
        });
      }

      departmentFilter = requestedDepartment
        ? access.department
        : undefined;
    } else {
      // Global Admin can report all departments or
      // select any department.
      departmentFilter = requestedDepartment || undefined;
    }

    // -------------------------------------------------
    // APPLICATION DATE FILTERS
    // Uses Candidate.createdAt.
    // Format: YYYY-MM-DD
    // -------------------------------------------------

    const appliedFromRaw = getQueryString(
      req.query.appliedFrom
    );

    const appliedToRaw = getQueryString(
      req.query.appliedTo
    );

    if (
      appliedFromRaw &&
      !isValidDateOnly(appliedFromRaw)
    ) {
      return badRequest(
        res,
        "appliedFrom must use YYYY-MM-DD format."
      );
    }

    if (
      appliedToRaw &&
      !isValidDateOnly(appliedToRaw)
    ) {
      return badRequest(
        res,
        "appliedTo must use YYYY-MM-DD format."
      );
    }

    if (
      appliedFromRaw &&
      appliedToRaw &&
      appliedFromRaw > appliedToRaw
    ) {
      return badRequest(
        res,
        "appliedFrom cannot be later than appliedTo."
      );
    }

    const appliedFrom = appliedFromRaw
      ? new Date(`${appliedFromRaw}T00:00:00.000Z`)
      : undefined;

    // Include the complete appliedTo date.
    const appliedToExclusive = appliedToRaw
      ? new Date(
          new Date(
            `${appliedToRaw}T00:00:00.000Z`
          ).getTime() + 24 * 60 * 60 * 1000
        )
      : undefined;

    // -------------------------------------------------
    // FETCH RECRUITMENT REPORT
    // -------------------------------------------------

    const report =
      await fetchDepartmentAdminRecruitmentReport({
        department: departmentFilter,
        appliedFrom,
        appliedToExclusive,
      });

    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Department Administrator recruitment report retrieved successfully.",

      data: {
        period: {
          appliedFrom: appliedFromRaw || null,
          appliedTo: appliedToRaw || null,
        },

        summary: report.summary,

        statusBreakdown: report.statusBreakdown,

        departmentWise: report.departmentWise,

        jobWise: report.jobWise,

        meta: report.meta,

        filtersApplied: {
          department: departmentFilter || null,
          appliedFrom: appliedFromRaw || null,
          appliedTo: appliedToRaw || null,
        },

        access: {
          scope,
          aggregateOnly: true,
          readOnly: true,
        },

        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Department Admin recruitment report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve Department Administrator recruitment report.",
    });
  }
};
