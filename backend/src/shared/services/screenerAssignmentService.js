import mongoose from "mongoose";

import Admin from "../models/Admin.js";
import Candidate from "../models/Candidate.js";
import Screening from "../modules/screener/models/Screening.js";

import { createAuditLog } from "./auditLogService.js";

import {
  isActiveAccount,
  isL0Screener,
} from "../modules/administrator/services/authorizationService.js";

// =====================================================
// CONSTANTS
// =====================================================

const SYSTEM_ACTOR_ID = "system:l0-workload-assignment";

const SYSTEM_ACTOR_NAME =
  "L0 Workload Assignment Service";

const OPEN_SCREENING_STATUSES = [
  "Pending",
  "In Progress",
];

const RETRY_BATCH_DEFAULT = 100;
const RETRY_BATCH_MAX = 500;

// =====================================================
// NORMALIZE DEPARTMENT
// =====================================================

const normalizeDepartment = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

// =====================================================
// GET ELIGIBLE L0 SCREENERS
// =====================================================

const getEligibleScreeners = async ({
  department,
  session,
}) => {
  const admins = await Admin.find({
    status: "Active",
    deletedAt: null,
  })
    .select(
      "_id name email role designation department status deletedAt"
    )
    .session(session)
    .lean();

  const normalizedDepartment =
    normalizeDepartment(department);

  return admins.filter((admin) => {
    return (
      isActiveAccount(admin) &&
      isL0Screener(admin) &&
      normalizeDepartment(admin.department) ===
        normalizedDepartment
    );
  });
};

// =====================================================
// CALCULATE CURRENT SCREENING WORKLOAD
// =====================================================

const getScreenerWorkloads = async ({
  screenerIds,
  session,
}) => {
  const workloadRecords = await Screening.aggregate([
    {
      $match: {
        level: "L0",
        status: {
          $in: OPEN_SCREENING_STATUSES,
        },
        assignedTo: {
          $in: screenerIds,
        },
        assignmentPending: {
          $ne: true,
        },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        pendingCount: {
          $sum: 1,
        },
      },
    },
  ]).session(session);

  const workloadMap = new Map();

  for (const record of workloadRecords) {
    workloadMap.set(
      record._id.toString(),
      record.pendingCount
    );
  }

  return workloadMap;
};

// =====================================================
// SELECT SCREENER WITH LOWEST WORKLOAD
// =====================================================

const selectLeastBusyScreener = (
  screeners,
  workloadMap
) => {
  const sortedScreeners = [...screeners].sort(
    (first, second) => {
      const firstCount =
        workloadMap.get(first._id.toString()) || 0;

      const secondCount =
        workloadMap.get(second._id.toString()) || 0;

      if (firstCount !== secondCount) {
        return firstCount - secondCount;
      }

      return first._id
        .toString()
        .localeCompare(second._id.toString());
    }
  );

  return sortedScreeners[0] || null;
};

// =====================================================
// AUDIT: INITIAL ASSIGNMENT PENDING
// =====================================================

const recordPendingAssignment = async ({
  candidate,
  reason,
  reasonCode,
  session,
  requestId,
  correlationId,
}) => {
  await createAuditLog({
    actorType: "SYSTEM",
    actorId: SYSTEM_ACTOR_ID,
    actorName: SYSTEM_ACTOR_NAME,
    roleUsed: "SYSTEM",

    action: "L0_ASSIGNMENT_PENDING",
    targetType: "Candidate",
    targetId: candidate._id,
    targetLabel: candidate.name,
    department: candidate.department || "",

    outcome: "PENDING",
    reason,

    before: {
      status: candidate.status,
      assignedScreener:
        candidate.assignedScreener || null,
    },

    after: {
      status: candidate.status,
      assignedScreener:
        candidate.assignedScreener || null,
    },

    requestId,
    correlationId,

    metadata: {
      reasonCode,
      currentStage: candidate.currentStage,
    },

    session,
  });
};

// =====================================================
// BUILD INITIAL ASSIGNMENT HISTORY ENTRY
// =====================================================

