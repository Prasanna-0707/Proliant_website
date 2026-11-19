import express from "express";

import SiteSetting from "../../hr/models/HRSiteSetting.js";
import Location from "../../hr/models/HRLocation.js";
import { sendError } from "../../../shared/utils/httpErrors.js";

// Base URL: /api/public  (no authentication; read-only, aggregate data only)
const router = express.Router();

// GET /api/public/stats  -> "Proliant in Numbers"
router.get("/stats", async (req, res) => {
  try {
    const [setting, locations] = await Promise.all([
      SiteSetting.findOne({ key: "employeeCount" }).lean(),
      Location.find().select("country city").lean(),
    ]);

    const countries = new Set(
      locations
        .map((item) => String(item.country || "").trim().toLowerCase())
        .filter(Boolean)
    );

    return res.status(200).json({
      success: true,
      stats: {
        // 130 is the default of the employee-count site setting; nothing is
        // written here (this route is read-only).
        employees: setting?.employeeCount ?? 130,
        globalDeployments: locations.length,
        countries: countries.size,
      },
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch statistics.");
  }
});

export default router;
