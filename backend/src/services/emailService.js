import "dotenv/config";
import nodemailer from "nodemailer";

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// =====================================================
// SEND LOGIN OTP
// =====================================================

export const sendLoginOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Proliant Admin Login OTP",

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">

        <h2>Proliant Admin Login</h2>

        <p>
          Your login verification code is:
        </p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not try to log in, please ignore this email.
        </p>

        <p>
          Regards,<br>
          <strong>Proliant Data LLC</strong>
        </p>

      </div>
    `,
  });
};

// =====================================================
// SEND FORGOT PASSWORD OTP
// =====================================================

export const sendForgotPasswordOTPEmail = async (
  email,
  otp
) => {
  console.log(
    "FORGOT PASSWORD EMAIL TO:",
    email
  );

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Proliant Password Reset OTP",

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">

        <h2>Proliant Password Reset</h2>

        <p>
          Your password reset verification code is:
        </p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, please ignore this email.
        </p>

        <p>
          Regards,<br>
          <strong>Proliant Data LLC</strong>
        </p>

      </div>
    `,
  });

  console.log(
    "PASSWORD RESET EMAIL SENT:",
    info.messageId
  );
};

// =====================================================
// SEND TEMPORARY PASSWORD
// =====================================================

export const sendTemporaryPasswordEmail = async (
  email,
  temporaryPassword
) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Proliant Team Member Account",

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">

        <h2>Welcome to Proliant Data LLC</h2>

        <p>
          Your team member account has been created.
        </p>

        <p>
          Your temporary password is:
        </p>

        <h2 style="letter-spacing: 2px;">
          ${temporaryPassword}
        </h2>

        <p>
          Please use this temporary password to log in.
        </p>

        <p>
          You will be required to change your password after your first login.
        </p>

        <p>
          Regards,<br>
          <strong>Proliant Data LLC</strong>
        </p>

      </div>
    `,
  });
};

// =====================================================
// SEND APPLICATION THANK-YOU EMAIL TO CANDIDATE
// =====================================================

export const sendCandidateApplicationThankYouEmail = async (
  email,
  candidateName,
  position
) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Thank You for Applying to Proliant Data LLC",

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">

        <h2>Thank You for Applying</h2>

        <p>
          Dear ${candidateName},
        </p>

        <p>
          Thank you for applying for the
          <strong>${position}</strong>
          position at Proliant Data LLC.
        </p>

        <p>
          We have successfully received your application.
          Our team will review your profile and contact you
          if your application is shortlisted.
        </p>

        <p>
          Regards,<br>
          <strong>Proliant Data LLC</strong>
        </p>

      </div>
    `,
  });
};

// =====================================================
// SEND SHORTLISTED EMAIL TO HR
// =====================================================

export const sendCandidateShortlistedEmailToHR = async (
  candidate
) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.HR_NOTIFICATION_EMAIL,

    subject: `Candidate Shortlisted - ${candidate.name}`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">

        <h2>Candidate Shortlisted</h2>

        <p>
          A candidate has been shortlisted.
        </p>

        <p>
          <strong>Name:</strong> ${candidate.name}<br>
          <strong>Email:</strong> ${candidate.email}<br>
          <strong>Phone:</strong> ${candidate.phone}<br>
          <strong>Position:</strong> ${candidate.position}<br>
          <strong>Location:</strong>
          ${candidate.location || "N/A"}<br>
          <strong>Experience:</strong>
          ${candidate.yearsOfExperience ?? "N/A"} years
        </p>

        <p>
          Please review the candidate in the HR/Admin portal.
        </p>

        <p>
          Regards,<br>
          <strong>Proliant Data LLC</strong>
        </p>

      </div>
    `,
  });
};

// =====================================================
// SEND REJECTION EMAIL TO CANDIDATE
// =====================================================

export const sendCandidateRejectedEmail = async (
  email,
  candidateName,
  position
) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Application Update - Proliant Data LLC",

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">

        <h2>Application Update</h2>

        <p>
          Dear ${candidateName},
        </p>

        <p>
          Thank you for taking the time to apply for the
          <strong>${position}</strong>
          position at Proliant Data LLC.
        </p>

        <p>
          After reviewing your application, we will not be
          proceeding with your application at this time.
        </p>

        <p>
          We appreciate your interest in Proliant Data LLC
          and wish you success in your future opportunities.
        </p>

        <p>
          Regards,<br>
          <strong>Proliant Data LLC</strong>
        </p>

      </div>
    `,
  });
};

// =====================================================
// EXPORT TRANSPORTER
// =====================================================

export default transporter;