
import Candidate from "../../candidate/models/Candidate.js";
import Job from "../../hr/models/HRJob.js";

// =====================================================
// COMMON REPORT HELPERS
// =====================================================

const getNormalizedDepartmentExpression = (field) => ({
  $toLower: {
    $trim: {
      input: {
        $ifNull: [field, ""],
      },
    },
  },
});

const getJoiningRate = (joined, total) => {
  if (!total) return 0;

  return Number(((joined / total) * 100).toFixed(2));
};

// =====================================================
// API 1: DEPARTMENT ADMIN DASHBOARD SERVICE
// =====================================================

// Dashboard rules:
// 1. Count candidates with an actual joinedAt date.
// 2. Include all departments represented in Job records.
// 3. Include departments with zero joined candidates.
// 4. Derive departments only through Candidate.job.
// 5. Never guess a candidate's department.

export const getDepartmentAdminDashboardOverview = async () => {
  // ---------------------------------------------------
  // 1. ORGANIZATION-WIDE TOTAL JOINED
  // ---------------------------------------------------

  const totalJoinedCandidates = await Candidate.countDocuments({
    joinedAt: {
      $type: "date",
    },
  });

  // ---------------------------------------------------
  // 2. DEPARTMENT-WISE JOINED COUNTS
  // ---------------------------------------------------

  const departmentWiseJoined = await Job.aggregate([
    {
      $match: {
        department: {
          $type: "string",
        },
      },
    },

    {
      $project: {
        jobId: "$_id",
        department: {
          $trim: {
            input: "$department",
          },
        },
      },
    },

    {
      $match: {
        department: {
          $ne: "",
        },
      },
    },

    {
      $lookup: {
        from: Candidate.collection.name,

        let: {
          currentJobId: "$jobId",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$job",
                      "$$currentJobId",
                    ],
                  },
                  {
                    $eq: [
                      {
                        $type: "$joinedAt",
                      },
                      "date",
                    ],
                  },
                ],
              },
            },
          },

          {
            $count: "joinedCount",
          },
        ],

        as: "joinedSummary",
      },
    },

    {
      $addFields: {
        joinedCount: {
          $ifNull: [
            {
              $arrayElemAt: [
                "$joinedSummary.joinedCount",
                0,
              ],
            },
            0,
          ],
        },
      },
    },

    {
      $sort: {
        department: 1,
      },
    },

    {
      $group: {
        _id: {
          $toLower: "$department",
        },

        department: {
          $first: "$department",
        },

        joinedCount: {
          $sum: "$joinedCount",
        },
      },
    },

    {
      $project: {
        _id: 0,
        department: 1,
        joinedCount: 1,
      },
    },

    {
      $sort: {
        department: 1,
      },
    },
  ]);

  // ---------------------------------------------------
  // 3. BREAKDOWN RECONCILIATION
  // ---------------------------------------------------

  const departmentBreakdownTotal =
    departmentWiseJoined.reduce(
      (total, item) => total + item.joinedCount,
      0
    );

  const joinedCandidatesWithoutDepartmentMapping =
    Math.max(
      0,
      totalJoinedCandidates - departmentBreakdownTotal
    );

  // ---------------------------------------------------
  // 4. RETURN DASHBOARD DATA
  // ---------------------------------------------------

  return {
    totalJoinedCandidates,

    departmentWiseJoined,

    meta: {
      totalDepartments: departmentWiseJoined.length,

      departmentBreakdownTotal,

      joinedCandidatesWithoutDepartmentMapping,

      generatedAt: new Date(),
    },
  };
};

// =====================================================
// API 6: DEPARTMENT ADMIN RECRUITMENT REPORT SERVICE
// =====================================================

