
// Load environment variables BEFORE any other module is evaluated.
// ES module imports are hoisted, so modules such as emailService read
// process.env while they are being imported.
import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import seedDatabase from "./seed/seedData.js";

// =====================================================
// AUTH MODULE
// =====================================================

import authRoutes from "./modules/auth/routes/authRoutes.js";

// =====================================================
// ADMINISTRATOR MODULE
// =====================================================

import adminRoutes from "./modules/administrator/routes/adminRoutes.js";
import departmentAdminRoutes from "./modules/department-admin/routes/departmentAdminRoutes.js";

// =====================================================
// HR MODULE
// =====================================================

import employeeRoutes from "./modules/hr/routes/HRemployeeRoutes.js";
import locationRoutes from "./modules/hr/routes/HRlocationRoutes.js";
import dashboardRoutes from "./modules/hr/routes/HRdashboardRoutes.js";
import contactRoutes from "./modules/hr/routes/HRFeedbackRoutes.js";
import candidateRoutes from "./modules/candidate/routes/candidateRoutes.js";
import hrCandidateRoutes from "./modules/hr/routes/HRcandidateRoutes.js";
import jobRoutes from "./modules/hr/routes/HRjobRoutes.js";
import teamMemberRoutes from "./modules/administrator/routes/teamMemberRoutes.js";
import siteSettingRoutes from "./modules/hr/routes/HRsiteSettingRoutes.js";
import hrScreenerRoutes from "./modules/hr/routes/HRscreenerRoutes.js";
import notificationRoutes from "./modules/notifications/routes/notificationRoutes.js";
import publicRoutes from "./modules/public/routes/publicRoutes.js";
import reportRoutes from "./modules/reports/routes/reportRoutes.js";
import applicationRoutes from "./modules/candidate/routes/applicationRoutes.js";

// =====================================================
// SCREENER MODULE
// =====================================================

import screeningRoutes from "./modules/screener/routes/screeningRoutes.js";

// =====================================================
// INTERVIEWER MODULE
// =====================================================

import interviewRoutes, {
  applicationInterviewRouter,
  evaluationFormRouter,
} from "./modules/interviewer/routes/interviewRoutes.js";

// =====================================================
// HIRING MANAGER MODULE
// =====================================================

import hiringManagerRoutes, {
  applicationHiringManagerRouter,
} from "./modules/hiring-manager/routes/hiringManagerRoutes.js";

// =====================================================
// CANDIDATE MODULE
// =====================================================

import candidateAuthRoutes from "./modules/candidate/routes/candidateAuthRoutes.js";
import candidateProfileRoutes from "./modules/candidate/routes/candidateProfileRoute.js";
import candidateJobRoutes from "./modules/candidate/routes/candidateJobRoutes.js";
import candidateApplicationRoutes from "./modules/candidate/routes/candidateApplicationRoute.js";
import candidateDashboardRoute from "./modules/candidate/routes/candidateDashboardRoute.js";
import candidateNotificationRoutes from "./modules/candidate/routes/candidateNotificationRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://proliant-webpage.onrender.com",
      "https://admin-proliant.onrender.com",
    ],
  })
);

// A candidate application may carry a Base64 resume (up to ~21 MB),
// so that single endpoint gets a larger body limit. Every other
// endpoint keeps the small default limit.
app.use("/api/candidates", express.json({ limit: "25mb" }));
app.use("/api/hr-candidates", express.json({ limit: "25mb" }));
app.use(express.json());

// =====================================================
// ROUTE REGISTRATION
// =====================================================

const registerRoutes = () => {
  // Authentication APIs
  app.use("/api/auth", authRoutes);

  // Administrator APIs
  app.use("/api/admin", adminRoutes);

  // Department Administrator APIs
  app.use("/api/department-admin", departmentAdminRoutes);

  // HR APIs
  app.use("/api/employees", employeeRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/contacts", contactRoutes);
  // Registration-based Candidate workflow (model Candidate, collection candidates)
  app.use("/api/candidates", candidateRoutes);

  // HR application records (model HRCandidate, collection hrcandidates)
  app.use("/api/hr-candidates", hrCandidateRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/settings", siteSettingRoutes);
  app.use("/api/hr-screeners", hrScreenerRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/reports", reportRoutes);

  // Team-member management
  app.use("/api/auth/team-members", teamMemberRoutes);

  // Hiring Manager APIs
  app.use("/api/hiring", hiringManagerRoutes);

  app.use(
    "/api/applications",
    applicationHiringManagerRouter
  );

  // Application APIs
  app.use("/api/applications", applicationRoutes);

  // Interview history for applications
  app.use(
    "/api/applications",
    applicationInterviewRouter
  );

  // L0 Screener APIs
  app.use("/api/screenings", screeningRoutes);

  // Interviewer APIs
  app.use("/api/interviews", interviewRoutes);
  app.use("/api/evaluation-forms", evaluationFormRouter);

  // Candidate Portal APIs
  app.use("/api/candidate/auth", candidateAuthRoutes);
  app.use("/api/candidate", candidateProfileRoutes);
  app.use("/api/candidate/jobs", candidateJobRoutes);
  app.use("/api/candidate/dashboard", candidateDashboardRoute);
  app.use("/api/candidate/applications", candidateApplicationRoutes);
  app.use("/api/candidate/notifications", candidateNotificationRoutes);

  // Health / Root endpoint
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Proliant Backend is running",
    });
  });

  // Unknown route -> JSON 404 (instead of an HTML error page)
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found.",
    });
  });

  // Central error handler: body-parser errors and anything unexpected.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error?.type === "entity.too.large") {
      return res.status(413).json({
        success: false,
        message: "Request body is too large.",
      });
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({
        success: false,
        message: "Request body contains invalid JSON.",
      });
    }

    console.error("Unhandled error:", error);

    return res.status(error?.status || 500).json({
      success: false,
      message: error?.status && error.status < 500 ? error.message : "Internal server error.",
    });
  });
};

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    await connectDB();

    // Run database seed logic
    await seedDatabase();

    // Register all API routes
    registerRoutes();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();