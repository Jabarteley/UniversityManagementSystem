import { apiClient } from './client';

export interface Student {
  _id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  academicInfo: {
    faculty: string;
    department: string;
    program: string;
    level: string;
    yearOfAdmission: number;
    currentSemester: number;
    status: 'active' | 'graduated' | 'suspended' | 'withdrawn';
  };
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
  };
  results: Array<{
    semester: number;
    year: number;
    courses: Array<{
      courseCode: string;
      courseName: string;
      creditUnits: number;
      grade: string;
      gradePoint: number;
    }>;
    gpa: number;
    cgpa: number;
  }>;
  documents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const studentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    faculty?: string;
    department?: string;
    level?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  getByRegistrationNumber: async (regNumber: string) => {
    const response = await apiClient.get(`/students/registration/${regNumber}`);
    return response.data;
  },

  create: async (data: Partial<Student>) => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Student>) => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  addResult: async (id: string, result: any) => {
    const response = await apiClient.post(`/students/${id}/results`, result);
    return response.data;
  },
};