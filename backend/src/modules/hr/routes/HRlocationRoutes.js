import express from "express";

import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/HRlocationController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getLocations);
router.post("/", authMiddleware, addLocation);
router.put("/:id", authMiddleware, updateLocation);
router.delete("/:id", authMiddleware, deleteLocation);

export default router;