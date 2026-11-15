import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getChallans = async (req, res, next) => {
  try {
    const { month, classSectionId, status, search, studentId } = req.query;

    const where = {};
    if (month && month !== "all") where.month = month;
    if (classSectionId && classSectionId !== "all") where.classSectionId = parseInt(classSectionId);
    if (status && status !== "all") where.status = status;
    if (studentId) where.studentId = parseInt(studentId);

    if (search) {
      const q = search.trim();
      where.OR = [
        { challanNo: { contains: q } },
        { student: { name: { contains: q } } },
        { student: { rollNo: { contains: q } } },
        { student: { admissionNo: { contains: q } } },
      ];
    }

    const challans = await prisma.feeChallan.findMany({
      where,
      include: {
        student: true,
        classSection: true,
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json(new ApiResponse(200, challans, "Fee challans fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getChallanById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const challan = await prisma.feeChallan.findUnique({
      where: { id },
      include: {
        student: true,
        classSection: true,
      },
    });

    if (!challan) throw new ApiError(404, "Challan record not found");

    const setting = await prisma.setting.findFirst();

    return res.status(200).json(
      new ApiResponse(200, { challan, school: setting }, "Challan details fetched")
    );
  } catch (error) {
    next(error);
  }
};

const generateChallans = async (req, res, next) => {
  try {
    const { classSectionId, month, issueDate, dueDate, otherCharges, otherChargesTitle } = req.body;

    if (!month || !issueDate || !dueDate) {
      throw new ApiError(400, "Month, Issue Date, and Due Date are required");
    }

    const studentWhere = { status: "Active" };
    if (classSectionId && classSectionId !== "all") {
      studentWhere.classSectionId = parseInt(classSectionId);
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: { classSection: true },
    });

    if (students.length === 0) {
      throw new ApiError(400, "No active students found for fee generation");
    }

    let generatedCount = 0;
    const lastChallan = await prisma.feeChallan.findFirst({ orderBy: { id: "desc" } });
    let seq = lastChallan ? lastChallan.id + 1 : 1;

    for (const stu of students) {
      // Check if challan already exists for this student and month
      const exists = await prisma.feeChallan.findFirst({
        where: { studentId: stu.id, month },
      });
      if (exists) continue;

      // Check arrears from any previous unpaid/partial challans
      const previousPending = await prisma.feeChallan.findMany({
        where: {
          studentId: stu.id,
          status: { in: ["Unpaid", "Partial"] },
          month: { not: month },
        },
      });

      const arrears = previousPending.reduce((sum, ch) => sum + (ch.balance || ch.totalPayable), 0);

      const tuitionFee = stu.classSection.tuitionFee;
      const discount = stu.discountAmount || 0;
      const extraCharges = parseInt(otherCharges) || 0;
      const totalPayable = tuitionFee + extraCharges + arrears - discount;

      const challanNo = `CH-${month.replace("-", "")}-${String(seq).padStart(4, "0")}`;

      await prisma.feeChallan.create({
        data: {
          challanNo,
          studentId: stu.id,
          classSectionId: stu.classSectionId,
          month,
          issueDate,
          dueDate,
          tuitionFee,
          admissionFee: 0,
          annualFund: 0,
          examFee: 0,
          otherCharges: extraCharges,
          otherChargesTitle: otherChargesTitle || null,
          arrears,
          discount,
          fine: 0,
          totalPayable: Math.max(0, totalPayable),
          paidAmount: 0,
          balance: Math.max(0, totalPayable),
          status: "Unpaid",
        },
      });

      seq++;
      generatedCount++;
    }

    await prisma.auditLog.create({
      data: {
        module: "Fee",
        action: "Create",
        recordId: month,
        details: `Generated ${generatedCount} challans for month ${month}`,
        performedBy: req.user ? req.user.name : "Accountant",
      },
    });

    return res.status(201).json(
      new ApiResponse(201, { count: generatedCount, month }, `Successfully generated ${generatedCount} challans for ${month}`)
    );
  } catch (error) {
    next(error);
  }
};

const payChallan = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, paymentMethod, bankName, remarks } = req.body;

    const challan = await prisma.feeChallan.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!challan) throw new ApiError(404, "Challan record not found");

    const paying = parseInt(amount);
    if (!paying || paying <= 0) throw new ApiError(400, "Valid payment amount is required");

    const newPaidAmount = challan.paidAmount + paying;
    const newBalance = Math.max(0, challan.totalPayable - newPaidAmount);
    const newStatus = newBalance === 0 ? "Paid" : "Partial";

    const updated = await prisma.feeChallan.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentMethod || "Cash",
        bankName: bankName || null,
        receivedBy: req.user ? req.user.name : "Accountant",
        remarks: remarks || challan.remarks,
      },
      include: { student: true, classSection: true },
    });

    await prisma.auditLog.create({
      data: {
        module: "Fee",
        action: "Update",
        recordId: challan.challanNo,
        details: `Payment received: Rs. ${paying} (${paymentMethod}). New balance: Rs. ${newBalance}`,
        performedBy: req.user ? req.user.name : "Accountant",
      },
    });

    return res.status(200).json(
      new ApiResponse(200, updated, `Payment of Rs. ${paying.toLocaleString()} recorded. Status: ${newStatus}`)
    );
  } catch (error) {
    next(error);
  }
};

