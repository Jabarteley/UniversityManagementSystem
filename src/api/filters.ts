import { apiClient } from './client';

export const filtersAPI = {
  getFaculties: async () => {
    const response = await apiClient.get('/filters/faculties');
    return response.data;
  },
  getDepartments: async () => {
    const response = await apiClient.get('/filters/departments');
    return response.data;
  },
  getLevels: async () => {
    const response = await apiClient.get('/filters/levels');
    return response.data;
  },
  getEmploymentTypes: async () => {
    const response = await apiClient.get('/filters/employment-types');
    return response.data;
  },
  getClasses: async () => {
    const response = await apiClient.get('/filters/classes');
    return response.data;
  },
}; // ✅ Properly closed the object and statement
