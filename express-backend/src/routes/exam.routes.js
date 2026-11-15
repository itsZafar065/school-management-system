import express from "express";
import {
  getExamTerms,
  createExamTerm,
  lockExamTerm,
  getExamResults,
  saveExamResults,
  getReportCard,
} from "../controllers/exam.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/terms", getExamTerms);
router.post("/terms", isLoggedIn, createExamTerm);
router.post("/terms/:id/lock", isLoggedIn, lockExamTerm);
router.get("/results", getExamResults);
router.post("/results", isLoggedIn, saveExamResults);
router.get("/report-card/:studentId", getReportCard);

export default router;
