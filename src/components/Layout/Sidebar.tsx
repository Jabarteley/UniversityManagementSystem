import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  UserCheck,
  FileText,
  BarChart3,
  FolderOpen,
  Activity,
  BookOpen,
  X,
  School,
  Upload,
  Download,
  User,
  Award,
  Calendar,
  Building
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Student Navigation Items
  const studentNavItems = [
    {
      name: 'My Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Results',
      href: '/results',
      icon: Award,
    },
    {
      name: 'My Records',
      href: '/my-records',
      icon: BookOpen,
    },
    {
      name: 'My Documents',
      href: '/my-documents',
      icon: FolderOpen,
    },
    {
      name: 'Upload Documents',
      href: '/upload-documents',
      icon: Upload,
    },
    {
      name: 'My Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Course Registration',
      href: '/course-registration',
      icon: BookOpen,
    },
  ];

  // Staff Navigation Items
  const staffNavItems = [
    {
      name: 'Staff Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Students',
      href: '/my-students',
      icon: GraduationCap,
    },
    {
      name: 'Class Management',
      href: '/class-management',
      icon: BookOpen,
    },
    {
      name: 'Grade Entry',
      href: '/grade-entry',
      icon: Award,
    },
    {
      name: 'Course Materials',
      href: '/course-materials',
      icon: FolderOpen,
    },
    {
      name: 'Class Reports',
      href: '/class-reports',
      icon: BarChart3,
    },
    {
      name: 'My Profile',
      href: '/profile',
      icon: User,
    },
  ];

  // Admin Navigation Items
  const adminNavItems = [
    {
      name: 'Admin Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Personnel',
      icon: Users,
      children: [
        {
          name: 'Students',
          href: '/personnel/students',
          icon: GraduationCap,
        },
        {
          name: 'Staff',
          href: '/personnel/staff',
          icon: UserCheck,
        }
      ]
    },
    {
      name: 'Activities',
      href: '/activities',
      icon: Activity,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: 'Records',
      href: '/records',
      icon: BookOpen,
    },
    {
      name: 'Documents',
      href: '/files',
      icon: FolderOpen,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
    },
    {
      name: 'My Profile',
      href: '/profile',
      icon: User,
    },
  ];

  // Get navigation items based on user role
  const getNavigationItems = () => {
    switch (user?.role) {
      case 'student':
        return studentNavItems;
      case 'staff':
        return staffNavItems;
      case 'admin':
      case 'system-admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      }
    }
  };

  const getSystemTitle = () => {
    switch (user?.role) {
      case 'student':
        return 'Student Portal';
      case 'staff':
        return 'Staff Portal';
      case 'admin':
      case 'system-admin':
        return 'Admin Portal';
      default:
        return 'URMS';
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                user?.role === 'student' ? 'bg-green-600' :
                user?.role === 'staff' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                <p className="text-sm text-gray-500">{getSystemTitle()}</p>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={({ isActive }) =>
                              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`
                            }
                          >
                            <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? `${user?.role === 'student' ? 'bg-green-50 text-green-700 border-r-2 border-green-700' :
                               user?.role === 'staff' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' :
                               'bg-purple-50 text-purple-700 border-r-2 border-purple-700'}`
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-3 ${
                    user?.role === 'student' ? 'bg-green-600' :
                    user?.role === 'staff' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    <School className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">URMS</h1>
                    <p className="text-xs text-gray-500">{getSystemTitle()}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <div className="space-y-1">
                        <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600">
                          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          {item.name}
                        </div>
                        <div className="ml-6 space-y-1">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.name}
                              to={child.href}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                            >
                              <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.href}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? `${user?.role === 'student' ? 'bg-green-50 text-green-700' :
                                 user?.role === 'staff' ? 'bg-blue-50 text-blue-700' :
                                 'bg-purple-50 text-purple-700'}`
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;