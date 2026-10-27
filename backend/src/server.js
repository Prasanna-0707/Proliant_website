
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import seedDatabase from "./seed/seedData.js";

// Existing routes
import employeeRoutes from "./routes/employeeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import teamMemberRoute from "./routes/teamMemberRoute.js";
import siteSettingRoutes from "./routes/siteSettingRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import screeningRoutes from "./modules/screener/routes/screeningRoutes.js";

// L1/L2 and configurable interviewer module
import interviewRoutes, {
  applicationInterviewRouter,
  evaluationFormRouter,
} from "./modules/interviewer/routes/interviewRoutes.js";

// Hiring manager module
import hiringManagerRoutes, {
  applicationHiringManagerRouter,
} from "./modules/hiring-manager/routes/hiringManagerRoutes.js";

// Candidate portal routes
import candidateAuthRoutes from "./modules/candidate/routes/candidateAuthRoutes.js";
import candidateProfileRoutes from "./modules/candidate/routes/candidateProfileRoute.js";
import candidateJobRoutes from "./modules/candidate/routes/candidateJobRoutes.js";
import candidateApplicationRoutes from "./modules/candidate/routes/candidateApplicationRoute.js";
import candidateDashboardRoute from "./modules/candidate/routes/candidateDashboardRoute.js";
import candidateNotificationRoutes from "./modules/candidate/routes/candidateNotificationRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      // Development
      "http://localhost:5173",
      "http://localhost:5174",

      // Production
      "https://proliant-webpage.onrender.com",
      "https://admin-proliant.onrender.com",
    ],
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed initial database data
    await seedDatabase();

    // ================================================
    // EXISTING APIs
    // ================================================

    app.use("/api/employees", employeeRoutes);

    app.use("/api/auth/team-members", teamMemberRoute);

    app.use("/api/auth", authRoutes);

    app.use("/api/locations", locationRoutes);

    app.use("/api/dashboard", dashboardRoutes);

    app.use("/api/contacts", contactRoutes);

    app.use("/api/candidates", candidateRoutes);

    app.use("/api/jobs", jobRoutes);

    app.use("/api/settings", siteSettingRoutes);

    // ================================================
    // HIRING MANAGER APIs
    // ================================================

    app.use("/api/hiring", hiringManagerRoutes);

    // Register hiring manager application routes
    // before the existing application routes.
    app.use(
      "/api/applications",
      applicationHiringManagerRouter
    );

    // ================================================
    // APPLICATION APIs
    // ================================================

    app.use("/api/applications", applicationRoutes);

    // Interview history for a specific application
    app.use(
      "/api/applications",
      applicationInterviewRouter
    );

    // ================================================
    // L0 SCREENER APIs
    // ================================================

    app.use("/api/screenings", screeningRoutes);

    // ================================================
    // L1/L2 INTERVIEWER APIs
    // ================================================

    app.use("/api/interviews", interviewRoutes);

    app.use(
      "/api/evaluation-forms",
      evaluationFormRouter
    );

    // ================================================
    // CANDIDATE PORTAL APIs
    // ================================================

    app.use("/api/candidate/auth", candidateAuthRoutes);

    app.use("/api/candidate", candidateProfileRoutes);

    app.use("/api/candidate/jobs", candidateJobRoutes);

    app.use(
      "/api/candidate/dashboard",
      candidateDashboardRoute
    );

    app.use(
      "/api/candidate/applications",
      candidateApplicationRoutes
    );

    app.use(
      "/api/candidate/notifications",
      candidateNotificationRoutes
    );

    // ================================================
    // ROOT ROUTE
    // ================================================

    app.get("/", (req, res) => {
      res.json({
        message: "Proliant Backend is running",
      });
    });

    // ================================================
    // START LISTENING
    // ================================================

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();