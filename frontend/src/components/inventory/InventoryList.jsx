import React, { useState } from 'react';
import { Search, Boxes, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { LoadingState, EmptyState } from '../ui/LoadingState';

export function InventoryList({ 
  inventory = [], 
  isLoading = false, 
  onUpdateStockClick 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const getItemStatus = (qty, reorderLevel) => {
    if (qty <= Math.floor(reorderLevel / 2) || qty === 0) return 'CRITICAL';
    if (qty <= reorderLevel) return 'LOW';
    return 'HEALTHY';
  };

  const filteredInventory = inventory.filter((item) => {
    const status = getItemStatus(item.quantity, item.reorder_level);

    // Filter status
    if (selectedStatus === 'LOW_ALERT' && status === 'HEALTHY') return false;
    if (selectedStatus === 'HEALTHY' && status !== 'HEALTHY') return false;

    // Search filter
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return (
      item.item_name?.toLowerCase().includes(query) ||
      String(item.item_id).includes(query) ||
      String(item.quantity).includes(query)
    );
  });

  const lowStockAlertCount = inventory.filter(i => i.quantity <= i.reorder_level).length;
  const healthyCount = inventory.filter(i => i.quantity > i.reorder_level).length;

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
            placeholder="Search products by name or item ID..."
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
            All ({inventory.length})
          </button>

          <button
            onClick={() => setSelectedStatus('LOW_ALERT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'LOW_ALERT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Alerts ({lowStockAlertCount})
          </button>

          <button
            onClick={() => setSelectedStatus('HEALTHY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'HEALTHY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Healthy ({healthyCount})
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <LoadingState message="Fetching live product inventory records from PostgreSQL..." />
      ) : filteredInventory.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching product inventory found' : 'No inventory records found'}
          description={
            searchTerm
              ? `No product inventory matches "${searchTerm}". Try a different search query.`
              : 'Add products in the Products & Services catalog to start tracking inventory.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredInventory.map((item) => {
                const status = getItemStatus(item.quantity, item.reorder_level);
                const updatedDateStr = item.updated_at 
                  ? new Date(item.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A';

                return (
                  <tr key={item.inventory_id || item.item_id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block text-sm group-hover:text-indigo-300 transition-colors">
                            {item.item_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Item ID: #{item.item_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4">
                      <span className={`font-extrabold text-sm ${
                        status === 'CRITICAL' ? 'text-red-400' : status === 'LOW' ? 'text-amber-400' : 'text-slate-100'
                      }`}>
                        {item.quantity} units
                      </span>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {item.reorder_level} units
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge 
                        variant={status === 'CRITICAL' ? 'critical' : status === 'LOW' ? 'low' : 'created'}
                        dot
                      >
                        {status}
                      </Badge>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span>{updatedDateStr}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateStockClick?.(item)}
                        className="text-xs px-3 py-1.5"
                      >
                        Update Stock
                      </Button>
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

export default InventoryList;
