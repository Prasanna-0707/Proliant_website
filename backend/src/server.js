
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

// Candidate Portal routes
import candidateAuthRoutes from "./modules/candidate/routes/candidateAuthRoutes.js";
import candidateProfileRoutes from "./modules/candidate/routes/candidateProfileRoute.js";
import candidateJobRoutes from "./modules/candidate/routes/candidateJobRoutes.js";
import candidateApplicationRoutes from "./modules/candidate/routes/candidateApplicationRoute.js";
import candidateDashboardRoute from "./modules/candidate/routes/candidateDashboardRoute.js";
import candidateNotificationRoutes from "./modules/candidate/routes/candidateNotificationRoute.js";

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: [
      // Development
      "http://localhost:5173", // Public Website
      "http://localhost:5174", // Admin Portal

      // Production
      "https://proliant-webpage.onrender.com", // Public Website
      "https://admin-proliant.onrender.com", // Admin Portal
    ],
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed initial database data
    await seedDatabase();

    // =================================================
    // EXISTING API ROUTES
    // =================================================

    // Employee routes
    app.use("/api/employees", employeeRoutes);

    // Team Members APIs
    app.use("/api/auth/team-members", teamMemberRoute);

    // Authentication routes
    app.use("/api/auth", authRoutes);

    // Location routes
    app.use("/api/locations", locationRoutes);

    // Dashboard routes
    app.use("/api/dashboard", dashboardRoutes);

    // Contact routes
    app.use("/api/contacts", contactRoutes);

    // Existing Candidate routes
    app.use("/api/candidates", candidateRoutes);

    // Job routes
    app.use("/api/jobs", jobRoutes);

    // Site Settings routes
    app.use("/api/settings", siteSettingRoutes);

    // Application routes
    app.use("/api/applications", applicationRoutes);

    // =================================================
    // CANDIDATE PORTAL API ROUTES
    // =================================================

    // Candidate Authentication
    app.use("/api/candidate/auth", candidateAuthRoutes);

    // Candidate Profile
    app.use("/api/candidate", candidateProfileRoutes);

    // Candidate Jobs
    app.use("/api/candidate/jobs", candidateJobRoutes);

    // Candidate Dashboard
    app.use("/api/candidate/dashboard", candidateDashboardRoute);

    // Candidate Applications
    app.use("/api/candidate/applications", candidateApplicationRoutes);

    // Candidate Notifications
    app.use(
      "/api/candidate/notifications",
      candidateNotificationRoutes
    );

    // =================================================
    // ROOT ROUTE
    // =================================================

    app.get("/", (req, res) => {
      res.json({
        message: "Proliant Backend is running",
      });
    });

    // =================================================
    // START LISTENING
    // =================================================

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    process.exit(1);
  }
};

startServer();
