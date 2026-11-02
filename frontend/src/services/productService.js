import api from './api';

/**
 * Product & Service Data Service.
 * Interfaces frontend with FastAPI backend /items endpoints.
 */
export const productService = {
  /**
   * Fetches all products and services from PostgreSQL.
   * Endpoint: GET /items
   */
  async getItems() {
    return await api.get('/items');
  },

  /**
   * Creates a new product or service in PostgreSQL.
   * Endpoint: POST /items
   * Payload: { name, type, description, price, unit, gst_applicable, gst_rate }
   */
  async createItem(itemData) {
    const payload = {
      name: itemData.name?.trim(),
      type: itemData.type || 'PRODUCT',
      description: itemData.description?.trim() || null,
      price: parseFloat(itemData.price),
      unit: itemData.unit?.trim() || 'pcs',
      gst_applicable: Boolean(itemData.gst_applicable),
      gst_rate: itemData.gst_applicable && itemData.gst_rate ? parseFloat(itemData.gst_rate) : null,
    };

    return await api.post('/items', payload);
  },
};

export default productService;
