import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Mail, Phone, Building, Calendar, UserCheck, Award, Edit, Trash2 } from 'lucide-react';
import { staffAPI } from '../api/staff';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Staff: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    employmentType: '',
    status: ''
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery(
    ['staff', filters],
    () => staffAPI.getAll(filters),
    {
      keepPreviousData: true
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'retired':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'administrative':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddStaff = () => {
    setShowAddModal(true);
  };

  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    setShowAddModal(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffAPI.delete(staffId);
        toast.success('Staff member deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete staff member');
      }
    }
  };

  const handlePromoteStaff = async (staffId: string) => {
    const toRank = prompt('Enter new rank:');
    const reason = prompt('Enter promotion reason:');
    
    if (toRank && reason) {
      try {
        await staffAPI.promote(staffId, { toRank, reason });
        toast.success('Staff member promoted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to promote staff member');
      }
    }
  };

  const handleGrantLeave = async (staffId: string) => {
    const type = prompt('Enter leave type (annual/sick/casual):');
    const days = prompt('Enter number of days:');
    const reason = prompt('Enter leave reason:');
    
    if (type && days && reason) {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + parseInt(days));
        
        await staffAPI.grantLeave(staffId, {
          type,
          startDate,
          endDate,
          days: parseInt(days),
          reason,
          status: 'approved'
        });
        toast.success('Leave granted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to grant leave');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading staff</p>
      </div>
    );
  }

  const staff = data?.staff || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Management</h1>
            <p className="text-gray-600">Manage staff records, employment information, and activities</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 sm:mt-0 flex space-x-3"
          >
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button 
              onClick={handleAddStaff}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </button>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <select 
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Registry">Registry</option>
            <option value="Finance">Finance</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Library">Library</option>
          </select>

          <select 
            value={filters.employmentType}
            onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="support">Support</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="suspended">Suspended</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </motion.div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No staff found</p>
          <p className="text-gray-400 text-sm mt-2">
            Add your first staff member to get started
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member: any, index: number) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-white">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{member.staffId}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.employmentInfo?.currentStatus || 'active')}`}>
                    {member.employmentInfo?.currentStatus || 'active'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(member.employmentInfo?.employmentType || 'academic')}`}>
                    {member.employmentInfo?.employmentType || 'academic'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{member.email}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{member.phone}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{member.employmentInfo?.department || 'N/A'}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Award className="h-4 w-4 mr-2" />
                  <span>{member.employmentInfo?.position || 'N/A'}</span>
                </div>

                <div className="text-sm text-gray-600 font-medium">
                  {member.employmentInfo?.rank || 'N/A'}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Date of Appointment</span>
                  <span className="font-medium text-gray-900">
                    {member.employmentInfo?.dateOfAppointment ? 
                      format(new Date(member.employmentInfo.dateOfAppointment), 'MMM d, yyyy') : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Faculty</span>
                  <span className="font-medium text-gray-900">
                    {member.employmentInfo?.faculty || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Basic Salary</span>
                  <span className="font-bold text-green-600">
                    ${member.employmentInfo?.salary?.basic?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditStaff(member)}
                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                    title="Edit Staff"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteStaff(member._id)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    title="Delete Staff"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handlePromoteStaff(member._id)}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    Promote
                  </button>
                  <button 
                    onClick={() => handleGrantLeave(member._id)}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    Grant Leave
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedStaff ? 'Edit Staff' : 'Add New Staff'}
            </h3>
            <p className="text-gray-600 mb-4">
              Staff management functionality will be implemented here.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedStaff(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.info('Staff form functionality coming soon!');
                  setShowAddModal(false);
                  setSelectedStaff(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedStaff ? 'Update' : 'Add'} Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;