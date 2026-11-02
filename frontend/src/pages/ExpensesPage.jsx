import React, { useState, useEffect } from 'react';
import { Plus, Receipt, Wallet, TrendingDown, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import ExpenseList from '../components/expenses/ExpenseList';
import CreateExpenseModal from '../components/expenses/CreateExpenseModal';
import ExpenseDistribution from '../components/charts/ExpenseDistribution';
import expenseService from '../services/expenseService';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setToastMessage({
        type: 'error',
        text: `Failed to load expenses from database: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseCreatedSuccess = () => {
    setIsModalOpen(false);
    setToastMessage({
      type: 'success',
      text: 'Expense recorded and saved to PostgreSQL successfully!'
    });
    fetchExpenses();
  };

  // Calculate summary metrics
  const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  
  // Calculate distribution
  const categoryColors = {
    Salary: '#6366F1',
    Rent: '#8B5CF6',
    Electricity: '#06B6D4',
    Marketing: '#10B981',
    Transport: '#F59E0B',
    Internet: '#EC4899',
    Maintenance: '#3B82F6',
    Other: '#64748B',
  };

  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
    return acc;
  }, {});

  const distributionData = Object.keys(categoryTotals).map((cat) => ({
    category: cat,
    amount: categoryTotals[cat],
    percentage: totalAmount > 0 ? parseFloat(((categoryTotals[cat] / totalAmount) * 100).toFixed(1)) : 0,
    color: categoryColors[cat] || '#64748B',
  }));

  const topCategory = distributionData.length > 0 
    ? [...distributionData].sort((a, b) => b.amount - a.amount)[0]?.category 
    : 'None';

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Expenses
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track and record operational business expenses and vendor payments.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchExpenses}
            isLoading={isLoading}
            title="Refresh List"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="shadow-lg shadow-indigo-600/30 font-semibold"
          >
            + Record Expense
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Spent</span>
            <span className="text-2xl font-extrabold text-rose-300">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Transactions</span>
            <span className="text-2xl font-extrabold text-slate-100">{expenses.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Top Category</span>
            <span className="text-2xl font-extrabold text-amber-300">{topCategory}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Expense Breakdown & Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onAddExpenseClick={() => setIsModalOpen(true)}
          />
        </div>

        <div>
          <ExpenseDistribution data={distributionData} />
        </div>
      </div>

      {/* Record Expense Dialog */}
      <CreateExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleExpenseCreatedSuccess}
      />
    </div>
  );
}

export default ExpensesPage;
