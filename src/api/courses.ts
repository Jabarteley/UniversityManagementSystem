import { apiClient } from './client';

export const coursesAPI = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/courses', { params: filters });
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data;
  },
};
