import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadBackup = async (req, res, next) => {
  try {
    const dbPath = path.resolve(__dirname, "../../prisma/dev.db");
    if (!fs.existsSync(dbPath)) {
      throw new ApiError(404, "Database file not found for backup");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `school_db_backup_${timestamp}.db`;

    res.download(dbPath, filename);
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { id: "desc" },
      take: 100,
    });
    return res.status(200).json(new ApiResponse(200, logs, "Audit logs fetched"));
  } catch (error) {
    next(error);
  }
};

export { downloadBackup, getAuditLogs };
