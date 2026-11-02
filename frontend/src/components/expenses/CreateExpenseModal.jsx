import React, { useState } from 'react';
import { Wallet, Calendar, AlertCircle, FileText } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import expenseService from '../../services/expenseService';

export function CreateExpenseModal({ isOpen, onClose, onSuccess }) {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    category: 'Salary',
    amount: '',
    expense_date: getTodayString(),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Salary',
    'Rent',
    'Electricity',
    'Marketing',
    'Transport',
    'Internet',
    'Maintenance',
    'Other',
  ];

  const resetForm = () => {
    setFormData({
      category: 'Salary',
      amount: '',
      expense_date: getTodayString(),
      description: '',
    });
    setErrors({});
    setApiError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive expense amount';
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'Expense date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Expense category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await expenseService.createExpense(formData);
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create expense:", err);
      setApiError(err.message || 'Failed to record expense. Please check API connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record New Business Expense"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* API Error Message Display */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-rose-200">Backend API Error</span>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Expense Category <span className="text-rose-400">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-[11px] text-rose-400 mt-1">{errors.category}</p>}
        </div>

        {/* Amount & Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount Spent (₹) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
                errors.amount 
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Expense Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
                errors.expense_date 
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            {errors.expense_date && <p className="text-[11px] text-rose-400 mt-1">{errors.expense_date}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description / Notes <span className="text-slate-500">(Optional)</span>
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Payment details, vendor name, invoice reference..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="font-semibold px-5"
          >
            Record Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateExpenseModal;
