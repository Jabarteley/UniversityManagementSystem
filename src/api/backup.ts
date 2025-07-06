import { apiClient } from './client';

export const backupAPI = {
  getStatus: async () => {
    const response = await apiClient.get('/backup/status');
    return response.data;
  },

  create: async () => {
    const response = await apiClient.post('/backup/create');
    return response.data;
  },

  list: async () => {
    const response = await apiClient.get('/backup/list');
    return response.data;
  },

  restore: async (backupId: string) => {
    const response = await apiClient.post(`/backup/restore/${backupId}`);
    return response.data;
  },

  updateSchedule: async (schedule: string) => {
    const response = await apiClient.put('/backup/schedule', { schedule });
    return response.data;
  },

  cleanup: async () => {
    const response = await apiClient.delete('/backup/cleanup');
    return response.data;
  },
};