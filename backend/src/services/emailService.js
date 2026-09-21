import "dotenv/config";
import nodemailer from "nodemailer";
console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);
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

export const sendForgotPasswordOTPEmail = async (email, otp) => {
  await transporter.sendMail({
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
// EXPORT TRANSPORTER
// =====================================================

export default transporter;