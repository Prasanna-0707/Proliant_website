import "dotenv/config";

// =====================================================
// MAILGUN CONFIGURATION
// =====================================================

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM;

// Mailgun API region
// Default: US region
const MAILGUN_API_BASE_URL =
  process.env.MAILGUN_API_BASE_URL ||
  "https://api.mailgun.net/v3";

// =====================================================
// SEND EMAIL THROUGH MAILGUN HTTP API
// =====================================================

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  if (!MAILGUN_API_KEY) {
    throw new Error("MAILGUN_API_KEY is not configured");
  }

  if (!MAILGUN_DOMAIN) {
    throw new Error("MAILGUN_DOMAIN is not configured");
  }

  if (!MAILGUN_FROM) {
    throw new Error("MAILGUN_FROM is not configured");
  }

  const formData = new URLSearchParams();

  formData.append("from", MAILGUN_FROM);
  formData.append("to", to);
  formData.append("subject", subject);
  formData.append("html", html);

  const response = await fetch(
    `${MAILGUN_API_BASE_URL}/${MAILGUN_DOMAIN}/messages`,
    {
      method: "POST",

      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64"),

        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: formData.toString(),
    }
  );

  const responseData = await response.text();

  if (!response.ok) {
    console.error(
      "MAILGUN EMAIL ERROR:",
      response.status,
      responseData
    );

    throw new Error(
      `Mailgun email failed: ${response.status} ${responseData}`
    );
  }

  console.log(
    "MAILGUN EMAIL SENT:",
    responseData
  );

  return responseData;
};

// =====================================================
// SEND LOGIN OTP
// =====================================================

