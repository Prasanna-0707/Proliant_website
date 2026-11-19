import express from "express";

import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/HRlocationController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";
import requireHrAccess from "../middleware/requireHrAccess.js";

const router = express.Router();

router.param("id", validateObjectIdParam);

// Public: office locations shown on the website.
router.get("/", getLocations);

// Managing locations: HR and Global Administrators only.
router.post("/", authMiddleware, requireHrAccess, addLocation);
router.put("/:id", authMiddleware, requireHrAccess, updateLocation);
router.delete("/:id", authMiddleware, requireHrAccess, deleteLocation);

export default router;