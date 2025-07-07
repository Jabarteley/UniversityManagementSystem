import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Clock, Plus, Edit, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI } from '../api/dashboard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ClassManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('current');

  // Fetch staff dashboard data to get classes
 const { data: staffData, isLoading, error } = useQuery(
  ['staffDashboardStats'],
  dashboardAPI.getStaffStats,
  {
    enabled: !!user?.role, // ✅ Only run when user is loaded
    retry: 1,
    refetchOnWindowFocus: false
  }
);


  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading class data</p>
        <p className="text-gray-500 text-sm mt-2">Please check your connection and try again</p>
      </div>
    );
  }

  const classes = staffData?.myClasses || [];
  const stats = staffData?.stats || {};

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Management</h1>
            <p className="text-gray-600">Manage your assigned classes and schedules</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 sm:mt-0"
          >
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Add Class Material
            </button>
          </motion.div>
        </div>
      </div>

      {/* Class Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((sum: number, cls: any) => sum + (cls.studentCount || 0), 0)}
              </p>
            </div>
            <div className="bg-green-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credit Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((sum: number, cls: any) => sum + (cls.creditHours || 0), 0)}
              </p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Employment Type</p>
              <p className="text-lg font-bold text-gray-900">{stats.employmentType || 'N/A'}</p>
            </div>
            <div className="bg-orange-500 rounded-lg p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No classes assigned</p>
          <p className="text-gray-400 text-sm mt-2">
            You don't have any classes assigned for this semester
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {classes.map((classItem: any, index: number) => (
            <motion.div
              key={classItem.courseCode || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {classItem.courseCode} - {classItem.courseName}
                    </h3>
                    <p className="text-gray-600">{classItem.level} Level • {classItem.semester} Semester</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {classItem.studentCount || 0} Students
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {classItem.creditHours || 0} Credit Hours
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Class Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Course Code</p>
                        <p className="text-sm text-gray-600">{classItem.courseCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Course Name</p>
                        <p className="text-sm text-gray-600">{classItem.courseName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Credit Hours</p>
                        <p className="text-sm text-gray-600">{classItem.creditHours || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">View Students</span>
                    </button>
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Edit className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Enter Grades</span>
                    </button>
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Materials</span>
                    </button>
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Attendance</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManagement;