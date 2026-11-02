import React from 'react';
import { Search, Sparkles, Bell, UserCheck, Menu } from 'lucide-react';
import Button from '../components/ui/Button';

export function Topbar({ 
  isCollapsed, 
  onToggleSidebarMobile, 
  activeRouteName = 'Dashboard',
  onAskIboa 
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0E1420]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4 transition-all duration-300">
      {/* Left: Mobile menu toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-400 hover:text-slate-200 transition-colors">IBOA</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-100 font-semibold truncate">{activeRouteName}</span>
        </nav>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, products, invoices..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200 shadow-inner"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ai"
          size="sm"
          icon={Sparkles}
          onClick={onAskIboa}
          className="shadow-sm font-semibold"
        >
          <span className="hidden xs:inline">Ask IBOA</span>
        </Button>

        <button 
          className="relative p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </button>

        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-400 font-semibold shadow-inner shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-100 leading-snug">
              Business Owner
            </span>
            <span className="text-[10px] font-medium text-slate-400 leading-tight">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
