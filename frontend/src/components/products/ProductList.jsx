import React, { useState } from 'react';
import { Search, Package, Wrench, Percent, Tag } from 'lucide-react';
import Badge from '../ui/Badge';
import { LoadingState, EmptyState } from '../ui/LoadingState';

export function ProductList({ 
  items = [], 
  isLoading = false, 
  onAddItemClick 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredItems = items.filter((item) => {
    // Type Filter
    if (selectedType === 'PRODUCT' && item.type !== 'PRODUCT') return false;
    if (selectedType === 'SERVICE' && item.type !== 'SERVICE') return false;

    // Search query filter
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.unit?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      String(item.price).includes(query) ||
      String(item.item_id).includes(query)
    );
  });

  const productCount = items.filter(i => i.type === 'PRODUCT').length;
  const serviceCount = items.filter(i => i.type === 'SERVICE').length;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card space-y-4">
      {/* Controls: Search bar & Type filter tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, unit, price, description..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All ({items.length})
          </button>

          <button
            onClick={() => setSelectedType('PRODUCT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'PRODUCT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Products ({productCount})
          </button>

          <button
            onClick={() => setSelectedType('SERVICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'SERVICE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Services ({serviceCount})
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <LoadingState message="Fetching live catalog items from PostgreSQL..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching catalog items found' : 'No catalog items found'}
          description={
            searchTerm
              ? `No product or service matches "${searchTerm}". Try a different search query.`
              : 'Start by adding your first product or service to the catalog.'
          }
          actionLabel="+ Add First Item"
          onAction={onAddItemClick}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Catalog Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">GST Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredItems.map((item) => {
                const isProduct = item.type === 'PRODUCT';
                const formattedPrice = typeof item.price === 'number' 
                  ? item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                  : parseFloat(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

                return (
                  <tr key={item.item_id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Item Name & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                          isProduct 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        }`}>
                          {isProduct ? <Package className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block text-sm group-hover:text-indigo-300 transition-colors">
                            {item.name}
                          </span>
                          {item.description ? (
                            <span className="text-[11px] text-slate-400 block max-w-sm truncate" title={item.description}>
                              {item.description}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: #{item.item_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Type Badge */}
                    <td className="py-3.5 px-4">
                      <Badge variant={isProduct ? 'indigo' : 'ai'} size="sm">
                        {item.type}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-100 text-sm">
                      ₹{formattedPrice}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-mono bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-[11px]">
                        {item.unit}
                      </span>
                    </td>

                    {/* GST Info */}
                    <td className="py-3.5 px-4">
                      {item.gst_applicable ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                          <Percent className="w-3 h-3" />
                          <span>{item.gst_rate}% GST</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Exempt / No GST</span>
                      )}
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

export default ProductList;
