import express from "express";

import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} from "../controllers/HRFeedbackController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";
import requireHrAccess from "../middleware/requireHrAccess.js";

const router = express.Router();

router.param("id", validateObjectIdParam);

// Public: anyone can submit a contact enquiry from the website.
router.post("/", createContact);

// Reading and managing enquiries: HR and Global Administrators only.
router.get("/", authMiddleware, requireHrAccess, getContacts);
router.get("/:id", authMiddleware, requireHrAccess, getContact);
router.patch("/:id/status", authMiddleware, requireHrAccess, updateContactStatus);
router.delete("/:id", authMiddleware, requireHrAccess, deleteContact);

export default router;