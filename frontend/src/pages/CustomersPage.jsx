import React, { useState, useEffect } from 'react';
import { Plus, Users, Building2, UserCheck, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import CustomerList from '../components/customers/CustomerList';
import CreateCustomerModal from '../components/customers/CreateCustomerModal';
import customerService from '../services/customerService';

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setToastMessage({
        type: 'error',
        text: `Failed to load customers from database: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerCreatedSuccess = () => {
    setIsModalOpen(false);
    setToastMessage({
      type: 'success',
      text: 'Customer created and saved to PostgreSQL successfully!'
    });
    fetchCustomers();
  };

  const companyCount = customers.filter(c => c.customer_type?.toLowerCase() === 'company').length;
  const individualCount = customers.filter(c => c.customer_type?.toLowerCase() === 'individual').length;

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
            Customers
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your company and individual customer directory.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchCustomers}
            isLoading={isLoading}
            title="Refresh List"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="shadow-lg shadow-indigo-600/30 font-semibold"
          >
            + Create Customer
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Directory</span>
            <span className="text-2xl font-extrabold text-slate-100">{customers.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Companies</span>
            <span className="text-2xl font-extrabold text-indigo-300">{companyCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Individuals</span>
            <span className="text-2xl font-extrabold text-cyan-300">{individualCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Customers List */}
      <CustomerList
        customers={customers}
        isLoading={isLoading}
        onAddCustomerClick={() => setIsModalOpen(true)}
      />

      {/* Create Customer Dialog */}
      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCustomerCreatedSuccess}
      />
    </div>
  );
}

export default CustomersPage;
