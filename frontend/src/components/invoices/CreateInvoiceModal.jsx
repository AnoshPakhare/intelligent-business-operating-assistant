import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, AlertCircle, Percent, Building2, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import invoiceService from '../../services/invoiceService';

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([
    { item_id: '', quantity: '1', unit_price: 0, gst_rate: 0, gst_applicable: false, type: 'PRODUCT' }
  ]);
  const [discount, setDiscount] = useState('0.00');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadModalMetadata();
    }
  }, [isOpen]);

  const loadModalMetadata = async () => {
    setIsLoadingMetadata(true);
    setApiError(null);
    try {
      const [custRes, itemsRes] = await Promise.all([
        customerService.getCustomers(),
        productService.getItems(),
      ]);
      setCustomers(Array.isArray(custRes) ? custRes : []);
      setCatalogItems(Array.isArray(itemsRes) ? itemsRes : []);

      if (custRes.length > 0 && !customerId) {
        setCustomerId(String(custRes[0].customer_id));
      }
    } catch (err) {
      console.error("Failed to load invoice metadata:", err);
      setApiError("Failed to load customers or products catalog from database.");
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const resetForm = () => {
    setCustomerId(customers.length > 0 ? String(customers[0].customer_id) : '');
    setLines([
      { item_id: '', quantity: '1', unit_price: 0, gst_rate: 0, gst_applicable: false, type: 'PRODUCT' }
    ]);
    setDiscount('0.00');
    setErrors({});
    setApiError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { item_id: '', quantity: '1', unit_price: 0, gst_rate: 0, gst_applicable: false, type: 'PRODUCT' }
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, itemIdStr) => {
    const selectedItem = catalogItems.find((i) => String(i.item_id) === String(itemIdStr));
    const price = selectedItem ? parseFloat(selectedItem.price || 0) : 0;
    const gstRate = selectedItem && selectedItem.gst_applicable ? parseFloat(selectedItem.gst_rate || 0) : 0;
    const gstApp = selectedItem ? Boolean(selectedItem.gst_applicable) : false;
    const itemType = selectedItem ? selectedItem.type : 'PRODUCT';

    setLines((prev) => {
      const newLines = [...prev];
      newLines[index] = {
        ...newLines[index],
        item_id: itemIdStr,
        unit_price: price,
        gst_rate: gstRate,
        gst_applicable: gstApp,
        type: itemType,
      };
      return newLines;
    });

    if (errors[`line_${index}`]) {
      setErrors((prev) => ({ ...prev, [`line_${index}`]: null }));
    }
  };

  const handleLineQtyChange = (index, qtyStr) => {
    setLines((prev) => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], quantity: qtyStr };
      return newLines;
    });

    if (errors[`line_${index}`]) {
      setErrors((prev) => ({ ...prev, [`line_${index}`]: null }));
    }
  };

  // Estimate totals on frontend
  const calculateEstimates = () => {
    let subtotal = 0;
    let gstTotal = 0;

    lines.forEach((line) => {
      const qty = parseFloat(line.quantity) || 0;
      const price = line.unit_price || 0;
      const lineSub = qty * price;
      const gstRate = line.gst_applicable ? (line.gst_rate || 0) : 0;
      const lineGst = lineSub * (gstRate / 100);

      subtotal += lineSub;
      gstTotal += lineGst;
    });

    const discNum = parseFloat(discount) || 0;
    const afterDiscount = Math.max(0, subtotal - discNum);
    const grandTotal = afterDiscount + gstTotal;

    return { subtotal, gstTotal, discNum, grandTotal };
  };

  const estimates = calculateEstimates();

  const validateForm = () => {
    const newErrors = {};

    if (!customerId) {
      newErrors.customer = 'Please select a customer';
    }

    if (lines.length === 0) {
      newErrors.general = 'At least one line item is required';
    }

    lines.forEach((line, index) => {
      if (!line.item_id) {
        newErrors[`line_${index}`] = 'Please select a product or service';
      } else {
        const qty = parseFloat(line.quantity);
        if (isNaN(qty) || qty <= 0) {
          newErrors[`line_${index}`] = 'Quantity must be greater than 0';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await invoiceService.createInvoice({
        customer_id: customerId,
        items: lines,
        discount: discount,
      });
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create invoice:", err);
      setApiError(err.message || 'Failed to create invoice. Insufficient stock or invalid payload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Billing Invoice"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* API Error Message Banner */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-rose-200">Backend API Error</span>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {/* Customer Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Billed Customer <span className="text-rose-400">*</span>
          </label>
          {isLoadingMetadata ? (
            <div className="text-xs text-slate-400 py-2">Loading customers...</div>
          ) : (
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (errors.customer) setErrors((prev) => ({ ...prev, customer: null }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} ({c.customer_type}) - Phone: {c.phone}
                </option>
              ))}
            </select>
          )}
          {errors.customer && <p className="text-[11px] text-rose-400 mt-1">{errors.customer}</p>}
        </div>

        {/* Line Items Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Line Items (Products & Services) <span className="text-rose-400">*</span>
            </label>

            <button
              type="button"
              onClick={handleAddLine}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Line Item
            </button>
          </div>

          {/* Line item rows */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {lines.map((line, idx) => {
              const lineSub = (parseFloat(line.quantity) || 0) * (line.unit_price || 0);

              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  {/* Item selector */}
                  <div className="sm:col-span-6">
                    <select
                      value={line.item_id}
                      onChange={(e) => handleLineItemChange(idx, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Product or Service --</option>
                      {catalogItems.map((item) => (
                        <option key={item.item_id} value={item.item_id}>
                          [{item.type}] {item.name} - ₹{parseFloat(item.price).toFixed(2)} / {item.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={line.quantity}
                      onChange={(e) => handleLineQtyChange(idx, e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Line Total Info */}
                  <div className="sm:col-span-3 text-right">
                    <span className="text-xs font-bold text-slate-100 block">
                      ₹{lineSub.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {line.gst_applicable ? `+${line.gst_rate}% GST` : 'No GST'}
                    </span>
                  </div>

                  {/* Remove action */}
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lines.length === 1}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove Line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {errors[`line_${idx}`] && (
                    <div className="sm:col-span-12 text-[11px] text-rose-400 pt-1">
                      {errors[`line_${idx}`]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Discount & Tax Calculation Summary */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Discount (₹)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0.00"
              className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs text-right focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="h-[1px] bg-slate-800/80" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div>
              <span className="text-slate-400 block font-medium">Subtotal</span>
              <span className="text-slate-200 font-bold text-sm">
                ₹{estimates.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Discount</span>
              <span className="text-rose-400 font-semibold text-sm">
                -₹{estimates.discNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">GST Amount</span>
              <span className="text-indigo-400 font-semibold text-sm">
                +₹{estimates.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Grand Total</span>
              <span className="text-emerald-400 font-extrabold text-base">
                ₹{estimates.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
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
            className="font-semibold px-6 shadow-lg shadow-indigo-600/30"
          >
            Create & Issue Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateInvoiceModal;
