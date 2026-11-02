import React, { useState, useEffect } from 'react';
import { Plus, Package, Wrench, Boxes, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import ProductList from '../components/products/ProductList';
import CreateProductModal from '../components/products/CreateProductModal';
import productService from '../services/productService';

export function ProductsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch products & services:", err);
      setToastMessage({
        type: 'error',
        text: `Failed to load items from database: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemCreatedSuccess = () => {
    setIsModalOpen(false);
    setToastMessage({
      type: 'success',
      text: 'Product/Service created and saved to PostgreSQL successfully!'
    });
    fetchItems();
  };

  const productCount = items.filter(i => i.type === 'PRODUCT').length;
  const serviceCount = items.filter(i => i.type === 'SERVICE').length;

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
            Products & Services
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your inventory catalog of physical products and billable services.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchItems}
            isLoading={isLoading}
            title="Refresh Catalog"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="shadow-lg shadow-indigo-600/30 font-semibold"
          >
            + Add Product / Service
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Catalog</span>
            <span className="text-2xl font-extrabold text-slate-100">{items.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Products</span>
            <span className="text-2xl font-extrabold text-indigo-300">{productCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Services</span>
            <span className="text-2xl font-extrabold text-violet-300">{serviceCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Catalog List */}
      <ProductList
        items={items}
        isLoading={isLoading}
        onAddItemClick={() => setIsModalOpen(true)}
      />

      {/* Create Product/Service Dialog */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleItemCreatedSuccess}
      />
    </div>
  );
}

export default ProductsPage;
