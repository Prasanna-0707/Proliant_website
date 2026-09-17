import bcrypt from "bcryptjs";
import crypto from "crypto";
import OTP from "../models/OTP.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

// Generate a secure 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Generate and store OTP
export const generateAndStoreOTP = async (email, purpose) => {
  // Check if an OTP was recently sent
  const existingOTP = await OTP.findOne({
    email,
    purpose,
  });

  if (existingOTP) {
    const secondsSinceLastSent =
      (Date.now() - existingOTP.lastSentAt.getTime()) / 1000;

    if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
      const remainingSeconds = Math.ceil(
        RESEND_COOLDOWN_SECONDS - secondsSinceLastSent
      );

      throw new Error(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`
      );
    }

    // Delete old OTP before creating a new one
    await OTP.deleteOne({
      _id: existingOTP._id,
    });
  }

  // Generate OTP
  const otp = generateOTP();

  // Hash OTP before storing it
  const otpHash = await bcrypt.hash(otp, 10);

  // Calculate expiry time
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  // Store OTP hash in MongoDB
  await OTP.create({
    email,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date(),
  });

  // Return plain OTP only to the caller
  // It will later be sent through emailService
  return otp;
};

// Verify OTP
export const verifyOTP = async (email, purpose, enteredOTP) => {
  const otpRecord = await OTP.findOne({
    email,
    purpose,
  });

  // No OTP found
  if (!otpRecord) {
    throw new Error("OTP not found or already used");
  }

  // Check expiry
  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    throw new Error("OTP has expired");
  }

  // Check maximum attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    throw new Error("Maximum OTP attempts exceeded");
  }

  // Compare entered OTP with stored hash
  const isValid = await bcrypt.compare(
    enteredOTP,
    otpRecord.otpHash
  );

  // Wrong OTP
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    const remainingAttempts =
      MAX_OTP_ATTEMPTS - otpRecord.attempts;

    if (remainingAttempts <= 0) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      throw new Error("Maximum OTP attempts exceeded");
    }

    throw new Error(
      `Invalid OTP. ${remainingAttempts} attempt(s) remaining`
    );
  }

  // Correct OTP → delete it so it cannot be reused
  await OTP.deleteOne({
    _id: otpRecord._id,
  });

  return true;
};