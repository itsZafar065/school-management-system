import express from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/class.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.post("/", isLoggedIn, createClass);
router.put("/:id", isLoggedIn, updateClass);
router.delete("/:id", isLoggedIn, deleteClass);

export default router;
