import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Upload, Download, Eye, FolderOpen, FileText, Plus, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { documentsAPI } from '../api/documents';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CourseMaterials: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch staff dashboard data to get classes
  const { data: staffData, isLoading: staffLoading } = useQuery(
    'staffDashboardStats',
    () => fetch('/api/dashboard/staff-stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json()),
    {
      enabled: user?.role === 'staff',
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Fetch documents/materials
  const { data: documentsData, isLoading: documentsLoading } = useQuery(
    ['courseMaterials', selectedClass, selectedCategory],
    () => documentsAPI.getAll({ 
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 50 
    }),
    {
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  if (staffLoading) return <LoadingSpinner />;

  const classes = staffData?.myClasses || [];
  const materials = documentsData?.documents || [];

  // Set default class if not selected
  React.useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].courseCode);
    }
  }, [classes, selectedClass]);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return FileText;
      case 'zip':
        return FolderOpen;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Materials</h1>
            <p className="text-gray-600">Upload and manage course materials for your classes</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 sm:mt-0"
          >
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Upload Material
            </button>
          </motion.div>
        </div>
      </div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Upload Course Materials</p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here or click to browse
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Choose Files
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
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
              <option value="">All Classes</option>
              {classes.map((cls: any) => (
                <option key={cls.courseCode} value={cls.courseCode}>
                  {cls.courseCode} - {cls.courseName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">Syllabus</option>
              <option value="academic">Lecture Notes</option>
              <option value="academic">Assignments</option>
              <option value="academic">Lab Exercises</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Materials Grid */}
      {documentsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No course materials found</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload your first course material to get started
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material: any, index: number) => {
            const FileIcon = getFileIcon(material.fileType);
            return (
              <motion.div
                key={material._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <FileIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {material.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {material.fileType?.toUpperCase()} • {formatFileSize(material.fileSize)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {material.category}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>By:</span>
                    <span className="font-medium text-gray-900">
                      {material.uploadedBy?.profile?.firstName} {material.uploadedBy?.profile?.lastName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button className="flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </button>
                  <div className="flex space-x-2">
                    <button className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Material Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Categories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Syllabus', count: materials.filter(m => m.title?.toLowerCase().includes('syllabus')).length, color: 'bg-blue-50 border-blue-200' },
            { name: 'Lecture Notes', count: materials.filter(m => m.title?.toLowerCase().includes('lecture')).length, color: 'bg-green-50 border-green-200' },
            { name: 'Assignments', count: materials.filter(m => m.title?.toLowerCase().includes('assignment')).length, color: 'bg-purple-50 border-purple-200' },
            { name: 'Lab Exercises', count: materials.filter(m => m.title?.toLowerCase().includes('lab')).length, color: 'bg-orange-50 border-orange-200' }
          ].map((category, index) => (
            <div key={category.name} className={`p-4 border rounded-lg ${category.color}`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                <div className="text-sm text-gray-600">{category.name}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CourseMaterials;