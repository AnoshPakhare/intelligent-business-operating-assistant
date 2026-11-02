import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  FileText, 
  Receipt, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { Tooltip } from '../components/ui/Tooltip';

export function Sidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  activeRoute, 
  onNavigate 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/customers' },
    { id: 'products', label: 'Products & Services', icon: Package, path: '/products' },
    { id: 'inventory', label: 'Inventory', icon: Boxes, path: '/inventory' },
    { id: 'invoices', label: 'Invoices', icon: FileText, path: '/invoices' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses' },
  ];

  const aiNavItem = { 
    id: 'ai-assistant', 
    label: 'AI Assistant', 
    icon: Sparkles, 
    path: '/ai-assistant',
    isAi: true 
  };

  const bottomNavItem = { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings' 
  };

  const handleItemClick = (id) => {
    onNavigate(id);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-[#0E1420]/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent truncate tracking-wide">
                  IBOA
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate tracking-tight">
                  Business Operating Assistant
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors shrink-0"
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;

            const buttonContent = (
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-800 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );

            return (
              <div key={item.id}>
                {isCollapsed ? (
                  <Tooltip text={item.label} position="right">
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                )}
              </div>
            );
          })}

          <div className="pt-2 pb-1">
            <div className="h-[1px] bg-slate-800/60 mx-2" />
          </div>

          {/* AI Assistant Nav Item with Visually Distinct Accent */}
          {(() => {
            const isActive = activeRoute === aiNavItem.id;
            const Icon = aiNavItem.icon;

            const aiButton = (
              <button
                onClick={() => handleItemClick(aiNavItem.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-purple-600/30 text-violet-200 border border-violet-500/50 shadow-lg shadow-violet-500/20'
                    : 'bg-gradient-to-r from-violet-950/40 to-indigo-950/40 text-violet-300 hover:text-white border border-violet-500/30 hover:border-violet-400/60 hover:shadow-md hover:shadow-violet-500/20'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className={`w-5 h-5 shrink-0 text-violet-400 animate-pulse ${
                  isActive ? 'text-violet-300' : 'group-hover:text-violet-200'
                }`} />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent font-semibold">
                      {aiNavItem.label}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 uppercase">
                      AI
                    </span>
                  </div>
                )}
              </button>
            );

            return isCollapsed ? (
              <Tooltip text="AI Assistant" position="right">
                {aiButton}
              </Tooltip>
            ) : (
              aiButton
            );
          })()}
        </nav>
      </div>

      {/* Bottom Settings Navigation & User Indicator */}
      <div className="p-3 border-t border-slate-800/60 space-y-2">
        {(() => {
          const isActive = activeRoute === bottomNavItem.id;
          const Icon = bottomNavItem.icon;

          const settingsButton = (
            <button
              onClick={() => handleItemClick(bottomNavItem.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{bottomNavItem.label}</span>}
            </button>
          );

          return isCollapsed ? (
            <Tooltip text="Settings" position="right">
              {settingsButton}
            </Tooltip>
          ) : (
            settingsButton
          );
        })()}
      </div>
    </aside>
  );
}

export default Sidebar;
