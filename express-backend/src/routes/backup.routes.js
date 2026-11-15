import express from "express";
import { downloadBackup, getAuditLogs } from "../controllers/backup.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/download", isLoggedIn, downloadBackup);
router.get("/audit", isLoggedIn, getAuditLogs);

export default router;
