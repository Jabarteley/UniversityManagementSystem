import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, GraduationCap, Mail, Phone, Award, BookOpen, Eye, Edit } from 'lucide-react';

const MyStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const myStudents = [
    {
      id: 1,
      registrationNumber: 'UNI/2023/001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      phone: '+1234567890',
      class: 'CSC301',
      level: '300',
      currentGrade: 'A',
      attendance: 95,
      lastAssignment: 'Assignment 3 - Data Structures'
    },
    {
      id: 2,
      registrationNumber: 'UNI/2023/002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@university.edu',
      phone: '+1234567891',
      class: 'CSC301',
      level: '300',
      currentGrade: 'B+',
      attendance: 88,
      lastAssignment: 'Assignment 3 - Data Structures'
    },
    {
      id: 3,
      registrationNumber: 'UNI/2022/045',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@university.edu',
      phone: '+1234567892',
      class: 'CSC401',
      level: '400',
      currentGrade: 'A-',
      attendance: 92,
      lastAssignment: 'Project Proposal'
    }
  ];

  const myClasses = [
    { code: 'CSC301', name: 'Data Structures', students: 45 },
    { code: 'CSC401', name: 'Software Engineering', students: 38 },
    { code: 'CSC501', name: 'Advanced Algorithms', students: 22 }
  ];

  const filteredStudents = myStudents.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
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
        {myClasses.map((classItem, index) => (
          <div key={classItem.code} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 rounded-lg p-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{classItem.students}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{classItem.code}</h3>
            <p className="text-gray-600 text-sm">{classItem.name}</p>
          </div>
        ))}
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
              {myClasses.map(cls => (
                <option key={cls.code} value={cls.code}>{cls.code} - {cls.name}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-white">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{student.registrationNumber}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.currentGrade)}`}>
                {student.currentGrade}
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
                <span>{student.class} - {student.level} Level</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Attendance:</span>
                <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                  {student.attendance}%
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Last: {student.lastAssignment}
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
    </div>
  );
};

export default MyStudents;