const buildAssignmentHistoryEntry = ({
  candidate,
  selectedScreener,
  previousCandidateStatus,
  previousScreeningStatus,
  assignedAt,
}) => ({
  action: "ASSIGNED",

  applicationId: candidate._id,
  candidateName: candidate.name || "",
  screenerName: selectedScreener.name || "",

  previousStatus: previousCandidateStatus,
  newStatus: "ASSIGNED_TO_L0",

  previousScreeningStatus,
  newScreeningStatus: "Pending",

  performedBy: null,
  performedByType: "SYSTEM",
  performedById: SYSTEM_ACTOR_ID,
  performedByName: SYSTEM_ACTOR_NAME,

  assignedTo: selectedScreener._id,

  remarks:
    "Automatically assigned to an active L0 screener based on workload.",

  createdAt: assignedAt,
});

// =====================================================
// INITIAL L0 ASSIGNMENT WORKFLOW
// =====================================================

const performL0Assignment = async ({
  candidateId,
  session,
  requestId,
  correlationId,
}) => {
  // ---------------------------------------------------
  // 1. FIND CANDIDATE
  // ---------------------------------------------------

  const candidate = await Candidate.findById(
    candidateId
  ).session(session);

  if (!candidate) {
    throw new Error("Candidate application not found.");
  }

  // ---------------------------------------------------
  // 2. CHECK EXISTING SCREENING
  // ---------------------------------------------------

  let screening = await Screening.findOne({
    application: candidate._id,
    level: "L0",
  }).session(session);

  if (screening?.assignmentPending) {
    return {
      assigned: false,
      assignmentPending: true,
      alreadyAssigned: false,
      candidateId: candidate._id,
      screeningId: screening._id,
      screenerId: screening.assignedTo,
      reason:
        screening.assignmentPendingReason ||
        "This application is waiting for L0 reassignment.",
    };
  }

  if (screening?.assignedTo) {
    if (
      candidate.status === "New" ||
      !candidate.assignedScreener
    ) {
      candidate.assignedScreener =
        screening.assignedTo;

      if (candidate.status === "New") {
        candidate.status = "ASSIGNED_TO_L0";
      }

      await candidate.save({ session });
    }

    return {
      assigned: true,
      alreadyAssigned: true,
      assignmentPending: false,
      candidateId: candidate._id,
      screeningId: screening._id,
      screenerId: screening.assignedTo,
    };
  }

  // ---------------------------------------------------
  // 3. CHECK APPLICATION ELIGIBILITY
  // ---------------------------------------------------

  if (
    !["New", "ASSIGNED_TO_L0"].includes(candidate.status) ||
    !["L0_SCREENING", "L0"].includes(
      candidate.currentStage
    )
  ) {
    return {
      assigned: false,
      skipped: true,
      assignmentPending: false,
      candidateId: candidate._id,
      reason:
        "Candidate is not eligible for initial L0 assignment.",
    };
  }

  if (candidate.assignedScreener) {
    throw new Error(
      "Candidate has an assigned screener but no matching L0 Screening record. Please investigate this inconsistent record before assigning again."
    );
  }

  if (
    screening &&
    screening.status !== "Pending"
  ) {
    return {
      assigned: false,
      skipped: true,
      assignmentPending: false,
      candidateId: candidate._id,
      screeningId: screening._id,
      reason:
        "An existing unassigned Screening record is not in Pending status. Manual investigation is required.",
    };
  }

  // ---------------------------------------------------
  // 4. CHECK DEPARTMENT
  // ---------------------------------------------------

  const department = normalizeDepartment(
    candidate.department
  );

  if (!department) {
    await recordPendingAssignment({
      candidate,
      reason:
        "Candidate department is missing. Automatic L0 assignment cannot continue.",
      reasonCode: "MISSING_DEPARTMENT",
      session,
      requestId,
      correlationId,
    });

    return {
      assigned: false,
      assignmentPending: true,
      candidateId: candidate._id,
      reason: "Candidate department is missing.",
    };
  }

  // ---------------------------------------------------
  // 5. FIND ELIGIBLE SCREENERS
  // ---------------------------------------------------

  const eligibleScreeners = await getEligibleScreeners({
    department: candidate.department,
    session,
  });

  if (eligibleScreeners.length === 0) {
    await recordPendingAssignment({
      candidate,
      reason:
        "No active L0 screeners are available in the candidate's department.",
      reasonCode: "NO_ELIGIBLE_L0_SCREENER",
      session,
      requestId,
      correlationId,
    });

    return {
      assigned: false,
      assignmentPending: true,
      candidateId: candidate._id,
      reason:
        "No active L0 screeners are available in this department.",
    };
  }

  // ---------------------------------------------------
  // 6. CALCULATE WORKLOAD
  // ---------------------------------------------------

  const screenerIds = eligibleScreeners.map(
    (screener) => screener._id
  );

  const workloadMap = await getScreenerWorkloads({
    screenerIds,
    session,
  });

  // ---------------------------------------------------
  // 7. SELECT LEAST BUSY SCREENER
  // ---------------------------------------------------

  const selectedScreener = selectLeastBusyScreener(
    eligibleScreeners,
    workloadMap
  );

  if (!selectedScreener) {
    throw new Error(
      "Unable to select an eligible L0 screener."
    );
  }

  const workloadBefore =
    workloadMap.get(selectedScreener._id.toString()) ||
    0;

  const previousCandidateStatus = candidate.status;

  const previousScreeningStatus = screening
    ? screening.status
    : "";

  const assignedAt = new Date();

  // ---------------------------------------------------
  // 8. CREATE OR REUSE SCREENING RECORD
  // ---------------------------------------------------

  if (!screening) {
    screening = new Screening({
      application: candidate._id,
      level: "L0",
      status: "Pending",
    });
  }

  screening.assignedTo = selectedScreener._id;

  screening.assignmentPending = false;
  screening.assignmentPendingReason = "";
  screening.assignmentPendingSince = null;

  screening.assignedBy = null;
  screening.assignedByType = "SYSTEM";
  screening.assignedById = SYSTEM_ACTOR_ID;

  screening.status = "Pending";
  screening.assignedAt = assignedAt;

  screening.history.push(
    buildAssignmentHistoryEntry({
      candidate,
      selectedScreener,
      previousCandidateStatus,
      previousScreeningStatus,
      assignedAt,
    })
  );

  await screening.save({ session });

  // ---------------------------------------------------
  // 9. UPDATE CANDIDATE
  // ---------------------------------------------------

  candidate.assignedScreener =
    selectedScreener._id;

  candidate.status = "ASSIGNED_TO_L0";

  await candidate.save({ session });

  // ---------------------------------------------------
  // 10. CREATE SYSTEM AUDIT RECORD
  // ---------------------------------------------------

  await createAuditLog({
    actorType: "SYSTEM",
    actorId: SYSTEM_ACTOR_ID,
    actorName: SYSTEM_ACTOR_NAME,
    roleUsed: "SYSTEM",

    action: "L0_APPLICATION_ASSIGNED",
    targetType: "Candidate",
    targetId: candidate._id,
    targetLabel: candidate.name,
    department: candidate.department || "",

    outcome: "SUCCESS",

    before: {
      status: previousCandidateStatus,
      assignedScreener: null,
    },

    after: {
      status: candidate.status,
      assignedScreener:
        selectedScreener._id.toString(),
    },

    reason:
      "Automatically assigned to the active L0 screener with the lowest pending workload.",

    requestId,
    correlationId,

    metadata: {
      screeningId: screening._id.toString(),
      assignedScreenerId:
        selectedScreener._id.toString(),
      assignedScreenerName:
        selectedScreener.name || "",
      workloadBefore,
      eligibleScreenerCount:
        eligibleScreeners.length,
    },

    session,
  });

  return {
    assigned: true,
    alreadyAssigned: false,
    assignmentPending: false,

    candidateId: candidate._id,
    screeningId: screening._id,

    screenerId: selectedScreener._id,
    screenerName: selectedScreener.name || "",

    department: candidate.department,

    status: candidate.status,
    currentStage: candidate.currentStage,

    workloadBefore,
  };
};

