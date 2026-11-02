import React from 'react';
import { FileText, Eye, ArrowUpRight, Info } from 'lucide-react';
import Badge from '../ui/Badge';

export function RecentInvoices({ invoices = [], onViewInvoice, onViewAllInvoices }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Invoices</h3>
            <p className="text-xs text-slate-400">Latest billing transactions</p>
          </div>
        </div>

        <button
          onClick={onViewAllInvoices}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Invoice Number</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Grand Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-4 h-4 text-slate-600" />
                    <span>No invoice records found in database.</span>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-100">
                    {inv.customer}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {inv.date}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-100">
                    {inv.grandTotal}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={inv.status === 'CREATED' ? 'created' : 'cancelled'}
                      dot
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewInvoice?.(inv)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentInvoices;
