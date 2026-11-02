import React from 'react';
import { Wallet, Info } from 'lucide-react';

export function ExpenseDistribution({ data = [] }) {
  const totalExpense = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Expense Distribution</h3>
            <p className="text-xs text-slate-400">Category breakdown from PostgreSQL</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Spent</span>
          <span className="text-sm font-extrabold text-slate-100">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Category List with Visual Progress Bars */}
      {data.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-slate-600" />
          <span>No expense records found in database.</span>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="font-semibold text-slate-300 w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/50">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseDistribution;
