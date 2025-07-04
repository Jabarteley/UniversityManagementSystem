import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Award, BookOpen, Calendar, User } from 'lucide-react';
import { studentsAPI } from '../api/students';

const ResultPortal: React.FC = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!registrationNumber.trim()) {
      setError('Please enter a registration number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await studentsAPI.getByRegistrationNumber(registrationNumber);
      setStudent(response.student);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Student not found');
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = (courses: any[]) => {
    if (!courses || courses.length === 0) return 0;
    const totalPoints = courses.reduce((sum, course) => sum + (course.gradePoint * course.creditUnits), 0);
    const totalUnits = courses.reduce((sum, course) => sum + course.creditUnits, 0);
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
      case 'B+':
        return 'bg-blue-100 text-blue-800';
      case 'C':
      case 'C+':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Result Portal</h1>
          <p className="text-gray-600">
            Enter your registration number to view your academic results
          </p>
        </motion.div>
      </div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="max-w-md mx-auto">
          <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Registration Number
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                id="regNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g., UNI/2023/001"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </motion.div>

      {/* Student Information */}
      {student && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mr-6">
              <span className="text-xl font-bold text-white">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-600">{student.registrationNumber}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {student.academicInfo.faculty}
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  {student.academicInfo.department}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {student.academicInfo.level} Level
                </div>
              </div>
            </div>
          </div>

          {/* Academic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Program</p>
                  <p className="text-lg font-bold text-blue-900">{student.academicInfo.program}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Current Semester</p>
                  <p className="text-lg font-bold text-green-900">{student.academicInfo.currentSemester}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Year of Admission</p>
                  <p className="text-lg font-bold text-purple-900">{student.academicInfo.yearOfAdmission}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Status</p>
                  <p className="text-lg font-bold text-orange-900 capitalize">{student.academicInfo.status}</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Results */}
          {student.results && student.results.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Academic Results</h3>
              
              {student.results.map((result: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Semester {result.semester}, {result.year}
                    </h4>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">GPA</p>
                        <p className="font-bold text-blue-600">{result.gpa.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">CGPA</p>
                        <p className="font-bold text-green-600">{result.cgpa.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credit Units
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade Point
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.courses.map((course: any, courseIndex: number) => (
                          <tr key={courseIndex} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {course.courseCode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {course.courseName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {course.creditUnits}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(course.grade)}`}>
                                {course.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {course.gradePoint.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No results available yet</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ResultPortal;