
import mongoose from "mongoose";

const candidateAccountSchema = new mongoose.Schema(
  {
    candidateId: {
      type: String,
      unique: true,
      required: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
    resume: {
      fileName: {
        type: String,
        trim: true,
        default: null,
      },

      fileUrl: {
        type: String,
        trim: true,
        default: null,
      },

      fileType: {
        type: String,
        enum: ["pdf", "docx"],
        default: null,
      },

      uploadedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const CandidateAccount = mongoose.model(
  "CandidateAccount",
  candidateAccountSchema
);

export default CandidateAccount;
