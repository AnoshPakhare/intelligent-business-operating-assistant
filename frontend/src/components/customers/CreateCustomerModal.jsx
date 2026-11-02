import React, { useState } from 'react';
import { Building2, User, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import customerService from '../../services/customerService';

export function CreateCustomerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_type: 'Company',
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      customer_type: 'Company',
      name: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Billing address is required';
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
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
      await customerService.createCustomer(formData);
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create customer:", err);
      setApiError(err.message || 'Failed to create customer. Please check API connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Customer"
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

        {/* Customer Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Customer Type <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, customer_type: 'Company' })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border ${
                formData.customer_type === 'Company'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, customer_type: 'Individual' })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border ${
                formData.customer_type === 'Individual'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              Individual
            </button>
          </div>
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {formData.customer_type === 'Company' ? 'Company Name' : 'Full Name'} <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={formData.customer_type === 'Company' ? 'e.g. Acme Corporation' : 'e.g. Rahul Sharma'}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
              errors.name 
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Phone & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
                errors.phone 
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@company.com"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
                errors.email 
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Billing Address <span className="text-rose-400">*</span>
          </label>
          <textarea
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            placeholder="Complete street address, city, state"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border text-slate-100 text-xs focus:outline-none focus:ring-1 transition-all ${
              errors.address 
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/50' 
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
            }`}
          />
          {errors.address && <p className="text-[11px] text-rose-400 mt-1">{errors.address}</p>}
        </div>

        {/* GSTIN */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            GSTIN / Tax ID <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            placeholder="e.g. 27ABCDE1234F1Z5"
            maxLength="15"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
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
            Create Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateCustomerModal;
