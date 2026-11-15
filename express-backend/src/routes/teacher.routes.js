import express from "express";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/teacher.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.post("/", isLoggedIn, createStaff);
router.put("/:id", isLoggedIn, updateStaff);
router.delete("/:id", isLoggedIn, deleteStaff);

export default router;
