import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user ? req.user.role : "Admin";
    const todayStr = new Date().toISOString().split("T")[0];

    // Core Metrics
    const totalStudents = await prisma.student.count({ where: { status: "Active" } });
    const totalTeachers = await prisma.staff.count({ where: { role: "Teacher", status: "Active" } });
    const totalClasses = await prisma.classSection.count();

    // Today's Student Attendance
    const todayStudentAttendance = await prisma.studentAttendance.findMany({
      where: { date: todayStr },
    });
    const stuPresent = todayStudentAttendance.filter((a) => a.status === "Present").length;
    const stuAbsent = todayStudentAttendance.filter((a) => a.status === "Absent").length;
    const stuLate = todayStudentAttendance.filter((a) => a.status === "Late").length;
    const studentAttendancePct =
      todayStudentAttendance.length > 0
        ? Math.round((stuPresent / todayStudentAttendance.length) * 100)
        : 90;

    // Today's Staff Attendance
    const todayStaffAttendance = await prisma.staffAttendance.findMany({
      where: { date: todayStr },
    });
    const staffPresent = todayStaffAttendance.filter((a) => a.status === "Present").length;
    const staffLate = todayStaffAttendance.filter((a) => a.isLate).length;

    // Fees overview
    const challans = await prisma.feeChallan.findMany();
    const feeCollected = challans.reduce((sum, c) => sum + c.paidAmount, 0);
    const feeOutstanding = challans.reduce((sum, c) => sum + c.balance, 0);
    const defaultersCount = await prisma.feeChallan.count({
      where: { status: { in: ["Unpaid", "Partial"] } },
    });

    // Expenses overview
    const expenses = await prisma.expense.findMany();
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Pending Leaves
    const pendingLeaves = await prisma.leaveApplication.count({
      where: { status: "Pending" },
    });

    // Recent Students
    const recentStudents = await prisma.student.findMany({
      take: 6,
      orderBy: { id: "desc" },
      include: { classSection: true },
    });

    // Class Distribution
    const classes = await prisma.classSection.findMany({
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { gradeLevel: "asc" },
    });

    const classDistribution = classes.map((c) => ({
      name: `${c.name}-${c.section}`,
      count: c._count.students,
      capacity: c.capacity,
      tuitionFee: c.tuitionFee,
    }));

    // School Settings
    const setting = await prisma.setting.findFirst();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          role: userRole,
          overview: {
            totalStudents,
            totalTeachers,
            totalClasses,
            studentAttendancePct,
            staffPresent,
            staffLate,
            feeCollected,
            feeOutstanding,
            defaultersCount,
            totalExpenses,
            pendingLeaves,
          },
          attendanceToday: {
            date: todayStr,
            present: stuPresent,
            absent: stuAbsent,
            late: stuLate,
            totalMarked: todayStudentAttendance.length,
          },
          recentStudents,
          classDistribution,
          setting,
        },
        "Dashboard statistics fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

export { getDashboardStats };
