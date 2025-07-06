import React, { useState } from 'react';
import AddStudentModal from '../components/Students/AddStudentModal'; 
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Mail, Phone, GraduationCap, Calendar, User, BookOpen } from 'lucide-react';
import { studentsAPI } from '../api/students';
import { format } from 'date-fns';

import { filtersAPI } from '../api/filters';

const Students: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    faculty: '',
    department: '',
    level: '',
    status: ''
  });

  const { data, isLoading, error } = useQuery(
    ['students', filters],
    () => studentsAPI.getAll(filters),
    {
      keepPreviousData: true
    }
  );

  const { data: faculties } = useQuery('faculties', filtersAPI.getFaculties);
  const { data: departments } = useQuery('departments', filtersAPI.getDepartments);
  const { data: levels } = useQuery('levels', filtersAPI.getLevels);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <p className="text-red-500">Error loading students</p>
      </div>
    );
  }

  const students = data?.students || [];

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Management</h1>
            <p className="text-gray-600">Manage student records, bio-data, and academic information</p>
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
  onClick={() => setShowAddModal(true)}
  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
>
  <Plus className="h-4 w-4 mr-2" />
  Add Student
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <select 
            value={filters.faculty}
            onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Faculties</option>
            {faculties?.map((faculty: string) => (
              <option key={faculty} value={faculty}>{faculty}</option>
            ))}
          </select>

          <select 
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Departments</option>
            {departments?.map((department: string) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>

          <select 
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Levels</option>
            {levels?.map((level: string) => (
              <option key={level} value={level}>{level} Level</option>
            ))}
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </motion.div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No students found</p>
          <p className="text-gray-400 text-sm mt-2">
            Add your first student to get started
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student: any, index: number) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-white">
                      {student.userId?.profile?.firstName?.charAt(0)}{student.userId?.profile?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{student.registrationNumber}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.academicInfo.status)}`}>
                  {student.academicInfo.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{student.email}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{student.phone}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{student.academicInfo.faculty}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>{student.academicInfo.department}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  <span>{student.academicInfo.level} Level</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Year of Admission</span>
                  <span className="font-medium text-gray-900">
                    {student.academicInfo.yearOfAdmission}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Current Semester</span>
                  <span className="font-medium text-gray-900">
                    {student.academicInfo.currentSemester}
                  </span>
                </div>
              </div>

              {student.results && student.results.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Latest CGPA</span>
                    <span className="font-bold text-blue-600">
                      {student.results?.[student.results.length - 1]?.cgpa?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    <AddStudentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

export default Students; 