import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import KPICard from '../components/kpi/KPICard';
import AIAssistantPanel from '../components/ai/AIAssistantPanel';
import AIResultCard from '../components/ai/AIResultCard';
import SalesChart from '../components/charts/SalesChart';
import ExpenseDistribution from '../components/charts/ExpenseDistribution';
import RecentInvoices from '../components/dashboard/RecentInvoices';
import LowStockCard from '../components/dashboard/LowStockCard';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { dashboardService } from '../services/dashboardService';
import { inventoryService } from '../services/inventoryService';
import { aiService } from '../services/aiService';

export function Dashboard({ onNavigate }) {
  const [kpis, setKpis] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [salesFilter, setSalesFilter] = useState('weekly');
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real Invoice Detail Modal state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Stock Update Modal state
  const [stockItemToUpdate, setStockItemToUpdate] = useState(null);
  const [newStockQty, setNewStockQty] = useState('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Real AI Agent states
  const [aiResponseData, setAiResponseData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [salesFilter]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, salesRes, expRes, invRes, stockRes] = await Promise.all([
        dashboardService.getKpis(),
        dashboardService.getSalesOverview(salesFilter),
        dashboardService.getExpenseDistribution(),
        dashboardService.getRecentInvoices(),
        dashboardService.getLowStockItems(),
      ]);

      setKpis(kpiRes);
      setSalesData(salesRes);
      setExpenses(expRes);
      setInvoices(invRes);
      setLowStock(stockRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAi = async (promptText) => {
    setIsAiLoading(true);
    setAiResponseData(null);
    try {
      const res = await aiService.sendChatMessage(promptText);
      setAiResponseData(res);
    } catch (err) {
      console.error("AI Assistant request failed:", err);
      setAiResponseData({
        response: err.message || "Failed to reach AI Assistant backend service.",
        tool_used: "error",
        data: {},
        status: "error",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateInvoiceClick = () => {
    onNavigate?.('invoices');
  };

  const handleViewInvoiceDetails = (invoice) => {
    if (invoice && invoice.id) {
      setSelectedInvoiceId(invoice.id);
      setIsInvoiceModalOpen(true);
    } else if (invoices.length > 0) {
      setSelectedInvoiceId(invoices[0].id);
      setIsInvoiceModalOpen(true);
    }
  };

  const handleOpenUpdateStock = (item) => {
    setStockItemToUpdate(item);
    setNewStockQty(item ? String(item.currentStock + 10) : '10');
  };

  const handleSaveStockUpdate = async () => {
    if (!stockItemToUpdate) return;
    setIsUpdatingStock(true);
    try {
      await inventoryService.updateInventory(stockItemToUpdate.id, {
        quantity: parseInt(newStockQty, 10),
        reorder_level: stockItemToUpdate.reorderLevel,
      });

      setToastMessage({
        type: 'success',
        text: `Stock updated for ${stockItemToUpdate.productName} in PostgreSQL successfully!`
      });
      setStockItemToUpdate(null);
      loadDashboardData();
    } catch (err) {
      console.error("Failed to update stock:", err);
      setToastMessage({
        type: 'error',
        text: `Failed to update stock: ${err.message}`
      });
    } finally {
      setIsUpdatingStock(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast popup */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Good morning, Business Owner
            {isLoading && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Here's what's happening in your business today (PostgreSQL Live Data).
          </p>
        </div>

        {/* Primary Action Button */}
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleCreateInvoiceClick}
          className="shadow-lg shadow-indigo-600/30 self-start sm:self-auto font-semibold"
        >
          + Create Invoice
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            isPositive={kpi.isPositive}
            period={kpi.period}
            iconName={kpi.iconName}
            accentColor={kpi.accentColor}
          />
        ))}
      </div>

      {/* AI Assistant Dashboard Panel */}
      <div className="space-y-4">
        <AIAssistantPanel
          onAskAi={handleAskAi}
          isLoading={isAiLoading}
        />

        {/* Dynamic AI Result Card */}
        {aiResponseData && (
          <AIResultCard
            aiData={aiResponseData}
            onClose={() => setAiResponseData(null)}
          />
        )}
      </div>

      {/* Analytics Section: Sales Chart & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart
            data={salesData}
            activeFilter={salesFilter}
            onFilterChange={(filter) => setSalesFilter(filter)}
          />
        </div>

        <div>
          <ExpenseDistribution data={expenses} />
        </div>
      </div>

      {/* Operations Section: Recent Invoices & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentInvoices
            invoices={invoices}
            onViewInvoice={(inv) => handleViewInvoiceDetails(inv)}
            onViewAllInvoices={() => onNavigate?.('invoices')}
          />
        </div>

        <div>
          <LowStockCard
            items={lowStock}
            onUpdateStock={(item) => handleOpenUpdateStock(item)}
            onViewInventory={() => onNavigate?.('inventory')}
          />
        </div>
      </div>

      {/* Real Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceId(null);
        }}
        invoiceId={selectedInvoiceId}
        onCancelInvoiceSuccess={() => {
          loadDashboardData();
          setToastMessage({ type: 'success', text: 'Invoice cancelled and stock restored successfully!' });
        }}
      />

      {/* Real Stock Update Modal */}
      <Modal
        isOpen={!!stockItemToUpdate}
        onClose={() => setStockItemToUpdate(null)}
        title={`Update Stock: ${stockItemToUpdate?.productName || ''}`}
      >
        {stockItemToUpdate && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Current stock level: <strong className="text-amber-400">{stockItemToUpdate.currentStock} {stockItemToUpdate.unit}</strong>.
            </p>

            <div>
              <label className="block text-slate-400 font-medium mb-1">New Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={newStockQty}
                onChange={(e) => setNewStockQty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStockItemToUpdate(null)}
                disabled={isUpdatingStock}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                isLoading={isUpdatingStock}
                onClick={handleSaveStockUpdate}
              >
                Save Stock to PostgreSQL
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;
