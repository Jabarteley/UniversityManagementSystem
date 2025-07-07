import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Award, Save, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { studentsAPI } from '../api/students';
import { dashboardAPI } from '../api/dashboard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const GradeEntry: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('midterm');
  const [grades, setGrades] = useState<{ [key: string]: number }>({});

  const { data: staffData = {}, isLoading: staffLoading } = useQuery(
    ['staffDashboardStats'],
    dashboardAPI.getStaffStats,
    {
      enabled: user?.role === 'staff',
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const classes = staffData?.myClasses || [];

  const { data: studentsData = {}, isLoading: studentsLoading } = useQuery(
    ['classStudents', selectedClass],
    () => studentsAPI.getByClass(selectedClass),
    {
      enabled: !!selectedClass,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const students = studentsData?.students || [];

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].courseCode);
    }
  }, [classes, selectedClass]);

  if (staffLoading) return <LoadingSpinner />;

  const assignments = [
    { id: 'assignment1', name: 'Assignment 1', type: 'Assignment', maxScore: 20 },
    { id: 'assignment2', name: 'Assignment 2', type: 'Assignment', maxScore: 20 },
    { id: 'midterm', name: 'Midterm Exam', type: 'Exam', maxScore: 30 },
    { id: 'final', name: 'Final Exam', type: 'Exam', maxScore: 30 },
  ];

  const handleGradeChange = (studentId: string, grade: number) => {
    setGrades((prev) => ({ ...prev, [studentId]: grade }));
  };

  const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCurrentCGPA = (student: any) => {
    if (!student.results || student.results.length === 0) return 0;
    const latestResult = student.results[student.results.length - 1];
    return latestResult.cgpa || 0;
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Grade Entry</h1>
          <p className="text-gray-600">Enter and manage student grades for your classes</p>
        </motion.div>
      </div>

      {/* Class & Assignment Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              {classes.map((cls: any) => (
                <option key={cls.courseCode} value={cls.courseCode}>
                  {cls.courseCode} - {cls.courseName} ({cls.studentCount || 0} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Assignment/Exam</label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} ({assignment.type} - {assignment.maxScore} pts)
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grade Table */}
      {selectedClass ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Grade Entry - {assignments.find((a) => a.id === selectedAssignment)?.name}
            </h3>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Grades
            </button>
          </div>

          {studentsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found for this class</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current CGPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score ({assignments.find((a) => a.id === selectedAssignment)?.maxScore} pts)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student: any, index: number) => {
                    const score = grades[student._id] || 0;
                    const letter = getLetterGrade(score);
                    const cgpa = getCurrentCGPA(student);

                    return (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white font-bold">
                              {student.userId?.profile?.firstName?.[0] || 'S'}
                              {student.userId?.profile?.lastName?.[0] || ''}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{student.registrationNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getGradeColor(cgpa * 20)}`}>
                            {cgpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium ${
                              student.academicInfo?.status === 'active'
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {student.academicInfo?.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max={assignments.find((a) => a.id === selectedAssignment)?.maxScore || 100}
                            value={grades[student._id] || ''}
                            onChange={(e) => handleGradeChange(student._id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              letter === 'A'
                                ? 'bg-green-100 text-green-800'
                                : letter === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : letter === 'C'
                                ? 'bg-yellow-100 text-yellow-800'
                                : letter === 'D'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {letter}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Select a class to start entering grades</p>
        </motion.div>
      )}

      {/* Grade Distribution */}
      {selectedClass && students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <Award className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {['A', 'B', 'C', 'D', 'F'].map((grade) => {
              const count = Object.values(grades).filter((score) => getLetterGrade(score) === grade).length;
              const percentage = ((count / students.length) * 100).toFixed(1);
              return (
                <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div
                    className={`text-2xl font-bold ${
                      grade === 'A'
                        ? 'text-green-600'
                        : grade === 'B'
                        ? 'text-blue-600'
                        : grade === 'C'
                        ? 'text-yellow-600'
                        : grade === 'D'
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {count}
                  </div>
                  <div className="text-sm text-gray-600">Grade {grade}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GradeEntry;
