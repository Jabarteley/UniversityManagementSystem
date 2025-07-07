import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Filter, GraduationCap, Mail, Phone, Award, BookOpen, Eye, Edit } from 'lucide-react';
import { studentsAPI } from '../api/students';
import { dashboardAPI } from '../api/dashboard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';


const MyStudents: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const { data: studentsData, isLoading, error } = useQuery(
    ['myStudents', user?._id],
    () => studentsAPI.getByStaffId(user?._id || ''),
    {
      enabled: !!user?._id,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Fetch staff data to get teaching load
  const { data: staffData } = useQuery(
    'staffDashboardStats',
    dashboardAPI.getStaffStats,
    {
      enabled: user?.role === 'staff',
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading students data</p>
        <p className="text-gray-500 text-sm mt-2">Please check your connection and try again</p>
      </div>
    );
  }

  const students = studentsData?.students || [];
  const myClasses = staffData?.myClasses || [];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.academicInfo.courses.some(course => course.courseCode === selectedClass);

    return matchesSearch && matchesClass;
  });

  const getGradeColor = (grade: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getLatestGrade = (student: any) => {
    if (!student.results || student.results.length === 0) return 'N/A';
    const latestResult = student.results[student.results.length - 1];
    return latestResult.cgpa ? latestResult.cgpa.toFixed(2) : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Students</h1>
          <p className="text-gray-600">
            Manage students in your assigned classes
          </p>
        </motion.div>
      </div>

      {/* Class Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {myClasses.length > 0 ? myClasses.map((classItem: any, index: number) => (
          <div key={classItem.courseCode || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 rounded-lg p-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{classItem.studentCount || 0}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{classItem.courseCode}</h3>
            <p className="text-gray-600 text-sm">{classItem.courseName}</p>
          </div>
        )) : (
          <div className="col-span-3 text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No classes assigned this semester</p>
          </div>
        )}
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Classes</option>
              {myClasses.map((cls: any) => (
                <option key={cls.courseCode} value={cls.courseCode}>
                  {cls.courseCode} - {cls.courseName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No students found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search criteria' : 'No students are currently assigned to your classes'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student: any, index: number) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-white">
                      {student.firstName?.charAt(0) || 'S'}
                      {student.lastName?.charAt(0) || ''}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{student.registrationNumber}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(getLatestGrade(student))}`}>
                  {getLatestGrade(student)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{student.email || 'N/A'}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{student.phone || 'N/A'}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{student.academicInfo?.faculty} - {student.academicInfo?.level} Level</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    student.academicInfo?.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {student.academicInfo?.status || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Department: {student.academicInfo?.department || 'N/A'}
                </p>
                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex items-center px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                    <Award className="h-4 w-4 mr-1" />
                    Grade
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudents;