import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getLeaves = async (req, res, next) => {
  try {
    const { status, applicantType } = req.query;

    const where = {};
    if (status && status !== "all") where.status = status;
    if (applicantType && applicantType !== "all") where.applicantType = applicantType;

    const leaves = await prisma.leaveApplication.findMany({
      where,
      include: {
        staff: true,
        student: {
          include: { classSection: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json(new ApiResponse(200, leaves, "Leave applications fetched"));
  } catch (error) {
    next(error);
  }
};

const applyLeave = async (req, res, next) => {
  try {
    const { applicantType, staffId, studentId, leaveType, startDate, endDate, days, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      throw new ApiError(400, "Start date, end date, and reason are required");
    }

    const application = await prisma.leaveApplication.create({
      data: {
        applicantType: applicantType || "Staff",
        staffId: staffId ? parseInt(staffId) : null,
        studentId: studentId ? parseInt(studentId) : null,
        leaveType: leaveType || "Casual",
        startDate,
        endDate,
        days: parseInt(days) || 1,
        reason,
        status: "Pending",
      },
      include: { staff: true, student: true },
    });

    return res.status(201).json(new ApiResponse(201, application, "Leave application submitted"));
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status, remarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      throw new ApiError(400, "Status must be Approved or Rejected");
    }

    const updated = await prisma.leaveApplication.update({
      where: { id },
      data: {
        status,
        approvedBy: req.user ? req.user.name : "Principal",
        remarks: remarks || null,
      },
      include: { staff: true, student: true },
    });

    return res.status(200).json(
      new ApiResponse(200, updated, `Leave application ${status.toLowerCase()} by Principal`)
    );
  } catch (error) {
    next(error);
  }
};

export { getLeaves, applyLeave, updateLeaveStatus };
