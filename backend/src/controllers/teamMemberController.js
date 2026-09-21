import crypto from "crypto";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";

import { sendTemporaryPasswordEmail } from "../services/emailService.js";


const normalizeEmail = (email = "") => {
  return email.trim().toLowerCase();
};


// =====================================================
// GET ALL TEAM MEMBERS
// =====================================================

export const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Admin.find()
      .select(
        "-password -tokenVersion -resetTokenVersion -resetToken -otp -otpExpiresAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      teamMembers,
    });
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
};


// =====================================================
// GET TEAM MEMBER BY ID
// =====================================================

export const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await Admin.findById(id)
      .select(
        "-password -tokenVersion -resetTokenVersion -resetToken -otp -otpExpiresAt"
      );

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      teamMember,
    });
  } catch (error) {
    console.error("Get team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team member",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE TEAM MEMBER
// =====================================================

export const createTeamMember = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const temporaryPassword =
      crypto.randomBytes(6).toString("base64url") + "@1";

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10
    );

    const teamMember = await Admin.create({
      email,
      password: hashedPassword,
      tokenVersion: 0,
      resetTokenVersion: 0,
      mustChangePassword: true,
    });

    await sendTemporaryPasswordEmail(
      teamMember.email,
      temporaryPassword
    );

    return res.status(201).json({
      success: true,
      message:
        "Team member created successfully. Temporary password sent to email",

      teamMember: {
        id: teamMember._id,
        email: teamMember.email,
        mustChangePassword: teamMember.mustChangePassword,
        createdAt: teamMember.createdAt,
      },
    });
  } catch (error) {
    console.error("Create team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Team member creation failed",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE TEAM MEMBER
// =====================================================

export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const teamMember = await Admin.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "Another account with this email already exists",
      });
    }

    teamMember.email = normalizedEmail;

    await teamMember.save();

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully",

      teamMember: {
        id: teamMember._id,
        email: teamMember.email,
        mustChangePassword: teamMember.mustChangePassword,
        createdAt: teamMember.createdAt,
        updatedAt: teamMember.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Team member update failed",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE TEAM MEMBER
// =====================================================

export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      req.admin &&
      req.admin._id &&
      req.admin._id.toString() === id
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const teamMember = await Admin.findById(id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Team member deletion failed",
      error: error.message,
    });
  }
};