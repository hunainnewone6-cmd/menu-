import { api } from './client.js';

export const authApi = {
  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async verify2FA(pendingToken, token, useBackupCode = false) {
    return api.post('/auth/verify-2fa', { token, useBackupCode }, {
      headers: {
        Authorization: `Bearer ${pendingToken}`,
      },
    });
  },

  async me(token) {
    return api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async enroll2FA(token) {
    return api.post('/auth/2fa/enroll', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async confirm2FA(token, totpCode) {
    return api.post('/auth/2fa/confirm', { token: totpCode }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async disable2FA(token, totpCode) {
    return api.post('/auth/2fa/disable', { token: totpCode }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};