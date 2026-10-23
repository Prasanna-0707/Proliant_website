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
import applicationRoutes from "./routes/applicationRoutes.js";

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
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
    await connectDB();

    await seedDatabase();

    // =================================================
    // API ROUTES
    // =================================================

    app.use("/api/employees", employeeRoutes);

    // Team Members APIs
    app.use("/api/auth/team-members", teamMemberRoute);

    // Login, OTP, profile, password, and logout APIs
    app.use("/api/auth", authRoutes);

    app.use("/api/locations", locationRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/contacts", contactRoutes);
    app.use("/api/candidates", candidateRoutes);
    app.use("/api/jobs", jobRoutes);
    app.use("/api/settings", siteSettingRoutes);
    app.use("/api/applications", applicationRoutes);

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
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();