export const sendLoginOTPEmail = async (
  email,
  otp
) => {
  await sendEmail({
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

  const result = await sendEmail({
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
    result
  );
};

// =====================================================
// SEND TEMPORARY PASSWORD
// =====================================================

export const sendTemporaryPasswordEmail = async (
  email,
  temporaryPassword
) => {
  await sendEmail({
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
  await sendEmail({
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
  await sendEmail({
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
  await sendEmail({
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


// import "dotenv/config";
// import nodemailer from "nodemailer";

// // =====================================================
// // EMAIL TRANSPORTER
// // =====================================================

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: process.env.SMTP_SECURE === "true",

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// // =====================================================
// // SEND LOGIN OTP
// // =====================================================

// export const sendLoginOTPEmail = async (email, otp) => {
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: "Proliant Admin Login OTP",

//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">

//         <h2>Proliant Admin Login</h2>

//         <p>
//           Your login verification code is:
//         </p>

//         <h1 style="letter-spacing: 5px;">
//           ${otp}
//         </h1>

//         <p>
//           This OTP is valid for <strong>5 minutes</strong>.
//         </p>

//         <p>
//           If you did not try to log in, please ignore this email.
//         </p>

//         <p>
//           Regards,<br>
//           <strong>Proliant Data LLC</strong>
//         </p>

//       </div>
//     `,
//   });
// };

// // =====================================================
// // SEND FORGOT PASSWORD OTP
// // =====================================================

// export const sendForgotPasswordOTPEmail = async (
//   email,
//   otp
// ) => {
//   console.log(
//     "FORGOT PASSWORD EMAIL TO:",
//     email
//   );

//   const info = await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: "Proliant Password Reset OTP",

//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">

//         <h2>Proliant Password Reset</h2>

//         <p>
//           Your password reset verification code is:
//         </p>

//         <h1 style="letter-spacing: 5px;">
//           ${otp}
//         </h1>

//         <p>
//           This OTP is valid for <strong>5 minutes</strong>.
//         </p>

//         <p>
//           If you did not request a password reset, please ignore this email.
//         </p>

//         <p>
//           Regards,<br>
//           <strong>Proliant Data LLC</strong>
//         </p>

//       </div>
//     `,
//   });

//   console.log(
//     "PASSWORD RESET EMAIL SENT:",
//     info.messageId
//   );
// };

// // =====================================================
// // SEND TEMPORARY PASSWORD
// // =====================================================

// export const sendTemporaryPasswordEmail = async (
//   email,
//   temporaryPassword
// ) => {
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: "Proliant Team Member Account",

//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">

//         <h2>Welcome to Proliant Data LLC</h2>

//         <p>
//           Your team member account has been created.
//         </p>

//         <p>
//           Your temporary password is:
//         </p>

//         <h2 style="letter-spacing: 2px;">
//           ${temporaryPassword}
//         </h2>

//         <p>
//           Please use this temporary password to log in.
//         </p>

//         <p>
//           You will be required to change your password after your first login.
//         </p>

//         <p>
//           Regards,<br>
//           <strong>Proliant Data LLC</strong>
//         </p>

//       </div>
//     `,
//   });
// };

// // =====================================================
// // SEND APPLICATION THANK-YOU EMAIL TO CANDIDATE
// // =====================================================

// export const sendCandidateApplicationThankYouEmail = async (
//   email,
//   candidateName,
//   position
// ) => {
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: "Thank You for Applying to Proliant Data LLC",

//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">

//         <h2>Thank You for Applying</h2>

//         <p>
//           Dear ${candidateName},
//         </p>

//         <p>
//           Thank you for applying for the
//           <strong>${position}</strong>
//           position at Proliant Data LLC.
//         </p>

//         <p>
//           We have successfully received your application.
//           Our team will review your profile and contact you
//           if your application is shortlisted.
//         </p>

//         <p>
//           Regards,<br>
//           <strong>Proliant Data LLC</strong>
//         </p>

//       </div>
//     `,
//   });
// };

// // =====================================================
// // SEND SHORTLISTED EMAIL TO HR
// // =====================================================

// export const sendCandidateShortlistedEmailToHR = async (
//   candidate
// ) => {
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: process.env.HR_NOTIFICATION_EMAIL,

//     subject: `Candidate Shortlisted - ${candidate.name}`,

//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">

//         <h2>Candidate Shortlisted</h2>

//         <p>
//           A candidate has been shortlisted.
//         </p>

//         <p>
//           <strong>Name:</strong> ${candidate.name}<br>
//           <strong>Email:</strong> ${candidate.email}<br>
//           <strong>Phone:</strong> ${candidate.phone}<br>
//           <strong>Position:</strong> ${candidate.position}<br>
//           <strong>Location:</strong>
//           ${candidate.location || "N/A"}<br>
//           <strong>Experience:</strong>
//           ${candidate.yearsOfExperience ?? "N/A"} years
//         </p>

//         <p>
//           Please review the candidate in the HR/Admin portal.
//         </p>

//         <p>
//           Regards,<br>
//           <strong>Proliant Data LLC</strong>
//         </p>

//       </div>
//     `,
//   });
// };

// // =====================================================
// // SEND REJECTION EMAIL TO CANDIDATE
// // =====================================================

// export const sendCandidateRejectedEmail = async (
//   email,
//   candidateName,
//   position
// ) => {
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: "Application Update - Proliant Data LLC",

//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6;">

//         <h2>Application Update</h2>

//         <p>
//           Dear ${candidateName},
//         </p>

//         <p>
//           Thank you for taking the time to apply for the
//           <strong>${position}</strong>
//           position at Proliant Data LLC.
//         </p>

//         <p>
//           After reviewing your application, we will not be
//           proceeding with your application at this time.
//         </p>

//         <p>
//           We appreciate your interest in Proliant Data LLC
//           and wish you success in your future opportunities.
//         </p>

//         <p>
//           Regards,<br>
//           <strong>Proliant Data LLC</strong>
//         </p>

//       </div>
//     `,
//   });
// };

// // =====================================================
// // EXPORT TRANSPORTER
// // =====================================================

// export default transporter;

// =====================================================
// CANDIDATE PASSWORD RESET
// =====================================================

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const emailShell = (heading, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>${escapeHtml(heading)}</h2>
    ${bodyHtml}
    <p>
      Regards,<br>
      <strong>Proliant Data LLC</strong>
    </p>
  </div>
`;

export const sendCandidatePasswordResetOTPEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Proliant Candidate Password Reset OTP",
    html: emailShell(
      "Proliant Candidate Password Reset",
      `<p>Your password reset verification code is:</p>
       <h1 style="letter-spacing: 5px;">${escapeHtml(otp)}</h1>
       <p>This OTP is valid for <strong>5 minutes</strong>.</p>
       <p>If you did not request a password reset, please ignore this email.</p>`
    ),
  });
};

export const sendCandidatePasswordChangedEmail = async (email, name = "") => {
  await sendEmail({
    to: email,
    subject: "Your Proliant password was changed",
    html: emailShell(
      "Password changed",
      `<p>Hello ${escapeHtml(name)},</p>
       <p>The password for your Proliant candidate account was just changed.
       If you did not do this, contact HR immediately.</p>`
    ),
  });
};

// =====================================================
// INTERVIEW NOTIFICATIONS (interviewer + candidate)
// =====================================================

const formatWhen = (date, timeZone) => {
  try {
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timeZone || "UTC",
    }) + ` (${timeZone || "UTC"})`;
  } catch {
    return String(date);
  }
};

const INTERVIEW_EVENT_TEXT = {
  scheduled: {
    subject: "Interview scheduled",
    lead: "An interview has been scheduled.",
  },
  rescheduled: {
    subject: "Interview rescheduled",
    lead: "An interview has been rescheduled. Please note the new time.",
  },
  cancelled: {
    subject: "Interview cancelled",
    lead: "An interview has been cancelled.",
  },
};

// recipient: { email, name }, interview: plain object with the fields used below.
export const sendInterviewEmail = async (event, recipient, interview) => {
  const text = INTERVIEW_EVENT_TEXT[event];

  if (!text || !recipient?.email) return;

  const rows = [
    ["Position", interview.position],
    ["Stage", interview.stageName],
    ["Candidate", interview.candidateName],
    ["Interviewer", interview.interviewerName],
    ["When", interview.scheduledAt && formatWhen(interview.scheduledAt, interview.timeZone)],
    ["Mode", interview.mode],
    ["Meeting link", interview.meetingLink],
    ["Location", interview.location],
    ["Instructions", interview.instructions],
    ["Reason", interview.reason],
  ]
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:2px 12px 2px 0"><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`
    )
    .join("");

  await sendEmail({
    to: recipient.email,
    subject: `Proliant: ${text.subject}`,
    html: emailShell(
      text.subject,
      `<p>Hello ${escapeHtml(recipient.name || "")},</p>
       <p>${escapeHtml(text.lead)}</p>
       <table>${rows}</table>`
    ),
  });
};

// =====================================================
// RECRUITMENT SUMMARY REPORT (aggregate statistics only)
// Candidate names, contact details and interview feedback are never
// included in this email.
// =====================================================

export const sendRecruitmentSummaryEmail = async (email, stats, sentByName = "") => {
  const cell = (value) => (value === null || value === undefined ? "—" : escapeHtml(value));

  const rows = stats.departmentWise
    .map(
      (row) =>
        `<tr>
          <td style="padding:6px 12px;border:1px solid #ddd">${escapeHtml(row.department)}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${cell(row.inInterviewProcess)}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${cell(row.selected)}</td>
          <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${cell(row.joined)}</td>
        </tr>`
    )
    .join("");

  const total = stats.organizationTotal;
  const range = stats.filters?.dateRange?.label;

  await sendEmail({
    to: email,
    subject: "Proliant recruitment summary",
    html: emailShell(
      "Recruitment summary",
      `<p>Aggregate recruitment statistics${range ? ` for <strong>${escapeHtml(range)}</strong>` : ""}${
        stats.filters?.department ? ` (department: ${escapeHtml(stats.filters.department)})` : ""
      }.</p>
       <table style="border-collapse:collapse">
         <thead><tr>
           <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Department</th>
           <th style="padding:6px 12px;border:1px solid #ddd">In Interview Process</th>
           <th style="padding:6px 12px;border:1px solid #ddd">Selected</th>
           <th style="padding:6px 12px;border:1px solid #ddd">Recruited / Joined</th>
         </tr></thead>
         <tbody>${rows}
           <tr style="font-weight:bold">
             <td style="padding:6px 12px;border:1px solid #ddd">Organization Total</td>
             <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${cell(total.inInterviewProcess)}</td>
             <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${cell(total.selected)}</td>
             <td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${cell(total.joined)}</td>
           </tr>
         </tbody>
       </table>
       <p style="font-size:12px;color:#666">Selected includes candidates who have joined. Joined counts only
       candidates with a confirmed joining date. This summary contains aggregate counts only.${
         sentByName ? ` Sent by ${escapeHtml(sentByName)}.` : ""
       }</p>`
    ),
  });
};