import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import ExpensesPage from './pages/ExpensesPage';
import InventoryPage from './pages/InventoryPage';
import InvoicesPage from './pages/InvoicesPage';
import PlaceholderPage from './pages/PlaceholderPage';

const routeTitleMap = {
  'dashboard': 'Dashboard',
  'customers': 'Customers',
  'products': 'Products & Services',
  'inventory': 'Inventory',
  'invoices': 'Invoices',
  'expenses': 'Expenses',
  'ai-assistant': 'AI Assistant',
  'settings': 'Settings'
};

export function App() {
  const [activeRoute, setActiveRoute] = useState('dashboard');

  const handleNavigate = (routeId) => {
    setActiveRoute(routeId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;

      case 'customers':
        return <CustomersPage />;

      case 'products':
        return <ProductsPage />;

      case 'inventory':
        return <InventoryPage />;

      case 'invoices':
        return <InvoicesPage />;

      case 'expenses':
        return <ExpensesPage />;
      
      default:
        return (
          <PlaceholderPage
            title={routeTitleMap[activeRoute] || 'Module'}
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        );
    }
  };

  return (
    <MainLayout
      activeRoute={activeRoute}
      activeRouteName={routeTitleMap[activeRoute] || 'Dashboard'}
      onNavigate={handleNavigate}
    >
      {renderCurrentPage()}
    </MainLayout>
  );
}

export default App;
