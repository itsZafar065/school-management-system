import express from "express";
import {
  getChallans,
  getChallanById,
  generateChallans,
  payChallan,
  getDefaulters,
  getFeeReports,
  getStudentLedger,
} from "../controllers/fee.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/challans", getChallans);
router.get("/challans/:id", getChallanById);
router.post("/generate", isLoggedIn, generateChallans);
router.post("/pay/:id", isLoggedIn, payChallan);
router.get("/defaulters", getDefaulters);
router.get("/reports", getFeeReports);
router.get("/ledger/:studentId", getStudentLedger);

export default router;
