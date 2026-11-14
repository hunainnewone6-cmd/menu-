import { api } from './client.js';

export const menuApi = {
  async getMenu() {
    return api.get('/menu');
  },

  async getAdminMenu(includeHidden = true) {
    return api.get(`/menu/admin?includeHidden=${includeHidden}`);
  },

  async createMenuItem(item) {
    return api.post('/menu/admin', item);
  },

  async updateMenuItem(id, updates) {
    return api.patch(`/menu/admin/${id}`, updates);
  },
};