import React, { useState } from 'react';
import { Search, Receipt, Wallet, Calendar, Tag } from 'lucide-react';
import Badge from '../ui/Badge';
import { LoadingState, EmptyState } from '../ui/LoadingState';

export function ExpenseList({ 
  expenses = [], 
  isLoading = false, 
  onAddExpenseClick 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categoryColors = {
    Salary: 'indigo',
    Rent: 'ai',
    Electricity: 'low',
    Marketing: 'created',
    Transport: 'default',
    Internet: 'indigo',
    Maintenance: 'low',
    Other: 'default',
  };

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

  const filteredExpenses = expenses.filter((exp) => {
    // Category Filter
    if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) return false;

    // Search query filter
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return (
      exp.category?.toLowerCase().includes(query) ||
      exp.description?.toLowerCase().includes(query) ||
      exp.expense_date?.includes(query) ||
      String(exp.amount).includes(query) ||
      String(exp.expense_id).includes(query)
    );
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card space-y-4">
      {/* Controls: Search bar & Category filter dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category, amount, date, description..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-950/80 border border-slate-800 text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories ({expenses.length})</option>
            {categories.map((cat) => {
              const count = expenses.filter(e => e.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <LoadingState message="Fetching live expense records from PostgreSQL..." />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching expense records' : 'No expense records found'}
          description={
            searchTerm
              ? `No expense matches "${searchTerm}". Try a different search query.`
              : 'Start by recording your first business expense in PostgreSQL.'
          }
          actionLabel="+ Record First Expense"
          onAction={onAddExpenseClick}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Expense ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredExpenses.map((exp) => {
                const formattedAmount = typeof exp.amount === 'number' 
                  ? exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                  : parseFloat(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

                return (
                  <tr key={exp.expense_id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-300">
                      #EXP-{exp.expense_id}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4">
                      <Badge variant={categoryColors[exp.category] || 'default'} size="sm">
                        {exp.category}
                      </Badge>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-100 text-sm">
                      ₹{formattedAmount}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{exp.expense_date}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">
                      {exp.description ? (
                        <span title={exp.description}>{exp.description}</span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">No notes</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
