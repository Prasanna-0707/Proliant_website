import mongoose from "mongoose";

// =====================================================
// EVALUATION QUESTION
// =====================================================

const evaluationQuestionSchema = new mongoose.Schema(
  {
    // Unique question identifier within the form
    questionCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    // Example: Technical Skills, Communication, Problem Solving
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "General",
    },

    // Question or criterion displayed to the interviewer
    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Optional guidance for the interviewer
    helpText: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // How the interviewer should answer
    responseType: {
      type: String,
      enum: [
        "RATING",
        "TEXT",
        "RATING_AND_TEXT",
        "YES_NO",
      ],
      default: "RATING_AND_TEXT",
    },

    // Whether an answer must be provided
    isRequired: {
      type: Boolean,
      default: true,
    },

    // Display order in the evaluation form
    displayOrder: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// EVALUATION FORM
// =====================================================

const evaluationFormSchema = new mongoose.Schema(
  {
    // Null means this is a default form for a stage.
    // A Job ID means this form belongs to one specific job.
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
      index: true,
    },

    // Configurable stage identifier.
    // Examples: L1, L2, TECHNICAL_ROUND.
    stageCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
      match: /^[A-Z0-9_-]+$/,
    },

    // Readable stage name
    stageName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Name shown at the top of the evaluation form
    formName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Version allows future changes without losing old definitions
    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // Only published forms should be available for normal evaluation
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
      index: true,
    },

    // Evaluation questions and criteria
    questions: {
      type: [evaluationQuestionSchema],
      default: [],
    },

    // User who created the form
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // User who last updated the form
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// Each version of a form must be unique for its job and stage.
// When job is null, the form is a stage-level default form.
evaluationFormSchema.index(
  {
    job: 1,
    stageCode: 1,
    version: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// EXPORT MODEL
// =====================================================

const EvaluationForm =
  mongoose.models.EvaluationForm ||
  mongoose.model("EvaluationForm", evaluationFormSchema);

export default EvaluationForm;