import { apiClient } from './client';

export interface File {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  category: 'academic' | 'administrative' | 'student' | 'staff' | 'report' | 'other';
  description?: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  accessLevel: 'public' | 'restricted' | 'confidential';
  metadata: {
    department?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const filesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    accessLevel?: string;
  }) => {
    const response = await apiClient.get('/files', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/files/${id}`);
    return response.data;
  },

  upload: async (formData: FormData) => {
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<File>) => {
    const response = await apiClient.put(`/files/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/files/${id}`);
    return response.data;
  },

  download: async (id: string) => {
    const response = await apiClient.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  archive: async (id: string) => {
    const response = await apiClient.put(`/files/${id}/archive`);
    return response.data;
  },
};