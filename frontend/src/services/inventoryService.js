import api from './api';

/**
 * Inventory Data Service.
 * Interfaces frontend with FastAPI backend /inventory endpoints.
 */
export const inventoryService = {
  /**
   * Fetches inventory records for all products from PostgreSQL.
   * Endpoint: GET /inventory
   */
  async getInventory() {
    return await api.get('/inventory');
  },

  /**
   * Fetches low stock product inventory records.
   * Endpoint: GET /inventory/low-stock
   */
  async getLowStockInventory() {
    return await api.get('/inventory/low-stock');
  },

  /**
   * Updates quantity and reorder level for a product.
   * Endpoint: PUT /inventory/{item_id}
   * Payload: { quantity, reorder_level }
   */
  async updateInventory(itemId, data) {
    const payload = {
      quantity: parseInt(data.quantity, 10),
      reorder_level: parseInt(data.reorder_level, 10),
    };

    return await api.put(`/inventory/${itemId}`, payload);
  },
};

export default inventoryService;
