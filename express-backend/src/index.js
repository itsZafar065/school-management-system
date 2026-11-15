import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Route Imports
import authRoutes from "./routes/auth.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import classRoutes from "./routes/class.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import feeRoutes from "./routes/fee.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import examRoutes from "./routes/exam.routes.js";
import diaryRoutes from "./routes/diary.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import backupRoutes from "./routes/backup.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check / root route
app.get("/", (req, res) => {
  res.json({
    name: "School Management System API",
    database: "SQLite (Prisma ORM)",
    status: "Healthy",
    version: "2.0.0",
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SMS Backend] Server running on port ${PORT} with SQLite database.`);
});
