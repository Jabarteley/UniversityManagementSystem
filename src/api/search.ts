import { apiClient } from './client';

export interface SearchResult {
  type: 'document' | 'student' | 'staff' | 'user';
  item: any;
  score: number;
  matches?: any[];
}

export const searchAPI = {
  globalSearch: async (query: string, options?: {
    types?: string[];
    limit?: number;
  }) => {
    const response = await apiClient.get('/search/global', {
      params: { q: query, ...options }
    });
    return response.data;
  },

  getSuggestions: async (query: string, type?: string) => {
    const response = await apiClient.get('/search/suggestions', {
      params: { q: query, type }
    });
    return response.data;
  },

  getPopularTerms: async () => {
    const response = await apiClient.get('/search/popular');
    return response.data;
  },

  advancedDocumentSearch: async (searchData: {
    query: string;
    category?: string;
    subcategory?: string;
    accessLevel?: string;
    dateRange?: { start: string; end: string };
    tags?: string[];
    uploadedBy?: string;
    limit?: number;
  }) => {
    const response = await apiClient.post('/search/documents/advanced', searchData);
    return response.data;
  },

  refreshIndexes: async () => {
    const response = await apiClient.post('/search/refresh-indexes');
    return response.data;
  },
};