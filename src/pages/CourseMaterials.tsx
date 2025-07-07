import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Upload, Download, Eye, FolderOpen, FileText, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { documentsAPI } from '../api/documents';
import { dashboardAPI } from '../api/dashboard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CourseMaterials: React.FC = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch staff dashboard data to get classes
  const {
    data: staffData,
    isLoading: staffLoading
  } = useQuery(['staffDashboardStats'], dashboardAPI.getStaffStats, {
    enabled: user?.role === 'staff',
    retry: 1,
    refetchOnWindowFocus: false
  });

  const classes = staffData?.myClasses || [];

  // Automatically select default class
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].courseCode);
    }
  }, [classes, selectedClass]);

  // Fetch documents/materials
  const { data: documentsData, isLoading: documentsLoading } = useQuery(
    ['courseMaterials', selectedClass, selectedCategory],
    () =>
      documentsAPI.getAll({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 50
      }),
    {
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const materials = documentsData?.documents || [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('category', selectedCategory);
    formData.append('course', selectedClass);

    try {
      await documentsAPI.create(formData);
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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

  if (staffLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Materials</h1>
            <p className="text-gray-600">Upload and manage course materials for your classes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 sm:mt-0"
          >
            <label
              htmlFor="file-upload"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Material
              <input id="file-upload" type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </motion.div>
        </div>
      </div>

      {/* Upload Feedback */}
      {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="syllabus">Syllabus</option>
              <option value="lecture-notes">Lecture Notes</option>
              <option value="assignments">Assignments</option>
              <option value="lab-exercises">Lab Exercises</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Materials */}
      {documentsLoading ? (
        <LoadingSpinner />
      ) : materials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No course materials found</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first course material to get started</p>
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
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <FileIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{material.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {material.fileType?.toUpperCase()} • {formatFileSize(material.fileSize)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {material.category}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p>
                    <strong>Uploaded:</strong> {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>By:</strong>{' '}
                    {material.uploadedBy?.profile?.firstName} {material.uploadedBy?.profile?.lastName}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button className="flex items-center text-xs text-blue-600 hover:text-blue-700">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </button>
                  <button className="flex items-center text-xs text-green-600 hover:text-green-700">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
