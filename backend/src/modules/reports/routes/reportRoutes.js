import express from "express";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requireHrAccess from "../../hr/middleware/requireHrAccess.js";

import {
  getRecruitmentStatistics,
  parseStatisticsFilters,
  StatisticsFilterError,
} from "../../department-admin/services/recruitmentStatisticsService.js";

import { sendRecruitmentSummaryEmail } from "../../../shared/services/emailService.js";
import { createAuditLog } from "../../../shared/services/auditLogService.js";

// Base URL: /api/reports   (HR and Global Administrators)
//
// Reports are generated on request only. There is no automatic schedule:
// the email frequency is still to be confirmed by management.
const router = express.Router();

router.use(authMiddleware, requireHrAccess);

const handleError = (res, error, fallback) => {
  if (error instanceof StatisticsFilterError) {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
};

// GET /api/reports/recruitment-summary  (same filters as the dashboard)
router.get("/recruitment-summary", async (req, res) => {
  try {
    const data = await getRecruitmentStatistics(parseStatisticsFilters(req.query));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "Failed to generate the recruitment summary.");
  }
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/reports/recruitment-summary/email
//   { recipients: ["head@example.com"], department?, status?, from?, to?, year?, month?, quarter? }
router.post("/recruitment-summary/email", async (req, res) => {
  try {
    const recipients = [
      ...new Set(
        (Array.isArray(req.body?.recipients) ? req.body.recipients : [])
          .map((item) => String(item || "").trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    if (recipients.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one recipient email is required." });
    }

    if (recipients.length > 20) {
      return res
        .status(400)
        .json({ success: false, message: "A report can be sent to at most 20 recipients." });
    }

    const invalid = recipients.filter((item) => !EMAIL_PATTERN.test(item));

    if (invalid.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recipient email address.", invalid });
    }

    const stats = await getRecruitmentStatistics(parseStatisticsFilters(req.body));

    const results = [];

    for (const recipient of recipients) {
      try {
        await sendRecruitmentSummaryEmail(recipient, stats, req.user?.name || "");
        results.push({ recipient, status: "sent" });
      } catch (error) {
        console.error("Recruitment summary email failed:", error.message);
        results.push({ recipient, status: "failed" });
      }
    }

    await createAuditLog({
      req,
      action: "RECRUITMENT_SUMMARY_EMAILED",
      targetType: "Report",
      targetLabel: "Recruitment summary",
      metadata: {
        recipients: results.length,
        sent: results.filter((item) => item.status === "sent").length,
        filters: stats.filters,
      },
    }).catch((error) => console.error("Report audit failed:", error.message));

    const sent = results.filter((item) => item.status === "sent").length;

    return res.status(sent > 0 ? 200 : 502).json({
      success: sent > 0,
      message:
        sent === results.length
          ? "Recruitment summary sent."
          : sent > 0
            ? "Recruitment summary sent to some recipients."
            : "The recruitment summary could not be sent.",
      results,
    });
  } catch (error) {
    return handleError(res, error, "Failed to send the recruitment summary.");
  }
});

export default router;
