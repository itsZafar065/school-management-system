import express from "express";
import {
  getDiaryNotices,
  createDiaryNotice,
  deleteDiaryNotice,
} from "../controllers/diary.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getDiaryNotices);
router.post("/", isLoggedIn, createDiaryNotice);
router.delete("/:id", isLoggedIn, deleteDiaryNotice);

export default router;
