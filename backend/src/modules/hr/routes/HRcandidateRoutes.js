import express from "express";

import {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  exportCandidatesExcel,
} from "../controllers/HRcandidateController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requireHrAccess from "../middleware/requireHrAccess.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";

// HR application records (model HRCandidate, collection hrcandidates).
// Mounted at /api/hr-candidates.
//
// EVERY route here is protected by authMiddleware and requireHrAccess
// (HR or Global Administrator). There is no public route on this path.
// Public candidate registration happens only through POST /api/candidates.
const router = express.Router();

const hrOnly = [authMiddleware, requireHrAccess];

router.param("id", validateObjectIdParam);

router.post("/", ...hrOnly, createCandidate);
router.get("/", ...hrOnly, getCandidates);
router.get("/export/excel", ...hrOnly, exportCandidatesExcel);
router.get("/:id", ...hrOnly, getCandidate);
router.put("/:id", ...hrOnly, updateCandidate);
router.delete("/:id", ...hrOnly, deleteCandidate);

export default router;
