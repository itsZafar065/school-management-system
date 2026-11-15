import { apiRequest } from "./api";
import { Expense } from "@/types";

export const expenseService = {
  async getExpenses(params?: { category?: string; month?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.month) query.append("month", params.month);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<{ expenses: Expense[]; total: number }>(`/expenses${qs}`);
  },

  async createExpense(data: Partial<Expense>) {
    return await apiRequest<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getIncomeExpenseReport() {
    return await apiRequest<{
      feeIncome: number;
      operationalExpenses: number;
      salaryExpenses: number;
      totalOutflow: number;
      netProfit: number;
    }>("/expenses/report");
  },
};
