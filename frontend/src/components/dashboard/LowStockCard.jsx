import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function LowStockCard({ items = [], onUpdateStock, onViewInventory }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Low Stock Alerts</h3>
            <p className="text-xs text-slate-400">Products near or below reorder threshold</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onViewInventory}
          className="text-xs text-indigo-400 hover:text-indigo-300 gap-1 p-0 hover:bg-transparent"
        >
          View Inventory
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Item list */}
      <div className="space-y-3 pt-1">
        {items.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>All inventory stock levels are healthy!</span>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700/80 transition-all duration-200 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                    {item.productName}
                  </span>
                  <Badge variant={item.status === 'CRITICAL' ? 'critical' : 'low'} size="sm">
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Current: <strong className="text-rose-400 font-semibold">{item.currentStock} {item.unit}</strong></span>
                  <span>•</span>
                  <span>Reorder Level: <strong className="text-slate-300 font-semibold">{item.reorderLevel} {item.unit}</strong></span>
                </div>
              </div>

              {/* Action button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUpdateStock?.(item)}
                className="self-end sm:self-center text-xs px-3 py-1.5 shrink-0"
              >
                Update Stock
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LowStockCard;
