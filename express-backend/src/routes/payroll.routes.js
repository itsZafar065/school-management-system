import express from "express";
import {
  getPayrolls,
  generatePayroll,
  updatePayroll,
  paySalary,
} from "../controllers/payroll.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getPayrolls);
router.post("/generate", isLoggedIn, generatePayroll);
router.put("/:id", isLoggedIn, updatePayroll);
router.post("/:id/pay", isLoggedIn, paySalary);

export default router;
