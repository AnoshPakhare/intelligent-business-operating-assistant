import React, { useState } from 'react';
import { Package, Wrench, AlertCircle, Percent } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import productService from '../../services/productService';

export function CreateProductModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'PRODUCT',
    name: '',
    description: '',
    price: '',
    unit: 'pcs',
    gst_applicable: true,
    gst_rate: '18.00',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      type: 'PRODUCT',
      name: '',
      description: '',
      price: '',
      unit: 'pcs',
      gst_applicable: true,
      gst_rate: '18.00',
    });
    setErrors({});
    setApiError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      unit: newType === 'PRODUCT' ? 'pcs' : 'hrs',
      gst_applicable: newType === 'PRODUCT',
      gst_rate: newType === 'PRODUCT' ? '18.00' : '',
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid positive price';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit of measurement is required';
    }

    if (formData.gst_applicable) {
      if (formData.gst_rate === '' || isNaN(formData.gst_rate) || parseFloat(formData.gst_rate) < 0) {
        newErrors.gst_rate = 'Please specify a valid GST rate percentage';
      }
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
      await productService.createItem(formData);
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create item:", err);
      setApiError(err.message || 'Failed to create item. Please check API connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={formData.type === 'PRODUCT' ? 'Add New Product' : 'Add New Service'}
      maxWidth="max-w-xl"
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

        {/* Item Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Item Category <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('PRODUCT')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border ${
                formData.type === 'PRODUCT'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Product
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('SERVICE')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border ${
                formData.type === 'SERVICE'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Service
            </button>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {formData.type === 'PRODUCT' ? 'Product Name' : 'Service Name'} <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={formData.type === 'PRODUCT' ? 'e.g. Ergonomic Wireless Mouse' : 'e.g. IT Infrastructure Consulting'}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
              errors.name 
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Price & Unit Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Unit Price (₹) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
                errors.price 
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            {errors.price && <p className="text-[11px] text-rose-400 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Unit of Measurement <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder={formData.type === 'PRODUCT' ? 'pcs, box, kg, set' : 'hrs, days, service'}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
                errors.unit 
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            {errors.unit && <p className="text-[11px] text-rose-400 mt-1">{errors.unit}</p>}
          </div>
        </div>

        {/* GST Section */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">GST Applicable</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="gst_applicable"
                checked={formData.gst_applicable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {formData.gst_applicable && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                GST Rate (%) <span className="text-rose-400">*</span>
              </label>
              <select
                name="gst_rate"
                value={formData.gst_rate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="18.00">18% Standard Rate</option>
                <option value="12.00">12% Reduced Rate</option>
                <option value="5.00">5% Essential Rate</option>
                <option value="28.00">28% Premium Rate</option>
                <option value="0.00">0% Zero Rate</option>
              </select>
              {errors.gst_rate && <p className="text-[11px] text-rose-400 mt-1">{errors.gst_rate}</p>}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description <span className="text-slate-500">(Optional)</span>
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Item specifications, details, or notes..."
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
            {formData.type === 'PRODUCT' ? 'Create Product' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProductModal;
