import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  promoteStudent,
  findSiblingsByCnic,
} from "../controllers/student.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/siblings", findSiblingsByCnic);
router.get("/:id", getStudentById);
router.post("/", isLoggedIn, createStudent);
router.put("/:id", isLoggedIn, updateStudent);
router.post("/:id/status", isLoggedIn, updateStudentStatus);
router.post("/:id/promote", isLoggedIn, promoteStudent);

export default router;
