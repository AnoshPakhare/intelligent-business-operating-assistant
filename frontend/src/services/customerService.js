import api from './api';

/**
 * Customer Service: Interfacing frontend with FastAPI backend /customers endpoints.
 */
export const customerService = {
  /**
   * Fetches all customers from PostgreSQL database.
   * Endpoint: GET /customers
   */
  async getCustomers() {
    return await api.get('/customers');
  },

  /**
   * Creates a new customer in PostgreSQL database.
   * Endpoint: POST /customers
   * Payload: { customer_type, name, phone, email, address, gstin }
   */
  async createCustomer(customerData) {
    const payload = {
      customer_type: customerData.customer_type || 'Company',
      name: customerData.name?.trim(),
      phone: customerData.phone?.trim(),
      email: customerData.email?.trim() || null,
      address: customerData.address?.trim(),
      gstin: customerData.gstin?.trim() ? customerData.gstin.trim().toUpperCase() : null,
    };

    return await api.post('/customers', payload);
  },
};

export default customerService;
