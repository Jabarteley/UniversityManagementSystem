import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Eye, BookOpen, Award, Calendar, FileText } from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { studentsAPI } from '../api/students';

const StudentRecords: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery(
    ['studentAcademicRecords', user?.id],
    () => studentsAPI.getStudentAcademicRecords(user?.id || ''),
    {
      enabled: !!user?.id,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-500">Error loading academic records.</div>;

  const studentRecords = data?.records || [];
  const academicSummary = data?.summary || {};

  const filteredRecords = studentRecords.filter(record =>
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Academic Records</h1>
          <p className="text-gray-600">
            Access and download your personal academic and financial records
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search your records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>
      </motion.div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3 mr-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {record.type}
                  </h3>
                  <p className="text-sm text-gray-500">{record.semester}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {record.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {record.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Last Updated: {record.lastUpdated}</span>
            </div>

            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Academic Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-4">
          <Award className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Academic Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{academicSummary.currentCGPA?.toFixed(2) || 'N/A'}</div>
            <div className="text-sm text-green-700">Current CGPA</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{academicSummary.completedCourses || 0}</div>
            <div className="text-sm text-blue-700">Completed Courses</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{academicSummary.currentLevel || 'N/A'}</div>
            <div className="text-sm text-purple-700">Current Level</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRecords;