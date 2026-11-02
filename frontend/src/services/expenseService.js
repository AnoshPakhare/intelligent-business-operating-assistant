import api from './api';

/**
 * Expense Service: Interfacing frontend with FastAPI backend /expenses endpoints.
 */
export const expenseService = {
  /**
   * Fetches all expenses from PostgreSQL database.
   * Endpoint: GET /expenses
   */
  async getExpenses() {
    return await api.get('/expenses');
  },

  /**
   * Creates a new expense record in PostgreSQL database.
   * Endpoint: POST /expenses
   * Payload: { category, amount, description, expense_date }
   */
  async createExpense(expenseData) {
    const payload = {
      category: expenseData.category || 'Other',
      amount: parseFloat(expenseData.amount),
      description: expenseData.description?.trim() || null,
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
    };

    return await api.post('/expenses', payload);
  },
};

export default expenseService;
