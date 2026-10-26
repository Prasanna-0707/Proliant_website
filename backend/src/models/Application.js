import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    scheduledAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 60,
      min: 1,
    },

    mode: {
      type: String,
      enum: ["Online", "In-Person", "Phone"],
      default: "Online",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: null,
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    _id: false,
  }
);

const hiringStageSchema = new mongoose.Schema(
  {
    stageKey: {
      type: String,
      required: true,
      trim: true,
    },

    stageName: {
      type: String,
      required: true,
      trim: true,
    },

    stageOrder: {
      type: Number,
      required: true,
      min: 1,
    },

    stageType: {
      type: String,
      enum: [
        "Screening",
        "Interview",
        "Decision",
        "Other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Upcoming",
        "Pending",
        "In Progress",
        "Completed",
        "Failed",
        "Skipped",
      ],
      default: "Upcoming",
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    result: {
      type: String,
      enum: [
        "Pending",
        "Passed",
        "Failed",
        "Selected",
        "Rejected",
        "On Hold",
      ],
      default: "Pending",
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    interview: {
      type: interviewSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateAccount",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    resume: {
      fileName: {
        type: String,
        required: true,
        trim: true,
      },

      fileUrl: {
        type: String,
        required: true,
        trim: true,
      },

      fileType: {
        type: String,
        enum: ["pdf", "docx"],
        required: true,
      },
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Screening",
        "Interview",
        "Selected",
        "Rejected",
        "Withdrawn",
      ],
      default: "Applied",
    },

    screening: {
      result: {
        type: String,
        enum: ["Pending", "Passed", "Failed"],
        default: "Pending",
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      feedback: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // Candidate's hiring journey through the recruitment stages
    hiringStages: {
      type: [hiringStageSchema],
      default: () => [
        {
          stageKey: "resume-screening",
          stageName: "Resume Screening",
          stageOrder: 1,
          stageType: "Screening",
          status: "In Progress",
        },
        {
          stageKey: "technical-interview-1",
          stageName: "Technical Interview (Round 1)",
          stageOrder: 2,
          stageType: "Interview",
          status: "Upcoming",
        },
        {
          stageKey: "technical-interview-2",
          stageName: "Technical Interview (Round 2)",
          stageOrder: 3,
          stageType: "Interview",
          status: "Upcoming",
        },
        {
          stageKey: "hr-interview",
          stageName: "HR Interview",
          stageOrder: 4,
          stageType: "Interview",
          status: "Upcoming",
        },
        {
          stageKey: "final-decision",
          stageName: "Final Decision",
          stageOrder: 5,
          stageType: "Decision",
          status: "Upcoming",
        },
      ],
    },

    interviewAttended: {
      type: Boolean,
      default: false,
    },

    interviewFailedAt: {
      type: Date,
      default: null,
    },

    reapplyEligibleAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One candidate should not have multiple applications for the same job.
// Reapplication rules can be updated later.
applicationSchema.index(
  {
    candidate: 1,
    job: 1,
  },
  {
    unique: true,
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;