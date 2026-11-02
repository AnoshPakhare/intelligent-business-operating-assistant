import api from './api';

/**
 * Invoice Data Service.
 * Interfaces frontend with FastAPI backend /invoices endpoints.
 */
export const invoiceService = {
  /**
   * Fetches all invoice summary records from PostgreSQL.
   * Endpoint: GET /invoices
   */
  async getInvoices() {
    return await api.get('/invoices');
  },

  /**
   * Fetches detailed invoice record with customer metadata and line items.
   * Endpoint: GET /invoices/{invoice_id}
   */
  async getInvoiceDetail(invoiceId) {
    return await api.get(`/invoices/${invoiceId}`);
  },

  /**
   * Creates a new invoice in PostgreSQL.
   * Endpoint: POST /invoices
   * Payload: { customer_id, items: [{ item_id, quantity }], discount }
   */
  async createInvoice(invoiceData) {
    const payload = {
      customer_id: parseInt(invoiceData.customer_id, 10),
      items: invoiceData.items.map((line) => ({
        item_id: parseInt(line.item_id, 10),
        quantity: parseFloat(line.quantity),
      })),
      discount: invoiceData.discount ? parseFloat(invoiceData.discount) : 0,
    };

    return await api.post('/invoices', payload);
  },

  /**
   * Cancels an invoice and restores product stock in PostgreSQL.
   * Endpoint: PUT /invoices/{invoice_id}/cancel
   */
  async cancelInvoice(invoiceId) {
    return await api.put(`/invoices/${invoiceId}/cancel`);
  },

  /**
   * Downloads dynamically generated PDF for an invoice from FastAPI backend.
   * Endpoint: GET /invoices/{invoice_id}/pdf
   */
  async downloadInvoicePDF(invoiceId, invoiceNumber) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/pdf`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || 'Failed to download PDF invoice');
    }

    const blob = await response.blob();
    const safeNum = (invoiceNumber || `INV_${invoiceId}`).replace(/[/\\?%*:|"<>]/g, '_');
    const filename = `Invoice_${safeNum}.pdf`;

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },
};

export default invoiceService;
