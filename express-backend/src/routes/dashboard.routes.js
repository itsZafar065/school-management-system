import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stats", isLoggedIn, getDashboardStats);

export default router;
