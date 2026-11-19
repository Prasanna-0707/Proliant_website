import express from "express";

import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} from "../controllers/HRFeedbackController.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", getContacts);
router.get("/:id", getContact);
router.patch("/:id/status", updateContactStatus);
router.delete("/:id", deleteContact);

export default router;