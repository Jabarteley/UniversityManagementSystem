import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Clock, Plus, Edit, Eye } from 'lucide-react';

const ClassManagement: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState('current');

  const classes = [
    {
      id: 1,
      code: 'CSC301',
      name: 'Data Structures and Algorithms',
      level: '300',
      semester: 'Spring 2024',
      students: 45,
      schedule: [
        { day: 'Monday', time: '10:00 AM - 12:00 PM', venue: 'LT1' },
        { day: 'Wednesday', time: '2:00 PM - 4:00 PM', venue: 'Lab A' }
      ],
      status: 'active'
    },
    {
      id: 2,
      code: 'CSC401',
      name: 'Software Engineering',
      level: '400',
      semester: 'Spring 2024',
      students: 38,
      schedule: [
        { day: 'Tuesday', time: '8:00 AM - 10:00 AM', venue: 'LT2' },
        { day: 'Thursday', time: '10:00 AM - 12:00 PM', venue: 'Lab B' }
      ],
      status: 'active'
    },
    {
      id: 3,
      code: 'CSC501',
      name: 'Advanced Algorithms',
      level: '500',
      semester: 'Spring 2024',
      students: 22,
      schedule: [
        { day: 'Friday', time: '2:00 PM - 5:00 PM', venue: 'LT3' }
      ],
      status: 'active'
    }
  ];

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
                {classes.reduce((sum, cls) => sum + cls.students, 0)}
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
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hours/Week</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <div className="bg-orange-500 rounded-lg p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Classes List */}
      <div className="space-y-6">
        {classes.map((classItem, index) => (
          <motion.div
            key={classItem.id}
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
                    {classItem.code} - {classItem.name}
                  </h3>
                  <p className="text-gray-600">{classItem.level} Level • {classItem.semester}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {classItem.students} Students
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {classItem.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schedule */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Class Schedule</h4>
                <div className="space-y-2">
                  {classItem.schedule.map((schedule, scheduleIndex) => (
                    <div key={scheduleIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{schedule.day}</p>
                        <p className="text-sm text-gray-600">{schedule.time}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{schedule.venue}</span>
                    </div>
                  ))}
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
    </div>
  );
};

export default ClassManagement;