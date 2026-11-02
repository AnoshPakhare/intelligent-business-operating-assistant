import React, { useState, useEffect } from 'react';
import { FileText, Building2, User, Phone, Mail, MapPin, Calendar, Percent, XCircle, AlertTriangle, Download } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import invoiceService from '../../services/invoiceService';

export function InvoiceDetailModal({ isOpen, onClose, invoiceId, onCancelInvoiceSuccess }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceDetail();
    } else {
      setDetail(null);
      setShowCancelConfirm(false);
    }
  }, [isOpen, invoiceId]);

  const loadInvoiceDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getInvoiceDetail(invoiceId);
      setDetail(data);
    } catch (err) {
      console.error("Failed to load invoice detail:", err);
      setError(err.message || 'Failed to retrieve invoice details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!detail || detail.status === 'CANCELLED') return;

    setIsCancelling(true);
    try {
      await invoiceService.cancelInvoice(detail.invoice_id);
      setShowCancelConfirm(false);
      onCancelInvoiceSuccess?.();
      loadInvoiceDetail();
    } catch (err) {
      console.error("Failed to cancel invoice:", err);
      setError(err.message || 'Failed to cancel invoice.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!detail) return;
    setIsDownloadingPdf(true);
    try {
      await invoiceService.downloadInvoicePDF(detail.invoice_id, detail.invoice_number);
    } catch (err) {
      console.error("Failed to download PDF invoice:", err);
      setError(err.message || 'Failed to download PDF invoice.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={detail ? `Invoice Details: ${detail.invoice_number}` : 'Invoice Preview'}
      maxWidth="max-w-3xl"
    >
      {isLoading ? (
        <LoadingState message="Fetching itemized invoice details from PostgreSQL..." />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-200">Error Loading Invoice</span>
            <span>{error}</span>
          </div>
        </div>
      ) : detail ? (
        <div className="space-y-5 text-xs">
          {/* Header Status & Metadata */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-100 font-mono">
                  {detail.invoice_number}
                </span>
                <Badge variant={detail.status === 'CREATED' ? 'created' : 'cancelled'} dot>
                  {detail.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date: {detail.invoice_date}
                </span>
                <span>•</span>
                <span>ID: #{detail.invoice_id}</span>
              </div>
            </div>

            {/* Action Buttons: Download PDF & Cancel Invoice */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                isLoading={isDownloadingPdf}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>

              {detail.status === 'CREATED' && !showCancelConfirm && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={XCircle}
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Invoice
                </Button>
              )}
            </div>
          </div>

          {/* Cancellation Confirmation Box */}
          {showCancelConfirm && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-200 text-sm">Confirm Invoice Cancellation</h4>
                  <p className="text-rose-300/80 text-xs mt-0.5">
                    Are you sure you want to cancel invoice <strong>{detail.invoice_number}</strong>? Product stock will be automatically restored in PostgreSQL. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                >
                  Keep Invoice
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isCancelling}
                  onClick={handleCancelInvoice}
                  className="font-semibold"
                >
                  Yes, Cancel & Restore Stock
                </Button>
              </div>
            </div>
          )}

          {/* Billed Customer Box */}
          {detail.customer && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Billed Customer</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {detail.customer.customer_type === 'Company' ? (
                      <Building2 className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <User className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="font-bold text-slate-100 text-sm">{detail.customer.name}</span>
                    <Badge variant={detail.customer.customer_type === 'Company' ? 'indigo' : 'default'} size="sm">
                      {detail.customer.customer_type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {detail.customer.phone}</span>
                    {detail.customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {detail.customer.email}</span>}
                  </div>
                </div>

                {detail.customer.gstin && (
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">GSTIN</span>
                    <span className="font-mono text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {detail.customer.gstin}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itemized Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Unit Price</th>
                  <th className="py-2.5 px-3">GST Rate</th>
                  <th className="py-2.5 px-3">GST Amount</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {detail.items?.map((item) => (
                  <tr key={item.invoice_item_id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      {item.item_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {parseFloat(item.quantity)}
                    </td>
                    <td className="py-2.5 px-3">
                      ₹{parseFloat(item.unit_price).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {parseFloat(item.gst_rate)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      ₹{parseFloat(item.gst_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-100 text-right">
                      ₹{parseFloat(item.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-200">₹{parseFloat(detail.subtotal).toFixed(2)}</span>
              </div>

              {parseFloat(detail.discount) > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{parseFloat(detail.discount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-indigo-400">
                <span>GST Tax Total</span>
                <span className="font-semibold">+₹{parseFloat(detail.gst_amount).toFixed(2)}</span>
              </div>

              <div className="h-[1px] bg-slate-800 my-1" />

              <div className="flex justify-between text-sm font-extrabold text-slate-100">
                <span>Grand Total</span>
                <span className="text-emerald-400">₹{parseFloat(detail.grand_total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default InvoiceDetailModal;
