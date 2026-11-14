import { api } from './client.js';

export const adminApi = {
  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.date) params.append('date', filters.date);
    const query = params.toString();
    return api.get(`/admin/orders${query ? `?${query}` : ''}`);
  },

  async updateOrderStatus(orderId, status) {
    return api.patch(`/admin/orders/${orderId}/status`, { status });
  },

  async exportOrdersCsv(filters = {}) {
    const params = new URLSearchParams();
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.date) params.append('date', filters.date);
    const query = params.toString();

    const url = `${api.get('/admin/orders/export.csv').toString().replace('/admin/orders', '')}/admin/orders/export.csv${query ? `?${query}` : ''}`;
    // Use fetch directly for CSV download
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    const response = await fetch(`${API_BASE}/admin/orders/export.csv${query ? `?${query}` : ''}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to export CSV');
    }

    return response.blob();
  },
};