import express from "express";
import {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
} from "../controllers/leave.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getLeaves);
router.post("/", isLoggedIn, applyLeave);
router.post("/:id/action", isLoggedIn, updateLeaveStatus);

export default router;
