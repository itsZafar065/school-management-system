import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getExpenses = async (req, res, next) => {
  try {
    const { category, month } = req.query;

    const where = {};
    if (category && category !== "all") where.category = category;
    if (month && month !== "all") where.date = { startsWith: month };

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return res.status(200).json(
      new ApiResponse(200, { expenses, total }, "School expenses fetched")
    );
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, date, paidTo, paymentMethod, description } = req.body;

    if (!title || !category || !amount || !paidTo) {
      throw new ApiError(400, "Title, category, amount, and paid to are required");
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: parseInt(amount),
        date: date || new Date().toISOString().split("T")[0],
        paidTo,
        paymentMethod: paymentMethod || "Cash",
        description: description || null,
        recordedBy: req.user ? req.user.name : "Accountant",
      },
    });

    return res.status(201).json(new ApiResponse(201, expense, "Expense recorded successfully"));
  } catch (error) {
    next(error);
  }
};

const getIncomeExpenseReport = async (req, res, next) => {
  try {
    // Total fees collected
    const challans = await prisma.feeChallan.findMany();
    const feeIncome = challans.reduce((sum, c) => sum + c.paidAmount, 0);

    // Total expenses
    const expenses = await prisma.expense.findMany();
    const operationalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total salaries paid
    const payrolls = await prisma.payroll.findMany({ where: { status: "Paid" } });
    const salaryExpenses = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

    const totalOutflow = operationalExpenses + salaryExpenses;
    const netProfit = feeIncome - totalOutflow;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          feeIncome,
          operationalExpenses,
          salaryExpenses,
          totalOutflow,
          netProfit,
        },
        "Financial income vs expense report calculated"
      )
    );
  } catch (error) {
    next(error);
  }
};

export { getExpenses, createExpense, getIncomeExpenseReport };
