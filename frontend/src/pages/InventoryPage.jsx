import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import InventoryList from '../components/inventory/InventoryList';
import UpdateStockModal from '../components/inventory/UpdateStockModal';
import inventoryService from '../services/inventoryService';

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setToastMessage({
        type: 'error',
        text: `Failed to load inventory from database: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStockClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleStockUpdateSuccess = () => {
    setIsModalOpen(false);
    setToastMessage({
      type: 'success',
      text: 'Inventory stock level updated in PostgreSQL successfully!'
    });
    fetchInventory();
  };

  const lowStockCount = inventory.filter(i => i.quantity <= i.reorder_level).length;
  const healthyCount = inventory.filter(i => i.quantity > i.reorder_level).length;

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
            Inventory Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitor product stock quantities, reorder thresholds, and stock alert statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchInventory}
            isLoading={isLoading}
            title="Refresh Inventory"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Products Tracked</span>
            <span className="text-2xl font-extrabold text-slate-100">{inventory.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="text-2xl font-extrabold text-amber-300">{lowStockCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Healthy Stock</span>
            <span className="text-2xl font-extrabold text-emerald-300">{healthyCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <InventoryList
        inventory={inventory}
        isLoading={isLoading}
        onUpdateStockClick={handleUpdateStockClick}
      />

      {/* Update Stock Dialog */}
      <UpdateStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSuccess={handleStockUpdateSuccess}
      />
    </div>
  );
}

export default InventoryPage;
