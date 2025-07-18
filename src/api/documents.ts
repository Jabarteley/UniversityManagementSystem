import { apiClient } from './client';

export const documentsAPI = {
  upload: (formData: FormData) => {
    return apiClient.post('/documents/upload', formData);
  },
  getAll: (params: { courseCode?: string; category?: string } = {}) => {
    return apiClient.get('/documents', { params });
  },
  delete: (id: string) => {
    return apiClient.delete(`/documents/${id}`);
  },
};