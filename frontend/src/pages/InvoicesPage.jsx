import React, { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle2, XCircle, TrendingUp, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import InvoiceList from '../components/invoices/InvoiceList';
import CreateInvoiceModal from '../components/invoices/CreateInvoiceModal';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import invoiceService from '../services/invoiceService';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setToastMessage({
        type: 'error',
        text: `Failed to load invoices from database: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setToastMessage({
      type: 'success',
      text: 'Invoice created, issued, and saved to PostgreSQL successfully!'
    });
    fetchInvoices();
  };

  const handleViewInvoiceDetail = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailModalOpen(true);
  };

  const handleCancelInvoiceSuccess = () => {
    setToastMessage({
      type: 'success',
      text: 'Invoice cancelled and product stock restored in PostgreSQL successfully!'
    });
    fetchInvoices();
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'CREATED')
    .reduce((sum, i) => sum + (parseFloat(i.grand_total) || 0), 0);

  const activeCount = invoices.filter(i => i.status === 'CREATED').length;
  const cancelledCount = invoices.filter(i => i.status === 'CANCELLED').length;

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
            Invoices Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Issue billing invoices, track tax totals, and review customer payment history.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchInvoices}
            isLoading={isLoading}
            title="Refresh Invoices"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-lg shadow-indigo-600/30 font-semibold"
          >
            + Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Invoice Revenue</span>
            <span className="text-2xl font-extrabold text-emerald-300">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Invoices</span>
            <span className="text-2xl font-extrabold text-indigo-300">{activeCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cancelled Invoices</span>
            <span className="text-2xl font-extrabold text-rose-300">{cancelledCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <InvoiceList
        invoices={invoices}
        isLoading={isLoading}
        onViewInvoice={handleViewInvoiceDetail}
        onCancelInvoice={handleViewInvoiceDetail}
        onCreateInvoiceClick={() => setIsCreateModalOpen(true)}
      />

      {/* Create Invoice Dialog */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Invoice Detail Dialog */}
      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoiceId={selectedInvoiceId}
        onCancelInvoiceSuccess={handleCancelInvoiceSuccess}
      />
    </div>
  );
}

export default InvoicesPage;
