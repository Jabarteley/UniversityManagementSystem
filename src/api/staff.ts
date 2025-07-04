import { apiClient } from './client';

export interface Staff {
  _id: string;
  staffId: string;
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
  employmentInfo: {
    department: string;
    faculty: string;
    position: string;
    rank: string;
    employmentType: 'academic' | 'administrative' | 'support';
    dateOfAppointment: string;
    currentStatus: 'active' | 'on-leave' | 'suspended' | 'retired' | 'terminated';
    salary: {
      basic: number;
      allowances: number;
      total: number;
    };
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    yearObtained: number;
    field: string;
  }>;
  leaveRecords: Array<{
    type: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'study' | 'terminal';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: string;
  }>;
  promotions: Array<{
    fromRank: string;
    toRank: string;
    effectiveDate: string;
    reason: string;
  }>;
  deployments: Array<{
    fromDepartment: string;
    toDepartment: string;
    effectiveDate: string;
    reason: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const staffAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    employmentType?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/staff', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/staff/${id}`);
    return response.data;
  },

  create: async (data: Partial<Staff>) => {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Staff>) => {
    const response = await apiClient.put(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },

  grantLeave: async (id: string, leaveData: any) => {
    const response = await apiClient.post(`/staff/${id}/leave`, leaveData);
    return response.data;
  },

  promote: async (id: string, promotionData: any) => {
    const response = await apiClient.post(`/staff/${id}/promote`, promotionData);
    return response.data;
  },

  deploy: async (id: string, deploymentData: any) => {
    const response = await apiClient.post(`/staff/${id}/deploy`, deploymentData);
    return response.data;
  },
};