export const getDepartmentAdminRecruitmentReport = async ({
  department,
  appliedFrom,
  appliedToExclusive,
}) => {
  // ---------------------------------------------------
  // 1. PREPARE DATE FILTER
  // ---------------------------------------------------

  const createdAtFilter = {};

  if (appliedFrom) {
    createdAtFilter.$gte = appliedFrom;
  }

  if (appliedToExclusive) {
    createdAtFilter.$lt = appliedToExclusive;
  }

  const hasDateFilter =
    Object.keys(createdAtFilter).length > 0;

  const normalizedDepartment = department
    ? department.trim().toLowerCase()
    : null;

  // ---------------------------------------------------
  // 2. READ VALID CANDIDATE STATUS VALUES
  // ---------------------------------------------------

  const configuredStatuses =
    Candidate.schema.path("status")?.enumValues || [];

  const candidateStatuses = [
    ...new Set([
      ...configuredStatuses,
      "UNSPECIFIED",
    ]),
  ];

  // ---------------------------------------------------
  // 3. CANDIDATE SUMMARY AND STATUS BREAKDOWN
  // ---------------------------------------------------

  const candidatePipeline = [
    ...(hasDateFilter
      ? [
          {
            $match: {
              createdAt: createdAtFilter,
            },
          },
        ]
      : []),

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

    // Global reports include all applications, including
    // applications that cannot be mapped to a department.
    // A selected department filter requires the actual Job.
    ...(normalizedDepartment
      ? [
          {
            $match: {
              $expr: {
                $eq: [
                  getNormalizedDepartmentExpression(
                    "$jobDetails.department"
                  ),
                  normalizedDepartment,
                ],
              },
            },
          },
        ]
      : []),

    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalApplications: {
                $sum: 1,
              },

              joinedCandidates: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        {
                          $type: "$joinedAt",
                        },
                        "date",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },

          {
            $project: {
              _id: 0,

              totalApplications: 1,

              joinedCandidates: 1,

              notJoinedCandidates: {
                $subtract: [
                  "$totalApplications",
                  "$joinedCandidates",
                ],
              },
            },
          },
        ],

        statusBreakdown: [
          {
            $group: {
              _id: {
                $ifNull: [
                  "$status",
                  "UNSPECIFIED",
                ],
              },

              count: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1,
            },
          },

          {
            $sort: {
              count: -1,
              status: 1,
            },
          },
        ],
      },
    },
  ];

  // ---------------------------------------------------
  // 4. JOB-LEVEL APPLICATION MATCHING
  // ---------------------------------------------------

  const applicationMatchExpressions = [
    {
      $eq: [
        "$job",
        "$$reportJobId",
      ],
    },
  ];

  if (appliedFrom) {
    applicationMatchExpressions.push({
      $gte: [
        "$createdAt",
        appliedFrom,
      ],
    });
  }

  if (appliedToExclusive) {
    applicationMatchExpressions.push({
      $lt: [
        "$createdAt",
        appliedToExclusive,
      ],
    });
  }

  const joinedCandidatesExpression = {
    $size: {
      $filter: {
        input: "$applications",
        as: "application",

        cond: {
          $eq: [
            {
              $type: "$$application.joinedAt",
            },
            "date",
          ],
        },
      },
    },
  };

  const statusBreakdownExpression = {
    $filter: {
      input: {
        $map: {
          input: {
            $literal: candidateStatuses,
          },

          as: "candidateStatus",

          in: {
            status: "$$candidateStatus",

            count: {
              $size: {
                $filter: {
                  input: "$applications",
                  as: "application",

                  cond: {
                    $eq: [
                      {
                        $ifNull: [
                          "$$application.status",
                          "UNSPECIFIED",
                        ],
                      },
                      "$$candidateStatus",
                    ],
                  },
                },
              },
            },
          },
        },
      },

      as: "statusItem",

      cond: {
        $gt: [
          "$$statusItem.count",
          0,
        ],
      },
    },
  };

  // ---------------------------------------------------
  // 5. PREPARE JOB FILTER
  // ---------------------------------------------------

  const jobConditions = [
    {
      department: {
        $type: "string",
      },
    },

    {
      $expr: {
        $ne: [
          {
            $trim: {
              input: "$department",
            },
          },
          "",
        ],
      },
    },
  ];

  if (normalizedDepartment) {
    jobConditions.push({
      $expr: {
        $eq: [
          {
            $toLower: {
              $trim: {
                input: "$department",
              },
            },
          },
          normalizedDepartment,
        ],
      },
    });
  }

  // ---------------------------------------------------
  // 6. BUILD JOB-WISE REPORT
  // Includes jobs with zero applications.
  // ---------------------------------------------------

  const jobPipeline = [
    {
      $match: {
        $and: jobConditions,
      },
    },

    {
      $lookup: {
        from: Candidate.collection.name,

        let: {
          reportJobId: "$_id",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: applicationMatchExpressions,
              },
            },
          },

          {
            $project: {
              status: 1,
              joinedAt: 1,
            },
          },
        ],

        as: "applications",
      },
    },

    {
      $addFields: {
        totalApplications: {
          $size: "$applications",
        },

        joinedCandidates:
          joinedCandidatesExpression,

        statusBreakdown:
          statusBreakdownExpression,
      },
    },

    {
      $project: {
        _id: 0,

        jobId: "$_id",

        title: 1,

        department: {
          $trim: {
            input: "$department",
          },
        },

        jobStatus: "$status",

        employmentType: 1,

        location: 1,

        vacancies: 1,

        totalApplications: 1,

        joinedCandidates: 1,

        notJoinedCandidates: {
          $subtract: [
            "$totalApplications",
            "$joinedCandidates",
          ],
        },

        statusBreakdown: 1,
      },
    },

    {
      $sort: {
        department: 1,
        title: 1,
      },
    },
  ];

  // ---------------------------------------------------
  // 7. EXECUTE REPORT QUERIES
  // ---------------------------------------------------

  const [
    candidateResults,
    jobWiseRaw,
  ] = await Promise.all([
    Candidate.aggregate(candidatePipeline)
      .allowDiskUse(true),

    Job.aggregate(jobPipeline)
      .allowDiskUse(true),
  ]);

  const candidateResult = candidateResults[0] || {};

  const candidateSummary =
    candidateResult.summary?.[0] || {
      totalApplications: 0,
      joinedCandidates: 0,
      notJoinedCandidates: 0,
    };

  // ---------------------------------------------------
  // 8. FORMAT JOB-WISE REPORT
  // ---------------------------------------------------

  const jobWise = jobWiseRaw.map((job) => ({
    ...job,

    joiningRatePercentage: getJoiningRate(
      job.joinedCandidates,
      job.totalApplications
    ),

    statusBreakdown: (job.statusBreakdown || []).map(
      (item) => ({
        ...item,

        percentage: getJoiningRate(
          item.count,
          job.totalApplications
        ),
      })
    ),
  }));

  // ---------------------------------------------------
  // 9. BUILD DEPARTMENT-WISE REPORT
  // ---------------------------------------------------

  const departmentMap = new Map();

  for (const job of jobWise) {
    const departmentName = job.department.trim();

    const normalizedName =
      departmentName.toLowerCase();

    if (!departmentMap.has(normalizedName)) {
      departmentMap.set(normalizedName, {
        department: departmentName,

        totalJobs: 0,

        publishedJobs: 0,

        draftJobs: 0,

        totalVacancies: 0,

        totalApplications: 0,

        joinedCandidates: 0,

        notJoinedCandidates: 0,
      });
    }

    const departmentSummary =
      departmentMap.get(normalizedName);

    departmentSummary.totalJobs += 1;

    if (job.jobStatus === "Published") {
      departmentSummary.publishedJobs += 1;
    }

    if (job.jobStatus === "Draft") {
      departmentSummary.draftJobs += 1;
    }

    departmentSummary.totalVacancies +=
      job.vacancies || 0;

    departmentSummary.totalApplications +=
      job.totalApplications;

    departmentSummary.joinedCandidates +=
      job.joinedCandidates;

    departmentSummary.notJoinedCandidates +=
      job.notJoinedCandidates;
  }

  const departmentWise = Array.from(
    departmentMap.values()
  )
    .map((item) => ({
      ...item,

      joiningRatePercentage: getJoiningRate(
        item.joinedCandidates,
        item.totalApplications
      ),
    }))
    .sort((a, b) => {
      return (
        b.totalApplications - a.totalApplications ||
        a.department.localeCompare(b.department)
      );
    });

  // ---------------------------------------------------
  // 10. BUILD OVERALL STATUS BREAKDOWN
  // ---------------------------------------------------

  const totalApplications =
    candidateSummary.totalApplications;

  const statusBreakdown = (
    candidateResult.statusBreakdown || []
  ).map((item) => ({
    status: item.status,

    count: item.count,

    percentage: getJoiningRate(
      item.count,
      totalApplications
    ),
  }));

  // ---------------------------------------------------
  // 11. BUILD OVERALL JOB AND DEPARTMENT TOTALS
  // ---------------------------------------------------

  const totalJobs = jobWise.length;

  const publishedJobs = jobWise.filter(
    (job) => job.jobStatus === "Published"
  ).length;

  const draftJobs = jobWise.filter(
    (job) => job.jobStatus === "Draft"
  ).length;

  const totalVacancies = jobWise.reduce(
    (total, job) => total + (job.vacancies || 0),
    0
  );

  const applicationsInDepartmentBreakdown =
    jobWise.reduce(
      (total, job) => total + job.totalApplications,
      0
    );

  const joinedInDepartmentBreakdown =
    jobWise.reduce(
      (total, job) => total + job.joinedCandidates,
      0
    );

  // These are data-quality indicators, not recruitment outcomes.
  const applicationsWithoutDepartmentMapping =
    Math.max(
      0,
      totalApplications - applicationsInDepartmentBreakdown
    );

  const joinedCandidatesWithoutDepartmentMapping =
    Math.max(
      0,
      candidateSummary.joinedCandidates -
        joinedInDepartmentBreakdown
    );

  // ---------------------------------------------------
  // 12. RETURN RECRUITMENT REPORT
  // ---------------------------------------------------

  return {
    summary: {
      totalApplications,

      joinedCandidates:
        candidateSummary.joinedCandidates,

      notJoinedCandidates:
        candidateSummary.notJoinedCandidates,

      joiningRatePercentage: getJoiningRate(
        candidateSummary.joinedCandidates,
        totalApplications
      ),

      totalJobs,

      publishedJobs,

      draftJobs,

      totalVacancies,
    },

    statusBreakdown,

    departmentWise,

    jobWise,

    meta: {
      totalDepartments: departmentWise.length,

      applicationsInDepartmentBreakdown,

      joinedInDepartmentBreakdown,

      applicationsWithoutDepartmentMapping,

      joinedCandidatesWithoutDepartmentMapping,

      generatedAt: new Date(),
    },
  };
};
