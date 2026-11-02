import React, { useState, useEffect } from 'react';
import { Boxes, AlertCircle, ArrowUpRight } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import inventoryService from '../../services/inventoryService';

export function UpdateStockModal({ isOpen, onClose, item, onSuccess }) {
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity !== undefined ? String(item.quantity) : '0');
      setReorderLevel(item.reorder_level !== undefined ? String(item.reorder_level) : '5');
      setErrors({});
      setApiError(null);
    }
  }, [item, isOpen]);

  const handleClose = () => {
    setErrors({});
    setApiError(null);
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};

    const qtyNum = parseInt(quantity, 10);
    if (quantity === '' || isNaN(qtyNum) || qtyNum < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    const reorderNum = parseInt(reorderLevel, 10);
    if (reorderLevel === '' || isNaN(reorderNum) || reorderNum < 0) {
      newErrors.reorderLevel = 'Reorder level must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!item || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await inventoryService.updateInventory(item.item_id, {
        quantity: parseInt(quantity, 10),
        reorder_level: parseInt(reorderLevel, 10),
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Failed to update inventory:", err);
      setApiError(err.message || 'Failed to update stock. Please check API connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Update Stock: ${item.item_name}`}
      maxWidth="max-w-lg"
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

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Product Name</span>
            <span className="text-slate-100 font-bold text-sm">{item.item_name}</span>
          </div>
          <span className="font-mono text-indigo-400 text-xs bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            ID: #{item.item_id}
          </span>
        </div>

        {/* Quantity Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Current Quantity in Stock <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }));
            }}
            placeholder="0"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
              errors.quantity 
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
            }`}
          />
          {errors.quantity && <p className="text-[11px] text-rose-400 mt-1">{errors.quantity}</p>}
        </div>

        {/* Reorder Level Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Reorder Alert Threshold Level <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={reorderLevel}
            onChange={(e) => {
              setReorderLevel(e.target.value);
              if (errors.reorderLevel) setErrors((prev) => ({ ...prev, reorderLevel: null }));
            }}
            placeholder="5"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
              errors.reorderLevel 
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
            }`}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            When quantity falls below this number, the item triggers a Low Stock alert.
          </p>
          {errors.reorderLevel && <p className="text-[11px] text-rose-400 mt-1">{errors.reorderLevel}</p>}
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
            Save Stock Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UpdateStockModal;
