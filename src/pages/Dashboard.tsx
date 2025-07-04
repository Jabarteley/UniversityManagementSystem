import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCheck, FileText, TrendingUp, Clock, Activity, BookOpen, FolderOpen, Award, Calendar, Upload, Download, CheckCircle, PersonStanding as PendingActions } from 'lucide-react';
import { dashboardAPI } from '../api/dashboard';
import { usersAPI } from '../api/users';
import StatsCard from '../components/Dashboard/StatsCard';
import FacultyChart from '../components/Dashboard/FacultyChart';
import StatusChart from '../components/Dashboard/StatusChart';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    'dashboardStats', 
    dashboardAPI.getStats,
    {
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const { data: usersData, isLoading: usersLoading } = useQuery(
    'dashboardUsers',
    () => usersAPI.getAll({ limit: 100 }),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      enabled: user?.role === 'admin' || user?.role === 'system-admin'
    }
  );

  if (dashboardLoading) return <LoadingSpinner />;
  
  if (dashboardError) {
    console.error('Dashboard error:', dashboardError);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading dashboard data</p>
        <p className="text-gray-500 text-sm mt-2">Please check your connection and try again</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentActivities = dashboardData?.recentActivities || [];
  const facultyStats = dashboardData?.facultyStats || [];
  const studentStatusStats = dashboardData?.studentStatusStats || [];
  const staffTypeStats = dashboardData?.staffTypeStats || [];
  const users = usersData?.users || [];

  // Student Dashboard
  if (user?.role === 'student') {
    const studentStats = [
      {
        title: 'Current CGPA',
        value: 3.75,
        icon: Award,
        color: 'bg-green-500',
        change: '+0.15',
        changeType: 'positive' as const,
      },
      {
        title: 'Completed Courses',
        value: 24,
        icon: BookOpen,
        color: 'bg-blue-500',
        change: '+3',
        changeType: 'positive' as const,
      },
      {
        title: 'Current Semester',
        value: 6,
        icon: Calendar,
        color: 'bg-purple-500',
        change: '0',
        changeType: 'positive' as const,
      },
      {
        title: 'Documents',
        value: 12,
        icon: FolderOpen,
        color: 'bg-orange-500',
        change: '+2',
        changeType: 'positive' as const,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Student Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold mb-2">Welcome Back, {user?.profile?.firstName}!</h1>
            <p className="text-green-100">
              Track your academic progress and manage your documents
            </p>
          </motion.div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Student Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/results')}
                className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="font-medium text-green-900">View My Results</div>
                <div className="text-sm text-green-600">Check your latest grades and CGPA</div>
              </button>
              <button 
                onClick={() => navigate('/upload-documents')}
                className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-blue-900">Upload Documents</div>
                <div className="text-sm text-blue-600">Submit assignments and required documents</div>
              </button>
              <button 
                onClick={() => navigate('/my-records')}
                className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium text-purple-900">Download Records</div>
                <div className="text-sm text-purple-600">Access your academic transcripts</div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Academic Progress</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Level</span>
                <span className="font-medium text-gray-900">300 Level</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Semester</span>
                <span className="font-medium text-gray-900">2nd Semester</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CGPA</span>
                <span className="font-bold text-green-600">3.75</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <Upload className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Document Submissions</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Course Registration Form', date: '2 days ago', status: 'Approved' },
              { name: 'Internship Report', date: '1 week ago', status: 'Under Review' },
              { name: 'Thesis Proposal', date: '2 weeks ago', status: 'Approved' }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.date}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  doc.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  doc.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Staff Dashboard
  if (user?.role === 'staff') {
    const staffStats = [
      {
        title: 'My Students',
        value: 45,
        icon: GraduationCap,
        color: 'bg-blue-500',
        change: '+3',
        changeType: 'positive' as const,
      },
      {
        title: 'Classes This Semester',
        value: 6,
        icon: BookOpen,
        color: 'bg-green-500',
        change: '+1',
        changeType: 'positive' as const,
      },
      {
        title: 'Pending Grades',
        value: 12,
        icon: PendingActions,
        color: 'bg-orange-500',
        change: '-5',
        changeType: 'positive' as const,
      },
      {
        title: 'Course Materials',
        value: 28,
        icon: FolderOpen,
        color: 'bg-purple-500',
        change: '+4',
        changeType: 'positive' as const,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Staff Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-blue-100">
              Manage your classes, students, and academic materials
            </p>
          </motion.div>
        </div>

        {/* Staff Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Staff Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/grade-entry')}
                className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-blue-900">Enter Grades</div>
                <div className="text-sm text-blue-600">Submit student grades and assessments</div>
              </button>
              <button 
                onClick={() => navigate('/course-materials')}
                className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="font-medium text-green-900">Upload Course Materials</div>
                <div className="text-sm text-green-600">Share syllabi and lecture notes</div>
              </button>
              <button 
                onClick={() => navigate('/class-reports')}
                className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium text-purple-900">Generate Class Report</div>
                <div className="text-sm text-purple-600">Create performance analytics</div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.slice(0, 4).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* My Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">My Classes This Semester</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: 'CSC301', name: 'Data Structures', students: 45, level: '300' },
              { code: 'CSC401', name: 'Software Engineering', students: 38, level: '400' },
              { code: 'CSC501', name: 'Advanced Algorithms', students: 22, level: '500' }
            ].map((course, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900">{course.code}</h4>
                <p className="text-sm text-gray-600 mb-2">{course.name}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{course.students} students</span>
                  <span>{course.level} Level</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard (existing implementation with real data)
  const adminStats = [
    {
      title: 'Total Students',
      value: stats.totalStudents || 0,
      icon: GraduationCap,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Staff',
      value: stats.totalStaff || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Files',
      value: stats.totalFiles || 0,
      icon: FolderOpen,
      color: 'bg-orange-500',
      change: '+25%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Reports',
      value: stats.totalReports || 0,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold mb-2">University Administration Dashboard</h1>
          <p className="text-purple-100">
            Complete overview and management of the University Records Management System
          </p>
        </motion.div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions for Admin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/personnel/students')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Manage Students</span>
          </button>
          
          <button 
            onClick={() => navigate('/personnel/staff')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Manage Staff</span>
          </button>
          
          <button 
            onClick={() => navigate('/reports')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">View Reports</span>
          </button>
          
          <button 
            onClick={() => navigate('/files')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <FolderOpen className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">File System</span>
          </button>
        </div>
      </motion.div>

      {/* Management Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="font-medium text-gray-900">{usersLoading ? '...' : users.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Students</span>
              <span className="font-medium text-gray-900">{stats.activeStudents || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Staff</span>
              <span className="font-medium text-gray-900">{stats.activeStaff || 0}</span>
            </div>
            <button 
              onClick={() => navigate('/users')}
              className="w-full mt-3 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Manage Users
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Reports Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Reports</span>
              <span className="font-medium text-gray-900">{stats.totalReports || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Reports</span>
              <span className="font-medium text-gray-900">{stats.pendingReports || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-medium text-gray-900">{Math.floor((stats.totalReports || 0) * 0.3)}</span>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full mt-3 px-3 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              View Reports
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <FolderOpen className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">File System</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Files</span>
              <span className="font-medium text-gray-900">{stats.totalFiles || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recent Uploads</span>
              <span className="font-medium text-gray-900">{stats.recentUploads || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="font-medium text-gray-900">{stats.recentUploads || 0}</span>
            </div>
            <button 
              onClick={() => navigate('/files')}
              className="w-full mt-3 px-3 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Manage Files
            </button>
          </div>
        </motion.div>
      </div>

      {/* Faculty Statistics and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Faculty Statistics</h3>
          </div>
          <FacultyChart data={facultyStats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.slice(0, 6).map((activity: any, index: number) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    By {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.type === 'student' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'staff' ? 'bg-green-100 text-green-800' :
                  activity.type === 'file' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {activity.type}
                </span>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Student and Staff Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Student Status Distribution</h3>
          </div>
          <StatusChart data={studentStatusStats} title="Student Status" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <UserCheck className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Staff Type Distribution</h3>
          </div>
          <StatusChart data={staffTypeStats} title="Staff Types" />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;