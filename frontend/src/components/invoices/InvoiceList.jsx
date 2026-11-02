import React, { useState } from 'react';
import { Search, FileText, Eye, XCircle, Calendar, DollarSign, Download } from 'lucide-react';
import Badge from '../ui/Badge';
import { LoadingState, EmptyState } from '../ui/LoadingState';
import invoiceService from '../../services/invoiceService';

export function InvoiceList({ 
  invoices = [], 
  isLoading = false, 
  onViewInvoice, 
  onCancelInvoice,
  onCreateInvoiceClick 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    // Status Filter
    if (selectedStatus === 'CREATED' && inv.status !== 'CREATED') return false;
    if (selectedStatus === 'CANCELLED' && inv.status !== 'CANCELLED') return false;

    // Search query filter
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return (
      inv.invoice_number?.toLowerCase().includes(query) ||
      inv.status?.toLowerCase().includes(query) ||
      inv.invoice_date?.includes(query) ||
      String(inv.grand_total).includes(query) ||
      String(inv.invoice_id).includes(query) ||
      String(inv.customer_id).includes(query)
    );
  });

  const createdCount = invoices.filter(i => i.status === 'CREATED').length;
  const cancelledCount = invoices.filter(i => i.status === 'CANCELLED').length;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card space-y-4">
      {/* Controls: Search bar & Status filter tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number, date, amount, status..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All ({invoices.length})
          </button>

          <button
            onClick={() => setSelectedStatus('CREATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'CREATED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Active ({createdCount})
          </button>

          <button
            onClick={() => setSelectedStatus('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <LoadingState message="Fetching live invoice records from PostgreSQL..." />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching invoices found' : 'No invoices issued'}
          description={
            searchTerm
              ? `No invoice matches "${searchTerm}". Try a different search query.`
              : 'Create your first invoice for a customer to begin tracking revenue.'
          }
          actionLabel="+ Create First Invoice"
          onAction={onCreateInvoiceClick}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST Tax</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredInvoices.map((inv) => {
                const isCreated = inv.status === 'CREATED';
                const formattedSub = parseFloat(inv.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                const formattedGst = parseFloat(inv.gst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                const formattedGrand = parseFloat(inv.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

                return (
                  <tr key={inv.invoice_id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Invoice Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="group-hover:text-indigo-200 transition-colors">
                          {inv.invoice_number}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{inv.invoice_date}</span>
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="py-3.5 px-4 text-slate-300">
                      ₹{formattedSub}
                    </td>

                    {/* GST */}
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      +₹{formattedGst}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-100 text-sm">
                      ₹{formattedGrand}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge variant={isCreated ? 'created' : 'cancelled'} dot>
                        {inv.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewInvoice?.(inv.invoice_id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                          title="View Invoice Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            invoiceService.downloadInvoicePDF(inv.invoice_id, inv.invoice_number);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {isCreated && (
                          <button
                            onClick={() => onCancelInvoice?.(inv.invoice_id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Cancel Invoice"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

export default InvoiceList;
