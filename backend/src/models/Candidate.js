import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
      trim: true,
    },

    areaOfInterest: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    isFresher: {
      type: Boolean,
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
    },

    highestQualification: {
      type: String,
      required: true,
      trim: true,
    },

    currentCompany: {
      type: String,
      trim: true,
    },

    noticePeriod: {
      type: String,
      enum: ["Immediately", "30 Days", "60 Days", "90 Days"],
      required: true,
    },

    coverMessage: {
      type: String,
      trim: true,
    },

    resume: {
      type: String,
    },

    status: {
      type: String,
      enum: ["New", "Shortlisted", "Interview", "Selected", "Rejected"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;