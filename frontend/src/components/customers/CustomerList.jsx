import React, { useState } from 'react';
import { Search, Building2, User, Phone, Mail, MapPin, Hash, Plus } from 'lucide-react';
import Badge from '../ui/Badge';
import { LoadingState, EmptyState } from '../ui/LoadingState';

export function CustomerList({ 
  customers = [], 
  isLoading = false, 
  onAddCustomerClick 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredCustomers = customers.filter((cust) => {
    // Type Filter
    if (selectedType === 'COMPANY' && cust.customer_type?.toLowerCase() !== 'company') return false;
    if (selectedType === 'INDIVIDUAL' && cust.customer_type?.toLowerCase() !== 'individual') return false;

    // Search query filter
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return (
      cust.name?.toLowerCase().includes(query) ||
      cust.phone?.toLowerCase().includes(query) ||
      cust.email?.toLowerCase().includes(query) ||
      cust.address?.toLowerCase().includes(query) ||
      cust.gstin?.toLowerCase().includes(query) ||
      String(cust.customer_id).includes(query)
    );
  });

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
            placeholder="Search by name, phone, email, address, GSTIN..."
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
            All ({customers.length})
          </button>

          <button
            onClick={() => setSelectedType('COMPANY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'COMPANY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Companies ({customers.filter(c => c.customer_type?.toLowerCase() === 'company').length})
          </button>

          <button
            onClick={() => setSelectedType('INDIVIDUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'INDIVIDUAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Individuals ({customers.filter(c => c.customer_type?.toLowerCase() === 'individual').length})
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <LoadingState message="Fetching live customer records from PostgreSQL..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching customers found' : 'No customer records found'}
          description={
            searchTerm
              ? `No customer matches "${searchTerm}". Try a different search query.`
              : 'Start by adding your first customer to the PostgreSQL database.'
          }
          actionLabel="+ Add First Customer"
          onAction={onAddCustomerClick}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">GSTIN / Tax ID</th>
                <th className="py-3 px-4">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredCustomers.map((cust) => {
                const isCompany = cust.customer_type?.toLowerCase() === 'company';

                return (
                  <tr key={cust.customer_id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                          isCompany 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {isCompany ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block text-sm group-hover:text-indigo-300 transition-colors">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: #{cust.customer_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer Type Badge */}
                    <td className="py-3.5 px-4">
                      <Badge variant={isCompany ? 'indigo' : 'default'} size="sm">
                        {cust.customer_type}
                      </Badge>
                    </td>

                    {/* Phone & Email */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{cust.phone}</span>
                      </div>
                      {cust.email ? (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{cust.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic">No email</span>
                      )}
                    </td>

                    {/* GSTIN */}
                    <td className="py-3.5 px-4">
                      {cust.gstin ? (
                        <span className="font-mono font-semibold text-slate-200 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-[11px]">
                          {cust.gstin}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">N/A</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate" title={cust.address}>
                          {cust.address}
                        </span>
                      </div>
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

export default CustomerList;
