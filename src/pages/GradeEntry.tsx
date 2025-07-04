import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Save, Search, Filter, BookOpen, Users } from 'lucide-react';

const GradeEntry: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('CSC301');
  const [selectedAssignment, setSelectedAssignment] = useState('midterm');

  const classes = [
    { code: 'CSC301', name: 'Data Structures', students: 45 },
    { code: 'CSC401', name: 'Software Engineering', students: 38 },
    { code: 'CSC501', name: 'Advanced Algorithms', students: 22 }
  ];

  const assignments = [
    { id: 'assignment1', name: 'Assignment 1', type: 'Assignment', maxScore: 20 },
    { id: 'assignment2', name: 'Assignment 2', type: 'Assignment', maxScore: 20 },
    { id: 'midterm', name: 'Midterm Exam', type: 'Exam', maxScore: 30 },
    { id: 'final', name: 'Final Exam', type: 'Exam', maxScore: 30 }
  ];

  const students = [
    {
      id: 1,
      registrationNumber: 'UNI/2023/001',
      firstName: 'John',
      lastName: 'Doe',
      currentGrade: 85,
      attendance: 95
    },
    {
      id: 2,
      registrationNumber: 'UNI/2023/002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      currentGrade: 78,
      attendance: 88
    },
    {
      id: 3,
      registrationNumber: 'UNI/2023/003',
      firstName: 'Michael',
      lastName: 'Brown',
      currentGrade: 92,
      attendance: 92
    }
  ];

  const [grades, setGrades] = useState<{ [key: string]: number }>({});

  const handleGradeChange = (studentId: string, grade: number) => {
    setGrades(prev => ({ ...prev, [studentId]: grade }));
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
          <p className="text-gray-600">
            Enter and manage student grades for your classes
          </p>
        </motion.div>
      </div>

      {/* Class and Assignment Selection */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {classes.map(cls => (
                <option key={cls.code} value={cls.code}>
                  {cls.code} - {cls.name} ({cls.students} students)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Assignment/Exam</label>
            <select 
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} ({assignment.type} - {assignment.maxScore} pts)
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grade Entry Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Grade Entry - {assignments.find(a => a.id === selectedAssignment)?.name}
          </h3>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            <Save className="h-4 w-4 mr-2" />
            Save Grades
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score ({assignments.find(a => a.id === selectedAssignment)?.maxScore} pts)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letter Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => {
                const currentScore = grades[student.id] || 0;
                const letterGrade = getLetterGrade(currentScore);
                
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-white">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getGradeColor(student.currentGrade)}`}>
                        {student.currentGrade}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        student.attendance >= 90 ? 'text-green-600' :
                        student.attendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max={assignments.find(a => a.id === selectedAssignment)?.maxScore || 100}
                        value={grades[student.id] || ''}
                        onChange={(e) => handleGradeChange(student.id.toString(), parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                        letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                        letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {letterGrade}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Grade Distribution */}
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
          {['A', 'B', 'C', 'D', 'F'].map((grade, index) => {
            const count = Object.values(grades).filter(score => getLetterGrade(score) === grade).length;
            const percentage = students.length > 0 ? (count / students.length * 100).toFixed(1) : 0;
            
            return (
              <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  grade === 'A' ? 'text-green-600' :
                  grade === 'B' ? 'text-blue-600' :
                  grade === 'C' ? 'text-yellow-600' :
                  grade === 'D' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600">Grade {grade}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default GradeEntry;