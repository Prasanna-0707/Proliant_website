
import express from "express";
import dotenv from "dotenv";
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
import candidateRoutes from "./modules/hr/routes/HRcandidateRoutes.js";
import jobRoutes from "./modules/hr/routes/HRjobRoutes.js";
import teamMemberRoute from "./modules/hr/routes/HRteamMemberRoute.js";
import siteSettingRoutes from "./modules/hr/routes/HRsiteSettingRoutes.js";
import applicationRoutes from "./modules/hr/routes/HRapplicationRoutes.js";

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

dotenv.config();

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
  app.use("/api/candidates", candidateRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/settings", siteSettingRoutes);

  // Team-member management
  app.use("/api/auth/team-members", teamMemberRoute);

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