const getDefaulters = async (req, res, next) => {
  try {
    const { classSectionId } = req.query;

    const where = {
      status: { in: ["Unpaid", "Partial"] },
    };
    if (classSectionId && classSectionId !== "all") {
      where.classSectionId = parseInt(classSectionId);
    }

    const challans = await prisma.feeChallan.findMany({
      where,
      include: {
        student: true,
        classSection: true,
      },
      orderBy: { balance: "desc" },
    });

    return res.status(200).json(new ApiResponse(200, challans, "Defaulters list fetched"));
  } catch (error) {
    next(error);
  }
};

const getFeeReports = async (req, res, next) => {
  try {
    const challans = await prisma.feeChallan.findMany({
      include: { classSection: true },
    });

    const totalBilled = challans.reduce((sum, c) => sum + c.totalPayable, 0);
    const totalCollected = challans.reduce((sum, c) => sum + c.paidAmount, 0);
    const totalOutstanding = challans.reduce((sum, c) => sum + c.balance, 0);

    // Class wise collection
    const classMap = {};
    challans.forEach((c) => {
      const cName = c.classSection.name;
      if (!classMap[cName]) classMap[cName] = { name: cName, billed: 0, collected: 0, balance: 0 };
      classMap[cName].billed += c.totalPayable;
      classMap[cName].collected += c.paidAmount;
      classMap[cName].balance += c.balance;
    });

    // Month wise collection
    const monthMap = {};
    challans.forEach((c) => {
      const m = c.month;
      if (!monthMap[m]) monthMap[m] = { month: m, billed: 0, collected: 0, balance: 0 };
      monthMap[m].billed += c.totalPayable;
      monthMap[m].collected += c.paidAmount;
      monthMap[m].balance += c.balance;
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          summary: { totalBilled, totalCollected, totalOutstanding },
          classWise: Object.values(classMap),
          monthWise: Object.values(monthMap),
        },
        "Fee reports calculated"
      )
    );
  } catch (error) {
    next(error);
  }
};

const getStudentLedger = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classSection: true,
        challans: { orderBy: { month: "asc" } },
      },
    });

    if (!student) throw new ApiError(404, "Student record not found");

    return res.status(200).json(new ApiResponse(200, student, "Student fee ledger fetched"));
  } catch (error) {
    next(error);
  }
};

export {
  getChallans,
  getChallanById,
  generateChallans,
  payChallan,
  getDefaulters,
  getFeeReports,
  getStudentLedger,
};
