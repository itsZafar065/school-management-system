import express from "express";
import {
  getStudentAttendance,
  markStudentAttendance,
  getStaffAttendance,
  staffCheckIn,
  markStaffAttendance,
} from "../controllers/attendance.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getStudentAttendance);
router.post("/mark", isLoggedIn, markStudentAttendance);

router.get("/staff", getStaffAttendance);
router.post("/staff/checkin", isLoggedIn, staffCheckIn);
router.post("/staff/mark", isLoggedIn, markStaffAttendance);

export default router;