// =====================================================
// PUBLIC SERVICE: ASSIGN ONE L0 SCREENER
// =====================================================

export const assignL0ScreenerByWorkload = async (
  candidateId,
  {
    requestId = "",
    correlationId = "",
  } = {}
) => {
  if (!mongoose.isValidObjectId(candidateId)) {
    throw new Error("Invalid candidate ID.");
  }

  const session = await mongoose.startSession();

  let assignmentResult;

  try {
    await session.withTransaction(async () => {
      assignmentResult = await performL0Assignment({
        candidateId,
        session,
        requestId,
        correlationId,
      });
    });

    return assignmentResult;
  } catch (error) {
    if (error.code === 11000) {
      const existingScreening = await Screening.findOne({
        application: candidateId,
        level: "L0",
      });

      if (existingScreening?.assignmentPending) {
        return {
          assigned: false,
          alreadyAssigned: false,
          assignmentPending: true,
          candidateId,
          screeningId: existingScreening._id,
          screenerId: existingScreening.assignedTo,
          reason:
            existingScreening.assignmentPendingReason ||
            "This application is waiting for reassignment.",
        };
      }

      if (existingScreening?.assignedTo) {
        return {
          assigned: true,
          alreadyAssigned: true,
          assignmentPending: false,
          candidateId,
          screeningId: existingScreening._id,
          screenerId: existingScreening.assignedTo,
        };
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// =====================================================
// MARK SCREENING AS PENDING REASSIGNMENT
// =====================================================

const markReassignmentPending = async ({
  screening,
  candidate,
  reason,
  reasonCode,
  session,
  requestId,
  correlationId,
}) => {
  const wasAlreadyPending =
    screening.assignmentPending === true;

  const previousAssignment = {
    assignedTo: screening.assignedTo || null,
    assignmentPending: wasAlreadyPending,
    assignmentPendingReason:
      screening.assignmentPendingReason || "",
    assignmentPendingSince:
      screening.assignmentPendingSince || null,
  };

  screening.assignmentPending = true;
  screening.assignmentPendingReason = reason;

  if (!screening.assignmentPendingSince) {
    screening.assignmentPendingSince = new Date();
  }

  await screening.save({ session });

  // Avoid duplicate audit records on repeated retries.
  if (
    !wasAlreadyPending ||
    previousAssignment.assignmentPendingReason !== reason
  ) {
    await createAuditLog({
      actorType: "SYSTEM",
      actorId: SYSTEM_ACTOR_ID,
      actorName: SYSTEM_ACTOR_NAME,
      roleUsed: "SYSTEM",

      action: "L0_REASSIGNMENT_PENDING",
      targetType: "Candidate",
      targetId: candidate._id,
      targetLabel: candidate.name,
      department: candidate.department || "",

      outcome: "PENDING",
      reason,

      before: previousAssignment,

      after: {
        assignedTo: screening.assignedTo || null,
        assignmentPending: true,
        assignmentPendingReason: reason,
        assignmentPendingSince:
          screening.assignmentPendingSince,
      },

      requestId,
      correlationId,

      metadata: {
        reasonCode,
        screeningId: screening._id.toString(),
        previousScreenerId:
          screening.assignedTo
            ? screening.assignedTo.toString()
            : "",
        screeningStatus: screening.status,
      },

      session,
    });
  }

  return {
    assigned: false,
    assignmentPending: true,
    screeningId: screening._id,
    candidateId: candidate._id,
    screenerId: screening.assignedTo,
    reason,
  };
};

// =====================================================
// PROCESS ONE SCREENING REASSIGNMENT
//
// expectedScreenerId and expectedAssignmentPending
// act as optimistic concurrency guards.
//
// A stale retry cannot overwrite a newer assignment.
// =====================================================

const performOneL0Reassignment = async ({
  screeningId,
  expectedScreenerId = null,
  expectedAssignmentPending = false,
  requestId = "",
  correlationId = "",
}) => {
  const session = await mongoose.startSession();

  let result;

  try {
    await session.withTransaction(async () => {
      // -------------------------------------------------
      // 1. FIND OPEN SCREENING USING EXPECTED STATE
      // -------------------------------------------------

      const filter = {
        _id: screeningId,
        level: "L0",
        status: {
          $in: OPEN_SCREENING_STATUSES,
        },
      };

      if (expectedScreenerId) {
        filter.assignedTo = expectedScreenerId;
      } else {
        filter.assignedTo = null;
      }

      if (expectedAssignmentPending) {
        filter.assignmentPending = true;
      } else {
        filter.assignmentPending = {
          $ne: true,
        };
      }

      const screening = await Screening.findOne(
        filter
      ).session(session);

      if (!screening) {
        result = {
          assigned: false,
          skipped: true,
          reason:
            "Screening assignment has already changed or is no longer available for reassignment.",
        };

        return;
      }

      // -------------------------------------------------
      // 2. FIND CANDIDATE
      // -------------------------------------------------

      const candidate = await Candidate.findById(
        screening.application
      ).session(session);

      if (!candidate) {
        throw new Error(
          `Candidate application ${screening.application} was not found for screening ${screening._id}.`
        );
      }

      // -------------------------------------------------
      // 3. CAPTURE THE REAL PREVIOUS STATE
      // -------------------------------------------------

      const previousScreenerId =
        screening.assignedTo || null;

      const previousAssignmentPending =
        screening.assignmentPending === true;

      const previousAssignmentPendingReason =
        screening.assignmentPendingReason || "";

      const previousAssignmentPendingSince =
        screening.assignmentPendingSince || null;

      const previousCandidateStatus =
        candidate.status;

      const previousCandidateAssignee =
        candidate.assignedScreener || null;

      const previousScreeningStatus =
        screening.status;

      // Preserve this snapshot before modifying anything.
      const beforeAssignmentSnapshot = {
        candidateStatus: previousCandidateStatus,
        candidateAssignedScreener:
          previousCandidateAssignee,
        screeningStatus: previousScreeningStatus,
        assignedScreener: previousScreenerId,
        assignmentPending: previousAssignmentPending,
        assignmentPendingReason:
          previousAssignmentPendingReason,
        assignmentPendingSince:
          previousAssignmentPendingSince,
      };

      // -------------------------------------------------
      // 4. CHECK DEPARTMENT
      // -------------------------------------------------

      const department = normalizeDepartment(
        candidate.department
      );

      if (!department) {
        result = await markReassignmentPending({
          screening,
          candidate,
          reason:
            "Candidate department is missing. L0 screening cannot be reassigned automatically.",
          reasonCode: "MISSING_DEPARTMENT",
          session,
          requestId,
          correlationId,
        });

        return;
      }

      // -------------------------------------------------
      // 5. FIND ELIGIBLE ACTIVE SCREENERS
      // -------------------------------------------------

      const eligibleScreeners = await getEligibleScreeners({
        department: candidate.department,
        session,
      });

      // If the previous screener is eligible again,
      // retain the existing assignment.
      const previousScreenerIsEligible =
        eligibleScreeners.some(
          (screener) =>
            previousScreenerId &&
            screener._id.toString() ===
              previousScreenerId.toString()
        );

      if (previousScreenerIsEligible) {
        const candidateAssignmentNeedsRepair =
          !candidate.assignedScreener ||
          candidate.assignedScreener.toString() !==
            previousScreenerId.toString();

        if (
          previousAssignmentPending ||
          candidateAssignmentNeedsRepair
        ) {
          screening.assignmentPending = false;
          screening.assignmentPendingReason = "";
          screening.assignmentPendingSince = null;

          candidate.assignedScreener =
            previousScreenerId;

          await candidate.save({ session });
          await screening.save({ session });

          await createAuditLog({
            actorType: "SYSTEM",
            actorId: SYSTEM_ACTOR_ID,
            actorName: SYSTEM_ACTOR_NAME,
            roleUsed: "SYSTEM",

            action: "L0_REASSIGNMENT_CANCELLED",
            targetType: "Candidate",
            targetId: candidate._id,
            targetLabel: candidate.name,
            department: candidate.department || "",

            outcome: "SUCCESS",

            before: beforeAssignmentSnapshot,

            after: {
              candidateStatus: candidate.status,
              candidateAssignedScreener:
                previousScreenerId.toString(),
              screeningStatus: screening.status,
              assignedScreener:
                previousScreenerId.toString(),
              assignmentPending: false,
              assignmentPendingReason: "",
              assignmentPendingSince: null,
            },

            reason:
              "The previously assigned L0 screener is active and eligible again. The existing assignment was retained.",

            requestId,
            correlationId,

            metadata: {
              screeningId: screening._id.toString(),
              screenerId:
                previousScreenerId.toString(),
            },

            session,
          });
        }

        result = {
          assigned: true,
          alreadyAssigned: true,
          assignmentPending: false,
          restored: true,
          candidateId: candidate._id,
          screeningId: screening._id,
          screenerId: previousScreenerId,
        };

        return;
      }

      // -------------------------------------------------
      // 6. HANDLE NO AVAILABLE REPLACEMENT
      // -------------------------------------------------

      if (eligibleScreeners.length === 0) {
        result = await markReassignmentPending({
          screening,
          candidate,
          reason:
            "The previously assigned L0 screener is no longer eligible, and no active replacement screener is available in the candidate's department.",
          reasonCode:
            "NO_ELIGIBLE_REASSIGNMENT_SCREENER",
          session,
          requestId,
          correlationId,
        });

        return;
      }

      // -------------------------------------------------
      // 7. CALCULATE WORKLOAD
      // -------------------------------------------------

      const screenerIds = eligibleScreeners.map(
        (screener) => screener._id
      );

      const workloadMap = await getScreenerWorkloads({
        screenerIds,
        session,
      });

      // -------------------------------------------------
      // 8. SELECT REPLACEMENT
      // -------------------------------------------------

      const selectedScreener = selectLeastBusyScreener(
        eligibleScreeners,
        workloadMap
      );

      if (!selectedScreener) {
        throw new Error(
          "Unable to select a replacement L0 screener."
        );
      }

      const workloadBefore =
        workloadMap.get(
          selectedScreener._id.toString()
        ) || 0;

      const reassignedAt = new Date();

      const previousScreener = previousScreenerId
        ? await Admin.findById(previousScreenerId)
            .select("_id name")
            .session(session)
            .lean()
        : null;

      // -------------------------------------------------
      // 9. UPDATE SCREENING ASSIGNMENT
      // -------------------------------------------------

      screening.assignedTo =
        selectedScreener._id;

      screening.assignedBy = null;
      screening.assignedByType = "SYSTEM";
      screening.assignedById = SYSTEM_ACTOR_ID;

      screening.assignedAt = reassignedAt;

      screening.assignmentPending = false;
      screening.assignmentPendingReason = "";
      screening.assignmentPendingSince = null;

      // Preserve existing screening status, checklist,
      // feedback, remarks and startedAt.
      screening.history.push({
        action: "REASSIGNED",

        applicationId: candidate._id,
        candidateName: candidate.name || "",

        screenerName: selectedScreener.name || "",

        previousStatus: previousCandidateStatus,
        newStatus: candidate.status,

        previousScreeningStatus,
        newScreeningStatus: screening.status,

        performedBy: null,
        performedByType: "SYSTEM",
        performedById: SYSTEM_ACTOR_ID,
        performedByName: SYSTEM_ACTOR_NAME,

        assignedTo: selectedScreener._id,

        remarks:
          `Automatically reassigned from ${
            previousScreener?.name || "the previous screener"
          } to ${
            selectedScreener.name || "a new L0 screener"
          } because the previous screener was no longer eligible.`,

        createdAt: reassignedAt,
      });

      // -------------------------------------------------
      // 10. UPDATE CANDIDATE ASSIGNMENT
      // -------------------------------------------------

      candidate.assignedScreener =
        selectedScreener._id;

      // Candidate status and currentStage remain unchanged.
      await candidate.save({ session });

      await screening.save({ session });

      // -------------------------------------------------
      // 11. CREATE SYSTEM AUDIT RECORD
      // -------------------------------------------------

      await createAuditLog({
        actorType: "SYSTEM",
        actorId: SYSTEM_ACTOR_ID,
        actorName: SYSTEM_ACTOR_NAME,
        roleUsed: "SYSTEM",

        action: "L0_APPLICATION_REASSIGNED",
        targetType: "Candidate",
        targetId: candidate._id,
        targetLabel: candidate.name,
        department: candidate.department || "",

        outcome: "SUCCESS",

        // This is the actual state captured BEFORE updates.
        before: beforeAssignmentSnapshot,

        after: {
          candidateStatus: candidate.status,
          candidateAssignedScreener:
            selectedScreener._id.toString(),
          screeningStatus: screening.status,
          assignedScreener:
            selectedScreener._id.toString(),
          assignmentPending: false,
          assignmentPendingReason: "",
          assignmentPendingSince: null,
        },

        reason:
          "Open L0 screening was automatically reassigned to an active screener in the same department using workload balancing.",

        requestId,
        correlationId,

        metadata: {
          screeningId: screening._id.toString(),

          previousScreenerId:
            previousScreenerId
              ? previousScreenerId.toString()
              : "",

          previousScreenerName:
            previousScreener?.name || "",

          newScreenerId:
            selectedScreener._id.toString(),

          newScreenerName:
            selectedScreener.name || "",

          workloadBefore,

          eligibleScreenerCount:
            eligibleScreeners.length,

          previousScreeningStatus,
        },

        session,
      });

      result = {
        assigned: true,
        alreadyAssigned: false,
        assignmentPending: false,

        candidateId: candidate._id,
        screeningId: screening._id,

        previousScreenerId,
        screenerId: selectedScreener._id,
        screenerName: selectedScreener.name || "",

        department: candidate.department,

        screeningStatus: screening.status,
        workloadBefore,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

// =====================================================
// PROCESS REASSIGNMENT BATCH
// =====================================================

const processReassignmentBatch = async ({
  screenings,
  requestId,
  correlationId,
}) => {
  const summary = {
    scanned: screenings.length,
    assigned: 0,
    stillPending: 0,
    skipped: 0,
    failed: 0,
    results: [],
  };

  for (const screening of screenings) {
    try {
      const result = await performOneL0Reassignment({
        screeningId: screening._id,

        expectedScreenerId:
          screening.assignedTo || null,

        expectedAssignmentPending:
          screening.assignmentPending === true,

        requestId,
        correlationId,
      });

      if (result.assigned) {
        summary.assigned += 1;
      } else if (result.assignmentPending) {
        summary.stillPending += 1;
      } else {
        summary.skipped += 1;
      }

      summary.results.push(result);
    } catch (error) {
      summary.failed += 1;

      summary.results.push({
        screeningId: screening._id,
        assigned: false,
        failed: true,
        reason: error.message,
      });
    }
  }

  return summary;
};

// =====================================================
// REASSIGN OPEN APPLICATIONS FROM A SCREENER
// =====================================================

export const reassignL0ApplicationsFromInactiveScreener = async (
  screenerId,
  {
    limit = RETRY_BATCH_MAX,
    requestId = "",
    correlationId = "",
  } = {}
) => {
  if (!mongoose.isValidObjectId(screenerId)) {
    throw new Error("Invalid screener ID.");
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > RETRY_BATCH_MAX
  ) {
    throw new Error(
      `Reassignment limit must be an integer between 1 and ${RETRY_BATCH_MAX}.`
    );
  }

  const filter = {
    assignedTo: screenerId,
    level: "L0",
    status: {
      $in: OPEN_SCREENING_STATUSES,
    },
  };

  const [total, screenings] = await Promise.all([
    Screening.countDocuments(filter),

    Screening.find(filter)
      .select("_id assignedTo status assignmentPending")
      .sort({
        assignedAt: 1,
        createdAt: 1,
      })
      .limit(limit)
      .lean(),
  ]);

  const summary = await processReassignmentBatch({
    screenings,
    requestId,
    correlationId,
  });

  return {
    ...summary,
    totalOpen: total,
    hasMore: total > screenings.length,
  };
};

// =====================================================
// RETRY SCREENINGS WAITING FOR REASSIGNMENT
// =====================================================

export const retryPendingL0Reassignments = async ({
  limit = RETRY_BATCH_DEFAULT,
  requestId = "",
  correlationId = "",
} = {}) => {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > RETRY_BATCH_MAX
  ) {
    throw new Error(
      `Retry limit must be an integer between 1 and ${RETRY_BATCH_MAX}.`
    );
  }

  const filter = {
    level: "L0",
    assignmentPending: true,
    status: {
      $in: OPEN_SCREENING_STATUSES,
    },
  };

  const [total, screenings] = await Promise.all([
    Screening.countDocuments(filter),

    Screening.find(filter)
      .select("_id assignedTo status assignmentPending")
      .sort({
        assignmentPendingSince: 1,
        createdAt: 1,
      })
      .limit(limit)
      .lean(),
  ]);

  const summary = await processReassignmentBatch({
    screenings,
    requestId,
    correlationId,
  });

  return {
    ...summary,
    totalOpen: total,
    hasMore: total > screenings.length,
  };
};

// =====================================================
// RETRY INITIAL PENDING L0 ASSIGNMENTS
//
// Also retries applications waiting for reassignment.
// =====================================================

export const retryPendingL0Assignments = async ({
  limit = RETRY_BATCH_DEFAULT,
  requestId = "",
  correlationId = "",
} = {}) => {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > RETRY_BATCH_MAX
  ) {
    throw new Error(
      `Retry limit must be an integer between 1 and ${RETRY_BATCH_MAX}.`
    );
  }

  // ---------------------------------------------------
  // 1. FIND INITIAL UNASSIGNED APPLICATIONS
  // ---------------------------------------------------

  const candidateFilter = {
    status: {
      $in: ["New", "ASSIGNED_TO_L0"],
    },

    currentStage: {
      $in: ["L0_SCREENING", "L0"],
    },

    assignedScreener: null,
  };

  const pendingCandidates = await Candidate.find(
    candidateFilter
  )
    .select("_id")
    .sort({
      createdAt: 1,
      _id: 1,
    })
    .limit(limit)
    .lean();

  const summary = {
    scanned: 0,
    assigned: 0,
    stillPending: 0,
    skipped: 0,
    failed: 0,
    results: [],
  };

  // ---------------------------------------------------
  // 2. RETRY INITIAL ASSIGNMENTS
  // ---------------------------------------------------

  for (const candidate of pendingCandidates) {
    summary.scanned += 1;

    try {
      const result = await assignL0ScreenerByWorkload(
        candidate._id,
        {
          requestId,
          correlationId,
        }
      );

      if (result.assigned) {
        summary.assigned += 1;
      } else if (result.assignmentPending) {
        summary.stillPending += 1;
      } else {
        summary.skipped += 1;
      }

      summary.results.push({
        candidateId: candidate._id,
        ...result,
      });
    } catch (error) {
      summary.failed += 1;

      summary.results.push({
        candidateId: candidate._id,
        assigned: false,
        failed: true,
        reason: error.message,
      });
    }
  }

  // ---------------------------------------------------
  // 3. RETRY EXISTING REASSIGNMENTS
  // ---------------------------------------------------

  const reassignmentSummary =
    await retryPendingL0Reassignments({
      limit,
      requestId,
      correlationId,
    });

  summary.scanned += reassignmentSummary.scanned;
  summary.assigned += reassignmentSummary.assigned;
  summary.stillPending += reassignmentSummary.stillPending;
  summary.skipped += reassignmentSummary.skipped;
  summary.failed += reassignmentSummary.failed;

  summary.results.push(
    ...reassignmentSummary.results
  );

  summary.reassignments = {
    scanned: reassignmentSummary.scanned,
    assigned: reassignmentSummary.assigned,
    stillPending: reassignmentSummary.stillPending,
    skipped: reassignmentSummary.skipped,
    failed: reassignmentSummary.failed,
    totalOpen: reassignmentSummary.totalOpen,
    hasMore: reassignmentSummary.hasMore,
  };

  return summary;
};