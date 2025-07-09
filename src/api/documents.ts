import { apiClient } from './client';

export const documentsAPI = {
  upload: (formData: FormData) => {
    return apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => {
    return apiClient.get('/documents');
  },
  delete: (id: string) => {
    return apiClient.delete(`/documents/${id}`);
  },
};