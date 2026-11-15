import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Student Attendance
const getStudentAttendance = async (req, res, next) => {
  try {
    const { date, classSectionId, class: classNameParam, className } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const where = { date: targetDate };
    if (classSectionId && classSectionId !== "all" && !isNaN(parseInt(classSectionId))) {
      where.classSectionId = parseInt(classSectionId);
    } else {
      const cls = classNameParam || className;
      if (cls && cls !== "all") {
        where.classSection = {
          name: { contains: cls },
        };
      }
    }

    const records = await prisma.studentAttendance.findMany({
      where,
      include: {
        student: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, { date: targetDate, records }, "Student attendance fetched")
    );
  } catch (error) {
    next(error);
  }
};

const markStudentAttendance = async (req, res, next) => {
  try {
    const { date, records, classSectionId } = req.body;
    if (!date || !Array.isArray(records)) {
      throw new ApiError(400, "Date and records array are required");
    }

    const formattedDate = String(date).split("T")[0];

    for (const rec of records) {
      const studentId = parseInt(rec.studentId);
      if (!studentId || isNaN(studentId)) continue;

      let classSecId = null;
      if (rec.classSectionId && !isNaN(parseInt(rec.classSectionId))) {
        classSecId = parseInt(rec.classSectionId);
      } else if (classSectionId && !isNaN(parseInt(classSectionId))) {
        classSecId = parseInt(classSectionId);
      } else {
        const stu = await prisma.student.findUnique({
          where: { id: studentId },
          select: { classSectionId: true },
        });
        classSecId = stu?.classSectionId;
      }

      // Safe fallback to valid integer
      if (!classSecId || isNaN(classSecId)) {
        classSecId = 1;
      }

      await prisma.studentAttendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: formattedDate,
          },
        },
        update: {
          status: rec.status || "Present",
          remarks: rec.remarks || null,
        },
        create: {
          studentId,
          classSectionId: classSecId,
          date: formattedDate,
          status: rec.status || "Present",
          remarks: rec.remarks || null,
        },
      });
    }

    return res.status(200).json(
      new ApiResponse(200, { date: formattedDate, count: records.length }, "Attendance marked successfully")
    );
  } catch (error) {
    next(error);
  }
};

// Staff Attendance
const getStaffAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const records = await prisma.staffAttendance.findMany({
      where: { date: targetDate },
      include: { staff: true },
    });

    // Also get all active staff to display if any haven't checked in
    const activeStaff = await prisma.staff.findMany({
      where: { status: "Active" },
      orderBy: { employeeNo: "asc" },
    });

    const combined = activeStaff.map((st) => {
      const found = records.find((r) => r.staffId === st.id);
      return {
        staffId: st.id,
        employeeNo: st.employeeNo,
        name: st.name,
        designation: st.designation,
        checkInTime: found ? found.checkInTime : null,
        checkOutTime: found ? found.checkOutTime : null,
        isLate: found ? found.isLate : false,
        status: found ? found.status : "Absent",
        remarks: found ? found.remarks : null,
      };
    });

    return res.status(200).json(
      new ApiResponse(200, { date: targetDate, records: combined }, "Staff attendance fetched")
    );
  } catch (error) {
    next(error);
  }
};

const staffCheckIn = async (req, res, next) => {
  try {
    const { staffId, checkInTime, date } = req.body;
    if (!staffId) throw new ApiError(400, "Staff ID is required");

    const targetDate = date || new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeStr = checkInTime || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Get school start time from Settings
    const setting = await prisma.setting.findFirst();
    const startTime = setting ? setting.schoolStartTime : "08:00";
    const graceMinutes = setting ? setting.lateGraceMinutes : 15;

    // Calculate if late: e.g. "08:18" > "08:15"
    const [startH, startM] = startTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM + graceMinutes;

    const [inH, inM] = timeStr.split(":").map(Number);
    const inMinutes = inH * 60 + inM;

    const isLate = inMinutes > startMinutes;

    const record = await prisma.staffAttendance.upsert({
      where: {
        staffId_date: {
          staffId: parseInt(staffId),
          date: targetDate,
        },
      },
      update: {
        checkInTime: timeStr,
        isLate,
        status: "Present",
      },
      create: {
        staffId: parseInt(staffId),
        date: targetDate,
        checkInTime: timeStr,
        isLate,
        status: "Present",
      },
      include: { staff: true },
    });

    return res.status(200).json(
      new ApiResponse(200, record, `Staff check-in recorded. ${isLate ? "Marked as LATE." : "On time."}`)
    );
  } catch (error) {
    next(error);
  }
};

const markStaffAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records)) {
      throw new ApiError(400, "Date and records array are required");
    }

    const promises = records.map((rec) =>
      prisma.staffAttendance.upsert({
        where: {
          staffId_date: {
            staffId: rec.staffId,
            date,
          },
        },
        update: {
          checkInTime: rec.checkInTime || null,
          checkOutTime: rec.checkOutTime || null,
          isLate: rec.isLate || false,
          status: rec.status,
          remarks: rec.remarks || null,
        },
        create: {
          staffId: rec.staffId,
          date,
          checkInTime: rec.checkInTime || null,
          checkOutTime: rec.checkOutTime || null,
          isLate: rec.isLate || false,
          status: rec.status,
          remarks: rec.remarks || null,
        },
      })
    );

    await Promise.all(promises);

    return res.status(200).json(
      new ApiResponse(200, { date, count: records.length }, "Staff attendance updated successfully")
    );
  } catch (error) {
    next(error);
  }
};

export {
  getStudentAttendance,
  markStudentAttendance,
  getStaffAttendance,
  staffCheckIn,
  markStaffAttendance,
};
