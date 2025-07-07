import { apiClient } from './client';

export interface Document {
  _id: string;
  title: string;
  description?: string;
  category: 'academic' | 'administrative' | 'personal' | 'financial' | 'legal' | 'medical' | 'research';
  subcategory?: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinarySecureUrl: string;
  cloudinaryFolder: string;
  ocrText?: string;
  extractedMetadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    creationDate?: Date;
    modificationDate?: Date;
    pageCount?: number;
    language?: string;
  };
  tags: string[];
  searchableText: string;
  accessLevel: 'public' | 'restricted' | 'confidential' | 'classified';
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
  uploadedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  relatedTo?: {
    type: 'Student' | 'Staff' | 'Department' | 'Course' | 'Project';
    id: string;
    name?: string;
  };
  status: 'draft' | 'pending-review' | 'approved' | 'rejected' | 'archived';
  reviewHistory: any[];
  version: number;
  parentDocument?: string;
  versions: any[];
  encryptionStatus: 'none' | 'encrypted' | 'password-protected';
  retentionPolicy?: any;
  auditLog: any[];
  analytics: {
    viewCount: number;
    downloadCount: number;
    shareCount: number;
    lastAccessed?: Date;
    popularityScore: number;
  };
  backupStatus: 'pending' | 'backed-up' | 'failed';
  lastBackup?: Date;
  backupLocation?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const documentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    accessLevel?: string;
  }) => {
    const response = await apiClient.get('/documents', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  upload: async (formData: FormData) => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Document>) => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  download: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  archive: async (id: string) => {
    const response = await apiClient.put(`/documents/${id}/archive`);
    return response.data;
  },
  getByStudent: async (studentId: string, params?: any) => {
    const response = await apiClient.get(`/documents/student/${studentId}`, { params });
    return response.data;
  },

  getByClass: async (courseCode: string) => {
    const response = await apiClient.get(`/documents/class/${courseCode}`);
    return response.data;
  },
};
