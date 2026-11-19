
import mongoose from "mongoose";

import Candidate from "../../candidate/models/Candidate.js";
import Job from "../../hr/models/HRJob.js";

import Screening from "../../screener/models/Screening.js";
import Interview from "../../interviewer/models/Interview.js";
import ApplicationDecision from "../../hiring-manager/models/ApplicationDecision.js";

// =====================================================
// COMMON HELPERS
// =====================================================

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getId = (value) => {
  if (!value) return null;
  return String(value._id || value);
};

const candidateNameExpression = {
  $toLower: {
    $trim: {
      input: {
        $ifNull: [
          "$fullName",
          {
            $ifNull: [
              "$name",
              {
                $ifNull: [
                  "$candidateName",
                  {
                    $concat: [
                      { $ifNull: ["$firstName", ""] },
                      " ",
                      { $ifNull: ["$lastName", ""] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
};

const privateCandidateFields = Object.keys(
  Candidate.schema.paths
).filter((field) =>
  /resume|file|storage|buffer|password|otp|token/i.test(field)
);

// Format an Admin reference safely.
const formatAdmin = (person) => {
  if (!person) return null;

  if (
    typeof person !== "object" ||
    !person._id
  ) {
    return {
      _id: getId(person),
      name: null,
      email: null,
      role: null,
      designation: null,
    };
  }

  return {
    _id: person._id,
    name: person.name || null,
    email: person.email || null,
    role: person.role || null,
    designation: person.designation || null,
  };
};

// Format evaluation information.
const formatEvaluation = (evaluation) => {
  if (!evaluation) return null;

  return {
    status: evaluation.status || "Draft",

    overallRating:
      evaluation.overallRating ?? null,

    strengths: evaluation.strengths || "",
    concerns: evaluation.concerns || "",
    feedback: evaluation.feedback || "",

    recommendation:
      evaluation.recommendation || null,

    criteria: (evaluation.criteria || []).map(
      (item) => ({
        questionCode: item.questionCode,
        questionText: item.questionText,
        rating: item.rating ?? null,
        answer: item.answer || "",
        comments: item.comments || "",
      })
    ),

    submittedBy: formatAdmin(
      evaluation.submittedBy
    ),

    submittedAt: evaluation.submittedAt || null,
  };
};

// =====================================================
// API 2: DEPARTMENT ADMIN CANDIDATE LISTING
// =====================================================

export const listDepartmentAdminCandidates = async ({
  filters,
}) => {
  const {
    department,
    jobId,
    status,
    joiningStatus,
    appliedFrom,
    appliedToExclusive,
    search,
    page,
    limit,
    sortBy,
    sortOrder,
  } = filters;

  const conditions = [];

  if (department) {
    conditions.push({
      $expr: {
        $eq: [
          {
            $toLower: {
              $trim: {
                input: {
                  $ifNull: ["$jobDetails.department", ""],
                },
              },
            },
          },
          department.trim().toLowerCase(),
        ],
      },
    });
  }

  if (jobId) {
    conditions.push({
      job: new mongoose.Types.ObjectId(jobId),
    });
  }

  if (status) {
    conditions.push({ status });
  }

  if (joiningStatus === "JOINED") {
    conditions.push({
      joinedAt: { $type: "date" },
    });
  }

  if (joiningStatus === "NOT_JOINED") {
    conditions.push({
      $or: [
        { joinedAt: null },
        { joinedAt: { $exists: false } },
      ],
    });
  }

  if (appliedFrom || appliedToExclusive) {
    const createdAtFilter = {};

    if (appliedFrom) {
      createdAtFilter.$gte = appliedFrom;
    }

    if (appliedToExclusive) {
      createdAtFilter.$lt = appliedToExclusive;
    }

    conditions.push({
      createdAt: createdAtFilter,
    });
  }

  if (search) {
    const searchRegex = new RegExp(
      escapeRegex(search),
      "i"
    );

    conditions.push({
      $or: [
        { _candidateSortName: searchRegex },
        { fullName: searchRegex },
        { name: searchRegex },
        { candidateName: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { candidateEmail: searchRegex },
        { position: searchRegex },
        { "jobDetails.title": searchRegex },
      ],
    });
  }

  const sortDirection =
    sortOrder === "asc" ? 1 : -1;

  const sortFields = {
    appliedAt: "createdAt",
    name: "_candidateSortName",
    joiningDate: "joinedAt",
    status: "status",
  };

  const sortField = sortFields[sortBy] || "createdAt";

  const sortOptions = {
    [sortField]: sortDirection,
    _id: sortDirection,
  };

  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $lookup: {
        from: Job.collection.name,
        localField: "job",
        foreignField: "_id",
        as: "jobDetails",
      },
    },

    {
      $unwind: {
        path: "$jobDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $addFields: {
        _candidateSortName: candidateNameExpression,
      },
    },

    {
      $match: conditions.length
        ? { $and: conditions }
        : {},
    },

    {
      $facet: {
        data: [
          { $sort: sortOptions },
          { $skip: skip },
          { $limit: limit },

          {
            $addFields: {
              appliedAt: "$createdAt",

              department: {
                $ifNull: [
                  "$jobDetails.department",
                  null,
                ],
              },

              jobDetails: {
                $cond: [
                  { $ne: ["$jobDetails._id", null] },
                  {
                    _id: "$jobDetails._id",
                    title: "$jobDetails.title",
                    department: "$jobDetails.department",
                    status: "$jobDetails.status",
                  },
                  null,
                ],
              },
            },
          },

          {
            $unset: [
              "_candidateSortName",
              ...privateCandidateFields,
            ],
          },
        ],

        total: [
          { $count: "count" },
        ],
      },
    },
  ];

  const [result] = await Candidate.aggregate(pipeline)
    .allowDiskUse(true);

  const candidates = result?.data || [];
  const total = result?.total?.[0]?.count || 0;

  return {
    candidates,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// =====================================================
// API 3: DEPARTMENT ADMIN CANDIDATE PROFILE
// =====================================================

export const getDepartmentAdminCandidateProfile = async ({
  candidateId,
  scope,
  department,
}) => {
  const candidate = await Candidate.findById(candidateId)
    .populate({
      path: "job",
      select: "title department status",
    })
    .lean();

  if (!candidate) {
    return null;
  }

  const job =
    candidate.job &&
    typeof candidate.job === "object" &&
    candidate.job._id
      ? candidate.job
      : null;

  const jobDepartment =
    typeof job?.department === "string"
      ? job.department.trim()
      : "";

  if (scope === "DEPARTMENT") {
    if (!department || !jobDepartment) {
      return null;
    }

    if (
      jobDepartment.toLowerCase() !==
      department.trim().toLowerCase()
    ) {
      return null;
    }
  } else if (scope !== "GLOBAL") {
    return null;
  }

  return {
    _id: candidate._id,

    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,

    position: candidate.position,
    areaOfInterest: candidate.areaOfInterest,

    isFresher: candidate.isFresher,
    location: candidate.location,
    yearsOfExperience: candidate.yearsOfExperience,

    highestQualification: candidate.highestQualification,
    currentCompany: candidate.currentCompany,
    noticePeriod: candidate.noticePeriod,
    coverMessage: candidate.coverMessage,

    department: jobDepartment || null,

    job: job
      ? {
          _id: job._id,
          title: job.title,
          department: job.department,
          status: job.status,
        }
      : null,

    status: candidate.status,
    currentStage: candidate.currentStage,

    appliedAt: candidate.createdAt,

    joiningStatus: candidate.joinedAt
      ? "JOINED"
      : "NOT_JOINED",

    joinedAt: candidate.joinedAt || null,

    hasResume: Boolean(candidate.resume),

    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
};

// =====================================================
// API 4: CANDIDATE RECRUITMENT HISTORY
// =====================================================

export const getDepartmentAdminCandidateHistory = async ({
  candidateId,
  scope,
  department,
}) => {
  const candidate = await Candidate.findById(candidateId)
    .populate({
      path: "job",
      select: "title department status",
    })
    .lean();

  if (!candidate) {
    return null;
  }

  const job =
    candidate.job &&
    typeof candidate.job === "object" &&
    candidate.job._id
      ? candidate.job
      : null;

  const jobDepartment =
    typeof job?.department === "string"
      ? job.department.trim()
      : "";

  if (scope === "DEPARTMENT") {
    if (!department || !jobDepartment) {
      return null;
    }

    if (
      jobDepartment.toLowerCase() !==
      department.trim().toLowerCase()
    ) {
      return null;
    }
  } else if (scope !== "GLOBAL") {
    return null;
  }

  const [
    screenings,
    interviews,
    decisions,
  ] = await Promise.all([
    Screening.find({
      application: candidateId,
    })
      .select(
        "level assignedTo assignedBy assignedByType assignedById status decision feedback remarks rejectionReason escalationReason assignedAt startedAt submittedAt history createdAt updatedAt"
      )
      .lean(),

    Interview.find({
      application: candidateId,
    })
      .select(
        "stageCode stageName stageOrder assignedTo assignedBy scheduledAt timeZone durationMinutes mode status evaluation evaluationHistory createdAt updatedAt"
      )
      .lean(),

    ApplicationDecision.find({
      application: candidateId,
    })
      .select(
        "stageCode stageName stageOrder decision reason decidedBy roleUsed supersedes decidedAt createdAt updatedAt"
      )
      .lean(),
  ]);

  const timeline = [];

  // ---------------------------------------------------
  // APPLICATION SUBMISSION
  // ---------------------------------------------------

  if (candidate.createdAt) {
    timeline.push({
      eventId: `${getId(candidate._id)}:application-submitted`,

      category: "APPLICATION",
      source: "CANDIDATE",
      action: "APPLICATION_SUBMITTED",

      stageCode: "APPLICATION",
      stageName: "Application Submitted",

      title: "Candidate application submitted",

      occurredAt: candidate.createdAt,

      actor: null,

      details: {
        applicationId: getId(candidate._id),
        candidateName: candidate.name,
        position: candidate.position,
        jobTitle: job?.title || null,
        department: jobDepartment || null,
      },
    });
  }

  // ---------------------------------------------------
  // SCREENING HISTORY
  // ---------------------------------------------------

  const screeningActionTitles = {
    ASSIGNED: "L0 screening assigned",
    REASSIGNED: "L0 screening reassigned",
    STARTED: "L0 screening started",
    CHECKLIST_UPDATED: "L0 screening checklist updated",
    SUBMITTED: "L0 screening submitted",
    HR_REVIEW_REQUESTED: "HR review requested",
  };

  for (const screening of screenings) {
    const screeningHistory = screening.history || [];

    if (screeningHistory.length > 0) {
      for (const entry of screeningHistory) {
        const actorId =
          entry.performedById ||
          getId(entry.performedBy) ||
          getId(entry.assignedTo);

        timeline.push({
          eventId: getId(entry._id),

          category: "SCREENING",
          source: "SCREENING",
          action: entry.action,

          stageCode: "L0",
          stageName: "Initial Resume Screening",

          title:
            screeningActionTitles[entry.action] ||
            "L0 screening activity",

          occurredAt:
            entry.createdAt || screening.createdAt,

          actor: {
            type: entry.performedByType || "HUMAN",
            id: actorId || null,
            name:
              entry.performedByName ||
              entry.screenerName ||
              null,
          },

          details: {
            previousCandidateStatus:
              entry.previousStatus || null,

            newCandidateStatus:
              entry.newStatus || null,

            previousScreeningStatus:
              entry.previousScreeningStatus || null,

            newScreeningStatus:
              entry.newScreeningStatus || null,

            decision: entry.decision || null,

            feedback: entry.feedback || "",
            remarks: entry.remarks || "",

            rejectionReason:
              entry.rejectionReason || "",
          },
        });
      }
    } else {
      if (screening.assignedAt) {
        timeline.push({
          eventId: `${getId(screening._id)}:assigned`,
          category: "SCREENING",
          source: "SCREENING",
          action: "ASSIGNED",

          stageCode: "L0",
          stageName: "Initial Resume Screening",

          title: "L0 screening assigned",
          occurredAt: screening.assignedAt,

          actor: {
            type: screening.assignedByType || "HUMAN",
            id:
              screening.assignedById ||
              getId(screening.assignedBy),
            name: null,
          },

          details: {
            screeningStatus: screening.status,
            assignedScreenerId: getId(screening.assignedTo),
          },
        });
      }

      if (screening.startedAt) {
        timeline.push({
          eventId: `${getId(screening._id)}:started`,
          category: "SCREENING",
          source: "SCREENING",
          action: "STARTED",

          stageCode: "L0",
          stageName: "Initial Resume Screening",

          title: "L0 screening started",
          occurredAt: screening.startedAt,

          actor: null,

          details: {
            screeningStatus: screening.status,
          },
        });
      }

      if (screening.submittedAt) {
        timeline.push({
          eventId: `${getId(screening._id)}:submitted`,
          category: "SCREENING",
          source: "SCREENING",
          action: "SUBMITTED",

          stageCode: "L0",
          stageName: "Initial Resume Screening",

          title: "L0 screening submitted",
          occurredAt: screening.submittedAt,

          actor: null,

          details: {
            screeningStatus: screening.status,
            decision: screening.decision,
            feedback: screening.feedback || "",
            remarks: screening.remarks || "",
            rejectionReason: screening.rejectionReason || "",
            escalationReason: screening.escalationReason || "",
          },
        });
      }
    }
  }

  // ---------------------------------------------------
  // INTERVIEW HISTORY EVENTS
  // ---------------------------------------------------

  for (const interview of interviews) {
    const stageName =
      interview.stageName ||
      interview.stageCode ||
      "Interview";

    timeline.push({
      eventId: `${getId(interview._id)}:interview`,

      category: "INTERVIEW",
      source: "INTERVIEW",
      action: "INTERVIEW_RECORDED",

      stageCode: interview.stageCode,
      stageName,

      title: `${stageName} interview record`,

      occurredAt:
        interview.createdAt ||
        interview.scheduledAt ||
        null,

      actor: {
        type: "HUMAN",
        id: getId(interview.assignedBy),
        name: null,
      },

      details: {
        currentStatus: interview.status,
        scheduledAt: interview.scheduledAt,
        timeZone: interview.timeZone,
        durationMinutes: interview.durationMinutes,
        mode: interview.mode,
        stageOrder: interview.stageOrder,
        interviewerId: getId(interview.assignedTo),
      },
    });

    const evaluation = interview.evaluation;

    if (
      evaluation &&
      evaluation.status === "Submitted" &&
      evaluation.submittedAt
    ) {
      timeline.push({
        eventId: `${getId(interview._id)}:evaluation`,

        category: "INTERVIEW",
        source: "INTERVIEW",
        action: "EVALUATION_SUBMITTED",

        stageCode: interview.stageCode,
        stageName,

        title: `${stageName} feedback submitted`,

        occurredAt: evaluation.submittedAt,

        actor: {
          type: "HUMAN",
          id: getId(evaluation.submittedBy),
          name: null,
        },

        details: {
          evaluationStatus: evaluation.status,
          overallRating: evaluation.overallRating ?? null,

          interviewerRecommendation:
            evaluation.recommendation || null,

          feedback: evaluation.feedback || "",
          strengths: evaluation.strengths || "",
          concerns: evaluation.concerns || "",

          criteria: evaluation.criteria || [],
        },
      });
    }

    for (
      const correction of interview.evaluationHistory || []
    ) {
      timeline.push({
        eventId:
          `${getId(interview._id)}:correction:${correction.changedAt}`,

        category: "INTERVIEW",
        source: "INTERVIEW",
        action: "EVALUATION_CORRECTED",

        stageCode: interview.stageCode,
        stageName,

        title: `${stageName} evaluation corrected`,

        occurredAt: correction.changedAt,

        actor: {
          type: "HUMAN",
          id: getId(correction.updatedBy),
          name: null,
        },

        details: {
          correctionReason: correction.correctionReason,
        },
      });
    }
  }

  // ---------------------------------------------------
  // HIRING MANAGER DECISIONS
  // ---------------------------------------------------

  const supersededBy = new Map();

  for (const decision of decisions) {
    if (decision.supersedes) {
      supersededBy.set(
        getId(decision.supersedes),
        getId(decision._id)
      );
    }
  }

  for (const decision of decisions) {
    const isSuperseded = supersededBy.has(
      getId(decision._id)
    );

    timeline.push({
      eventId: getId(decision._id),

      category: "DECISION",
      source: "APPLICATION_DECISION",
      action: "HIRING_MANAGER_DECISION",

      stageCode: decision.stageCode,
      stageName: decision.stageName,

      title:
        `${decision.stageName} decision: ${decision.decision}`,

      occurredAt:
        decision.decidedAt ||
        decision.createdAt ||
        null,

      actor: {
        type: "HUMAN",
        id: getId(decision.decidedBy),
        name: null,
        role: decision.roleUsed,
      },

      details: {
        decision: decision.decision,
        reason: decision.reason || "",
        stageOrder: decision.stageOrder,
        roleUsed: decision.roleUsed,
        superseded: isSuperseded,

        supersededByDecisionId:
          supersededBy.get(getId(decision._id)) || null,

        supersedesDecisionId:
          getId(decision.supersedes),
      },
    });
  }

  // ---------------------------------------------------
  // SORT TIMELINE
  // ---------------------------------------------------

  timeline.sort((a, b) => {
    const dateA = a.occurredAt
      ? new Date(a.occurredAt).getTime()
      : 0;

    const dateB = b.occurredAt
      ? new Date(b.occurredAt).getTime()
      : 0;

    return dateB - dateA;
  });

  const summary = {
    totalEvents: timeline.length,

    applicationEvents: timeline.filter(
      (event) => event.category === "APPLICATION"
    ).length,

    screeningEvents: timeline.filter(
      (event) => event.category === "SCREENING"
    ).length,

    interviewEvents: timeline.filter(
      (event) => event.category === "INTERVIEW"
    ).length,

    decisionEvents: timeline.filter(
      (event) => event.category === "DECISION"
    ).length,
  };

  return {
    candidate: {
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      position: candidate.position,

      department: jobDepartment || null,

      job: job
        ? {
            _id: job._id,
            title: job.title,
            department: job.department,
            status: job.status,
          }
        : null,

      currentStage: candidate.currentStage,
      status: candidate.status,
      appliedAt: candidate.createdAt,

      joiningStatus: candidate.joinedAt
        ? "JOINED"
        : "NOT_JOINED",

      joinedAt: candidate.joinedAt || null,
    },

    summary,
    timeline,
  };
};

// =====================================================
// API 5: DEPARTMENT ADMIN CANDIDATE INTERVIEW DETAILS
// =====================================================

export const getDepartmentAdminCandidateInterviews = async ({
  candidateId,
  scope,
  department,
}) => {
  // ---------------------------------------------------
  // 1. FETCH CANDIDATE AND JOB WORKFLOW
  // ---------------------------------------------------

  const candidate = await Candidate.findById(candidateId)
    .populate({
      path: "job",
      select: "title department status interviewWorkflow",
    })
    .lean();

  if (!candidate) {
    return null;
  }

  const job =
    candidate.job &&
    typeof candidate.job === "object" &&
    candidate.job._id
      ? candidate.job
      : null;

  const jobDepartment =
    typeof job?.department === "string"
      ? job.department.trim()
      : "";

  // ---------------------------------------------------
  // 2. VALIDATE DEPARTMENT ACCESS
  // ---------------------------------------------------

  if (scope === "DEPARTMENT") {
    if (!department || !jobDepartment) {
      return null;
    }

    if (
      jobDepartment.toLowerCase() !==
      department.trim().toLowerCase()
    ) {
      return null;
    }
  } else if (scope !== "GLOBAL") {
    return null;
  }

  // ---------------------------------------------------
  // 3. READ CONFIGURED WORKFLOW STAGES
  // ---------------------------------------------------

  const workflowStages = Array.isArray(
    job?.interviewWorkflow
  )
    ? job.interviewWorkflow
    : [];

  const workflowByCode = new Map();

  for (const stage of workflowStages) {
    const stageCode = String(
      stage.stageCode || ""
    ).toUpperCase();

    if (stageCode) {
      workflowByCode.set(stageCode, stage);
    }
  }

  // ---------------------------------------------------
  // 4. FETCH ACTUAL INTERVIEW RECORDS
  // ---------------------------------------------------

  const interviewRecords = await Interview.find({
    application: candidateId,
  })
    .populate({
      path: "assignedTo",
      select: "name email role designation",
    })
    .populate({
      path: "assignedBy",
      select: "name email role designation",
    })
    .populate({
      path: "evaluation.submittedBy",
      select: "name email role designation",
    })
    .populate({
      path: "evaluationHistory.updatedBy",
      select: "name email role designation",
    })
    .sort({
      stageOrder: 1,
      scheduledAt: 1,
      createdAt: 1,
    })
    .lean();

  // ---------------------------------------------------
  // 5. PREPARE STAGES
  // ---------------------------------------------------

  const stageMap = new Map();

  // Include enabled INTERVIEW stages even when no
  // interview has been scheduled yet.

  for (const stage of workflowStages) {
    const stageCode = String(
      stage.stageCode || ""
    ).toUpperCase();

    if (
      !stageCode ||
      stageCode === "L0" ||
      stage.stageType !== "INTERVIEW" ||
      stage.isEnabled === false
    ) {
      continue;
    }

    stageMap.set(stageCode, {
      stageCode,
      stageName: stage.stageName,
      stageOrder: stage.stageOrder,
      stageType: stage.stageType,

      configured: true,
      isEnabled: stage.isEnabled !== false,

      interviews: [],
    });
  }

  // ---------------------------------------------------
  // 6. FORMAT ACTUAL INTERVIEW RECORDS
  // ---------------------------------------------------

  const formattedInterviews = [];

  for (const interview of interviewRecords) {
    const stageCode = String(
      interview.stageCode || ""
    ).toUpperCase();

    // L0 is initial resume screening, not an interview.
    if (!stageCode || stageCode === "L0") {
      continue;
    }

    const configuredStage =
      workflowByCode.get(stageCode);

    // Do not display a SCREENING stage as an interview.
    if (configuredStage?.stageType === "SCREENING") {
      continue;
    }

    // Custom, HR final or other stages are included only
    // when an actual Interview record exists.
    if (!stageMap.has(stageCode)) {
      stageMap.set(stageCode, {
        stageCode,

        stageName:
          configuredStage?.stageName ||
          interview.stageName ||
          stageCode,

        stageOrder:
          configuredStage?.stageOrder ??
          interview.stageOrder,

        stageType:
          configuredStage?.stageType ||
          "UNCONFIGURED",

        configured: Boolean(configuredStage),

        isEnabled:
          configuredStage
            ? configuredStage.isEnabled !== false
            : null,

        interviews: [],
      });
    }

    const evaluation = interview.evaluation
      ? {
          status: interview.evaluation.status,

          overallRating:
            interview.evaluation.overallRating ?? null,

          strengths:
            interview.evaluation.strengths || "",

          concerns:
            interview.evaluation.concerns || "",

          feedback:
            interview.evaluation.feedback || "",

          recommendation:
            interview.evaluation.recommendation || null,

          criteria:
            (interview.evaluation.criteria || []).map(
              (item) => ({
                questionCode: item.questionCode,
                questionText: item.questionText,
                rating: item.rating ?? null,
                answer: item.answer || "",
                comments: item.comments || "",
              })
            ),

          submittedBy: formatAdmin(
            interview.evaluation.submittedBy
          ),

          submittedAt:
            interview.evaluation.submittedAt || null,
        }
      : null;

    const evaluationHistory = (
      interview.evaluationHistory || []
    ).map((correction) => ({
      previousEvaluation: formatEvaluation(
        correction.previousEvaluation
      ),

      updatedBy: formatAdmin(
        correction.updatedBy
      ),

      correctionReason:
        correction.correctionReason,

      changedAt: correction.changedAt,
    }));

    const formattedInterview = {
      _id: interview._id,

      stageCode,
      stageName:
        interview.stageName ||
        configuredStage?.stageName ||
        stageCode,

      stageOrder: interview.stageOrder,

      interviewer: formatAdmin(
        interview.assignedTo
      ),

      assignedBy: formatAdmin(
        interview.assignedBy
      ),

      schedule: {
        scheduledAt: interview.scheduledAt,
        timeZone: interview.timeZone,

        durationMinutes:
          interview.durationMinutes,

        mode: interview.mode,

        meetingLink:
          interview.meetingLink || "",

        location:
          interview.location || "",
      },

      status: interview.status,

      instructions:
        interview.instructions || "",

      evaluation,

      evaluationHistory,

      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };

    stageMap.get(stageCode).interviews.push(
      formattedInterview
    );

    formattedInterviews.push(formattedInterview);
  }

  // ---------------------------------------------------
  // 7. SORT STAGE INTERVIEWS AND PREPARE STAGE STATUS
  // ---------------------------------------------------

  const stages = Array.from(stageMap.values())
    .sort((a, b) => {
      return (
        a.stageOrder - b.stageOrder ||
        a.stageCode.localeCompare(b.stageCode)
      );
    })
    .map((stage) => {
      stage.interviews.sort((a, b) => {
        const dateA = a.schedule.scheduledAt
          ? new Date(a.schedule.scheduledAt).getTime()
          : 0;

        const dateB = b.schedule.scheduledAt
          ? new Date(b.schedule.scheduledAt).getTime()
          : 0;

        return dateA - dateB;
      });

      // Latest updated interview determines the displayed
      // current stage status. Every record remains available.
      const latestInterview = [...stage.interviews].sort(
        (a, b) => {
          const dateA = new Date(
            a.updatedAt || a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.updatedAt || b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        }
      )[0];

      return {
        ...stage,

        interviewCount: stage.interviews.length,

        status: latestInterview
          ? latestInterview.status
          : "NOT_SCHEDULED",
      };
    });

  // ---------------------------------------------------
  // 8. BUILD SUMMARY
  // ---------------------------------------------------

  const totalInterviewRecords =
    formattedInterviews.length;

  const scheduledInterviews =
    formattedInterviews.filter((item) =>
      [
        "Scheduled",
        "Confirmed",
        "Rescheduled",
      ].includes(item.status)
    ).length;

  const completedInterviews =
    formattedInterviews.filter(
      (item) => item.status === "Completed"
    ).length;

  const cancelledInterviews =
    formattedInterviews.filter(
      (item) => item.status === "Cancelled"
    ).length;

  const noShowInterviews =
    formattedInterviews.filter(
      (item) => item.status === "No-Show"
    ).length;

  const submittedEvaluations =
    formattedInterviews.filter(
      (item) => item.evaluation?.status === "Submitted"
    ).length;

  const pendingScheduleStages =
    stages.filter(
      (stage) => stage.interviewCount === 0
    ).length;

  const recommendationBreakdown = {
    Advance: 0,
    Reject: 0,
    Hold: 0,
  };

  for (const interview of formattedInterviews) {
    const recommendation =
      interview.evaluation?.recommendation;

    if (
      recommendation &&
      Object.hasOwn(
        recommendationBreakdown,
        recommendation
      )
    ) {
      recommendationBreakdown[recommendation] += 1;
    }
  }

  // ---------------------------------------------------
  // 9. RETURN INTERVIEW DETAILS
  // ---------------------------------------------------

  return {
    candidate: {
      _id: candidate._id,

      name: candidate.name,
      email: candidate.email,
      position: candidate.position,

      department: jobDepartment || null,

      job: job
        ? {
            _id: job._id,
            title: job.title,
            department: job.department,
            status: job.status,
          }
        : null,

      currentStage: candidate.currentStage,
      applicationStatus: candidate.status,

      appliedAt: candidate.createdAt,

      joiningStatus: candidate.joinedAt
        ? "JOINED"
        : "NOT_JOINED",

      joinedAt: candidate.joinedAt || null,
    },

    workflow: {
      jobId: getId(job?._id),
      jobTitle: job?.title || null,

      configuredInterviewRounds:
        workflowStages
          .filter(
            (stage) =>
              stage.stageType === "INTERVIEW" &&
              stage.isEnabled !== false
          )
          .sort(
            (a, b) => a.stageOrder - b.stageOrder
          )
          .map((stage) => ({
            stageCode: stage.stageCode,
            stageName: stage.stageName,
            stageOrder: stage.stageOrder,
            stageType: stage.stageType,
            isEnabled: stage.isEnabled !== false,
          })),

      totalConfiguredInterviewRounds:
        workflowStages.filter(
          (stage) =>
            stage.stageType === "INTERVIEW" &&
            stage.isEnabled !== false
        ).length,
    },

    summary: {
      totalDisplayedStages: stages.length,

      totalConfiguredInterviewRounds:
        workflowStages.filter(
          (stage) =>
            stage.stageType === "INTERVIEW" &&
            stage.isEnabled !== false
        ).length,

      totalInterviewRecords,

      scheduledInterviews,
      completedInterviews,
      cancelledInterviews,
      noShowInterviews,

      submittedEvaluations,

      pendingScheduleStages,

      recommendationBreakdown,
    },

    stages,

    interviews: formattedInterviews,
  };
};
