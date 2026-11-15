import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getPayrolls = async (req, res, next) => {
  try {
    const { month, staffId, status } = req.query;
    const targetMonth = month || "2026-02";

    const where = {};
    if (targetMonth && targetMonth !== "all") where.month = targetMonth;
    if (staffId) where.staffId = parseInt(staffId);
    if (status && status !== "all") where.status = status;

    const payrolls = await prisma.payroll.findMany({
      where,
      include: { staff: true },
      orderBy: { id: "asc" },
    });

    const setting = await prisma.setting.findFirst();

    return res.status(200).json(
      new ApiResponse(200, { month: targetMonth, payrolls, setting }, "Payroll records fetched")
    );
  } catch (error) {
    next(error);
  }
};

const generatePayroll = async (req, res, next) => {
  try {
    const { month } = req.body;
    if (!month) throw new ApiError(400, "Month is required (e.g. 2026-03)");

    const setting = await prisma.setting.findFirst();
    const workingDays = setting ? setting.workingDaysPerMonth : 26;
    const lateRule = setting ? setting.lateRuleDays : 3;

    const staffList = await prisma.staff.findMany({ where: { status: "Active" } });
    let count = 0;

    for (const st of staffList) {
      // Look up attendance for this staff in target month
      const attendance = await prisma.staffAttendance.findMany({
        where: {
          staffId: st.id,
          date: { startsWith: month },
        },
      });

      const latesCount = attendance.filter((a) => a.isLate).length;
      const lateDeductionDays = Math.floor(latesCount / lateRule);
      const absentDays = attendance.filter((a) => a.status === "Absent").length;

      // Check unpaid leaves in this month
      const leaves = await prisma.leaveApplication.findMany({
        where: {
          staffId: st.id,
          status: "Approved",
          leaveType: "Unpaid",
          startDate: { startsWith: month },
        },
      });
      const unpaidLeaveDays = leaves.reduce((sum, l) => sum + l.days, 0);

      const perDaySalary = Math.round(st.basicSalary / workingDays);
      const lateDeduction = lateDeductionDays * perDaySalary;
      const absentDeduction = (absentDays + unpaidLeaveDays) * perDaySalary;
      const loanDeduction = st.loanBalance > 0 ? Math.min(st.loanBalance, 3000) : 0;

      const netSalary = Math.max(
        0,
        st.basicSalary + st.allowance - (lateDeduction + absentDeduction + loanDeduction)
      );

      // Upsert payroll for month + staffId
      const existing = await prisma.payroll.findFirst({
        where: { staffId: st.id, month },
      });

      if (existing) {
        await prisma.payroll.update({
          where: { id: existing.id },
          data: {
            basicSalary: st.basicSalary,
            allowance: st.allowance,
            workingDays,
            daysPresent: Math.max(0, workingDays - absentDays - unpaidLeaveDays),
            unpaidLeaves: unpaidLeaveDays,
            latesCount,
            lateDeductionDays,
            absentDeduction,
            lateDeduction,
            loanDeduction,
            netSalary,
          },
        });
      } else {
        await prisma.payroll.create({
          data: {
            month,
            staffId: st.id,
            basicSalary: st.basicSalary,
            allowance: st.allowance,
            workingDays,
            daysPresent: Math.max(0, workingDays - absentDays - unpaidLeaveDays),
            unpaidLeaves: unpaidLeaveDays,
            latesCount,
            lateDeductionDays,
            absentDeduction,
            lateDeduction,
            loanDeduction,
            netSalary,
            status: "Generated",
            remarks: `Automatic calculation. Lates: ${latesCount} (${lateDeductionDays} days cut), Absents: ${absentDays}.`,
          },
        });
      }
      count++;
    }

    await prisma.auditLog.create({
      data: {
        module: "Salary",
        action: "Create",
        recordId: month,
        details: `Generated payroll for ${count} staff members for ${month}`,
        performedBy: req.user ? req.user.name : "Accountant",
      },
    });

    return res.status(200).json(
      new ApiResponse(200, { count, month }, `Payroll generated for ${count} staff members for ${month}`)
    );
  } catch (error) {
    next(error);
  }
};

const updatePayroll = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { bonus, otherDeductions, remarks } = req.body;

    const current = await prisma.payroll.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Payroll record not found");

    const newBonus = bonus !== undefined ? parseInt(bonus) : current.bonus;
    const newOtherDed = otherDeductions !== undefined ? parseInt(otherDeductions) : current.otherDeductions;

    const netSalary = Math.max(
      0,
      current.basicSalary + current.allowance + newBonus -
        (current.lateDeduction + current.absentDeduction + current.loanDeduction + newOtherDed)
    );

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        bonus: newBonus,
        otherDeductions: newOtherDed,
        netSalary,
        remarks: remarks || current.remarks,
      },
      include: { staff: true },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Payroll entry adjusted"));
  } catch (error) {
    next(error);
  }
};

const paySalary = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { paymentMethod } = req.body;

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        status: "Paid",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentMethod || "Bank Transfer",
      },
      include: { staff: true },
    });

    return res.status(200).json(
      new ApiResponse(200, updated, `Salary paid to ${updated.staff.name}. Status: Paid.`)
    );
  } catch (error) {
    next(error);
  }
};

export { getPayrolls, generatePayroll, updatePayroll, paySalary };
