import { api } from './client.js';

export const ordersApi = {
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  },

  async getOrder(orderId, mobile = null) {
    const query = mobile ? `?mobile=${encodeURIComponent(mobile)}` : '';
    return api.get(`/orders/${orderId}${query}`);
  },
};