
import bcrypt from "bcryptjs";
import CandidateAccount from "../../../models/CandidateAccount.js";
import generateCandidateId from "../../../shared/utils/generateCandidateId.js";

import jwt from "jsonwebtoken";

// =====================================================
// CANDIDATE REGISTRATION
// POST /api/candidate/auth/register
// =====================================================

export const registerCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // -------------------------------------------------
    // 1. Validate required fields
    // -------------------------------------------------

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, and password are required",
      });
    }

    // -------------------------------------------------
    // 2. Normalize input
    // -------------------------------------------------

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid candidate details",
      });
    }

    // -------------------------------------------------
    // 3. Validate email format
    // -------------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // -------------------------------------------------
    // 4. Validate password
    // -------------------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // -------------------------------------------------
    // 5. Check whether candidate already exists
    // -------------------------------------------------

    const existingCandidate = await CandidateAccount.findOne({
      email: normalizedEmail,
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // -------------------------------------------------
    // 6. Hash password
    // -------------------------------------------------

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      password,
      saltRounds
    );

    // -------------------------------------------------
    // 7. Create candidate account
    // -------------------------------------------------

        const candidateId = await generateCandidateId();

        const candidate = await CandidateAccount.create({
        candidateId,
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        });

    // -------------------------------------------------
    // 8. Return safe response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Candidate account created successfully",
      candidate: {
        id: candidate._id,
        candidateId: candidate.candidateId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        isActive: candidate.isActive,
        createdAt: candidate.createdAt,
      },
    });

  } catch (error) {
    // -------------------------------------------------
    // Handle duplicate email race condition
    // -------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error(
      "Candidate registration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Candidate registration failed",
    });
  }
};



// Candidate Login
export const loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find candidate account
    // password is select:false in the model, so explicitly include it
    const candidate = await CandidateAccount.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check account status
    if (!candidate.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact HR.",
      });
    }

    // 4. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      candidate.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        userId: candidate._id,
        role: "CANDIDATE",
        name: candidate.name,
        email: candidate.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 6. Update last login
    candidate.lastLoginAt = new Date();
    await candidate.save();

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: "Candidate login successful",
      token,
      candidate: {
        id: candidate._id,
        candidateId: candidate.candidateId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: "CANDIDATE",
      },
    });
  } catch (error) {
    console.error("Candidate Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};