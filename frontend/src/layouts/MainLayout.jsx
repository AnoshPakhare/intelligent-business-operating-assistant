import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export function MainLayout({ children, activeRoute, onNavigate, activeRouteName }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleAskIboaClick = () => {
    onNavigate('ai-assistant');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        activeRoute={activeRoute}
        onNavigate={(routeId) => {
          onNavigate(routeId);
          setIsMobileSidebarOpen(false);
        }}
      />

      {/* Main Container adjusting for Sidebar width */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Bar Navigation */}
        <Topbar
          isCollapsed={isSidebarCollapsed}
          onToggleSidebarMobile={toggleMobileSidebar}
          activeRouteName={activeRouteName}
          onAskIboa={handleAskIboaClick}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Minimal Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;
