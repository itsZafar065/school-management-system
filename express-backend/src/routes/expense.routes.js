import express from "express";
import {
  getExpenses,
  createExpense,
  getIncomeExpenseReport,
} from "../controllers/expense.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getExpenses);
router.post("/", isLoggedIn, createExpense);
router.get("/report", getIncomeExpenseReport);

export default router;
