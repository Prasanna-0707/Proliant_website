
import express from "express";


import {
  registerCandidate,
  loginCandidate,
} from "../controllers/candidateAuthController.js";


const router = express.Router();

// Candidate Registration
router.post("/register", registerCandidate);

// Candidate Login
router.post("/login", loginCandidate);

export default router;