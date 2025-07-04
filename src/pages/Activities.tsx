import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Calendar, 
  Award,
  Building,
  Clock
} from 'lucide-react';
import { staffAPI } from '../api/staff';
import toast from 'react-hot-toast';

const Activities: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Fetch real staff data for activities
  const { data: staffData, isLoading } = useQuery('staff-activities', () => staffAPI.getAll({ limit: 100 }));
  const staff = staffData?.staff || [];

  const activities = [
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Register new staff members',
      icon: UserPlus,
      color: 'bg-blue-500',
      count: staff.length,
      action: () => navigate('/personnel/staff'),
      actionText: 'Add New'
    },
    {
      id: 'view-employee',
      title: 'View Employees',
      description: 'Browse staff directory',
      icon: Users,
      color: 'bg-green-500',
      count: staff.filter(s => s.employmentInfo?.currentStatus === 'active').length,
      action: () => navigate('/personnel/staff'),
      actionText: 'View All'
    },
    {
      id: 'confirm-employee',
      title: 'Confirm Employee',
      description: 'Confirm staff appointments',
      icon: UserCheck,
      color: 'bg-purple-500',
      count: staff.filter(s => s.employmentInfo?.currentStatus === 'active').length,
      action: () => navigate('/personnel/staff'),
      actionText: 'Review'
    },
    {
      id: 'promote-employee',
      title: 'Promote Employee',
      description: 'Process staff promotions',
      icon: TrendingUp,
      color: 'bg-orange-500',
      count: staff.filter(s => s.promotions && s.promotions.length > 0).length,
      action: () => navigate('/personnel/staff'),
      actionText: 'Process'
    },
    {
      id: 'grant-leave',
      title: 'Grant Leave',
      description: 'Manage leave applications',
      icon: Calendar,
      color: 'bg-red-500',
      count: staff.filter(s => s.leaveRecords && s.leaveRecords.some(l => l.status === 'pending')).length,
      action: () => navigate('/personnel/staff'),
      actionText: 'Review'
    },
    {
      id: 'deploy-employee',
      title: 'Deploy Employee',
      description: 'Reassign staff to departments',
      icon: Building,
      color: 'bg-indigo-500',
      count: staff.filter(s => s.deployments && s.deployments.length > 0).length,
      action: () => navigate('/personnel/staff'),
      actionText: 'Deploy'
    }
  ];

  // Generate recent activities from real data
  const recentActivities = [
    ...staff.slice(0, 2).map((member, index) => ({
      id: `staff-${index}`,
      type: 'staff',
      description: `${member.firstName} ${member.lastName} - ${member.employmentInfo?.position}`,
      timestamp: new Date(member.createdAt).toLocaleDateString(),
      status: member.employmentInfo?.currentStatus || 'active'
    })),
    ...staff.filter(s => s.promotions && s.promotions.length > 0).slice(0, 2).map((member, index) => ({
      id: `promotion-${index}`,
      type: 'promotion',
      description: `${member.firstName} ${member.lastName} promoted to ${member.employmentInfo?.rank}`,
      timestamp: member.promotions?.[member.promotions.length - 1]?.effectiveDate ? 
        new Date(member.promotions[member.promotions.length - 1].effectiveDate).toLocaleDateString() : 
        'Recent',
      status: 'completed'
    }))
  ];

  const handleActivityClick = (activity: any) => {
    if (activity.action) {
      activity.action();
    } else {
      toast.info(`${activity.title} functionality coming soon!`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Activities</h1>
          <p className="text-gray-600">
            Manage employee lifecycle activities including hiring, promotions, deployments, and leave management
          </p>
        </motion.div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleActivityClick(activity)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${activity.color} rounded-lg p-3`}>
                <activity.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{activity.count}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activity.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {activity.description}
            </p>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleActivityClick(activity);
              }}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {activity.actionText}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-6">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        
        <div className="space-y-4">
          {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timestamp}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                activity.status === 'active' ? 'bg-blue-100 text-blue-800' :
                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.status}
              </span>
            </motion.div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activities found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/personnel/staff')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <UserPlus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Add Staff</span>
          </button>
          
          <button 
            onClick={() => navigate('/personnel/staff')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Process Leave</span>
          </button>
          
          <button 
            onClick={() => navigate('/personnel/staff')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Award className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Promote Staff</span>
          </button>
          
          <button 
            onClick={() => navigate('/personnel/staff')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Building className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Deploy Staff</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Activities;