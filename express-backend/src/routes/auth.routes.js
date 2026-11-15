import express from "express";
import { login, logout, getMe } from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isLoggedIn, getMe);

export default router;
