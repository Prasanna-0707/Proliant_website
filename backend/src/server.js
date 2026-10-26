import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import seedDatabase from "./seed/seedData.js";

import employeeRoutes from "./routes/employeeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import teamMemberRoute from "./routes/teamMemberRoute.js";
import siteSettingRoutes from "./routes/siteSettingRoutes.js";

import candidateAuthRoutes from "./modules/candidate/routes/candidateAuthRoutes.js";
import candidateProfileRoutes from "./modules/candidate/routes/candidateProfileRoute.js";
import candidateJobRoutes from "./modules/candidate/routes/candidateJobRoutes.js";

import candidateApplicationRoutes from "./modules/candidate/routes/candidateApplicationRoute.js";
import candidateDashboardRoute from "./modules/candidate/routes/candidateDashboardRoute.js";

import candidateNotificationRoutes from "./modules/candidate/routes/candidateNotificationRoute.js";



dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      // Development
      "http://localhost:5173", // Public Website
      "http://localhost:5174", // Admin Portal

      // Production
      "https://proliant-webpage.onrender.com", // Public Website
      "https://admin-proliant.onrender.com",   // Admin Portal
    ],
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed initial database data
    await seedDatabase();

    // Employee routes
    app.use("/api/employees", employeeRoutes);

    // Authentication routes
    app.use("/api/auth", authRoutes);

    // Location routes
    app.use("/api/locations", locationRoutes);

    // Dashboard routes
    app.use("/api/dashboard", dashboardRoutes);

    // Contact routes
    app.use("/api/contacts", contactRoutes);

    // Candidate routes
    app.use("/api/candidates", candidateRoutes);

    // Job routes
    app.use("/api/jobs", jobRoutes);

    // Team Member routes
    app.use("/api/auth/team-members", teamMemberRoute);

    // Site Settings routes
    app.use("/api/settings", siteSettingRoutes);

    // Candidate Authentication Routes
    app.use("/api/candidate/auth", candidateAuthRoutes);
    
    // Candidate Profile Routes
    app.use("/api/candidate", candidateProfileRoutes);

    // Candidate Job Routes
    app.use("/api/candidate/jobs", candidateJobRoutes);

    // Candidate Dashboard Routes
    app.use("/api/candidate/dashboard", candidateDashboardRoute);

    // Candidate Application Routes
    app.use("/api/candidate/applications", candidateApplicationRoutes);

    // Candidate Notification Routes
    app.use(
      "/api/candidate/notifications",
      candidateNotificationRoutes
    );

    app.get("/", (req, res) => {
      res.json({
        message: "Proliant Backend is running",
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};


startServer();