import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Upload, Download, FolderOpen, FileText, Image, Video, Eye, Trash2 } from 'lucide-react';
import { documentsAPI } from '../api/documents';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Files: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    accessLevel: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['files', filters],
    () => documentsAPI.getAll(filters),
    {
      keepPreviousData: true,
      retry: 1,
      onError: (error: any) => {
        console.error('Files fetch error:', error);
        toast.error('Failed to load files');
      }
    }
  );

  const uploadMutation = useMutation(
    (formData: FormData) => documentsAPI.upload(formData),
    {
      onSuccess: () => {
        toast.success('File uploaded successfully');
        queryClient.invalidateQueries('files');
        setShowUploadModal(false);
        setSelectedFiles(null);
      },
      onError: (error: any) => {
        toast.error('Failed to upload file');
        console.error('Upload error:', error);
      }
    }
  );

  const deleteMutation = useMutation(
    (fileId: string) => documentsAPI.delete(fileId),
    {
      onSuccess: () => {
        toast.success('File deleted successfully');
        queryClient.invalidateQueries('files');
      },
      onError: () => {
        toast.error('Failed to delete file');
      }
    }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFiles[0]);
    formData.append('category', 'other');
    formData.append('accessLevel', 'restricted');
    formData.append('description', 'Uploaded file');
    formData.append('title', selectedFiles[0].name.split('.')[0]);

    uploadMutation.mutate(formData);
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return Image;
    if (fileType.includes('video')) return Video;
    return FileText;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'administrative':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-orange-100 text-orange-800';
      case 'report':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'restricted':
        return 'bg-yellow-100 text-yellow-800';
      case 'confidential':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading files</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const files = data?.files || [];

  // Calculate category counts from actual data
  const categoryCounts = {
    academic: files.filter((f: any) => f.category === 'academic').length,
    administrative: files.filter((f: any) => f.category === 'administrative').length,
    student: files.filter((f: any) => f.category === 'student').length,
    staff: files.filter((f: any) => f.category === 'staff').length,
    report: files.filter((f: any) => f.category === 'report').length,
    other: files.filter((f: any) => f.category === 'other').length
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Filing System</h1>
            <p className="text-gray-600">Create, open, save, delete, transfer, and search files with indexing</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 sm:mt-0 flex space-x-3"
          >
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </button>
          </motion.div>
        </div>
      </div>

      {/* File Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          { name: 'Academic', count: categoryCounts.academic, color: 'bg-blue-500' },
          { name: 'Administrative', count: categoryCounts.administrative, color: 'bg-green-500' },
          { name: 'Student', count: categoryCounts.student, color: 'bg-purple-500' },
          { name: 'Staff', count: categoryCounts.staff, color: 'bg-orange-500' },
          { name: 'Reports', count: categoryCounts.report, color: 'bg-red-500' },
          { name: 'Other', count: categoryCounts.other, color: 'bg-gray-500' }
        ].map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setFilters({ ...filters, category: category.name.toLowerCase() })}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${category.color} rounded-lg p-2`}>
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">{category.count}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
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
                placeholder="Search files..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Categories</option>
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="report">Reports</option>
              <option value="other">Other</option>
            </select>
            <select 
              value={filters.accessLevel}
              onChange={(e) => setFilters({ ...filters, accessLevel: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Access Levels</option>
              <option value="public">Public</option>
              <option value="restricted">Restricted</option>
              <option value="confidential">Confidential</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No files found</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload your first file to get started
          </p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload File
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file: any, index: number) => {
            const FileIcon = getFileIcon(file.fileType);
            return (
              <motion.div
                key={file._id}
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
                        {file.originalName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(file.accessLevel)}`}>
                      {file.accessLevel}
                    </span>
                  </div>
                </div>

                {file.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {file.description}
                  </p>
                )}

                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {file.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{file.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Uploaded by:</span>
                    <span className="font-medium text-gray-900">
                      {file.uploadedBy?.profile?.firstName} {file.uploadedBy?.profile?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(file.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <a
                      href={`/api/documents/${file._id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </div>
                  <button 
                    onClick={() => handleDeleteFile(file._id)}
                    className="flex items-center text-xs text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload File</h3>
            
            <div className="mb-4">
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
              />
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  Selected: {selectedFiles[0].name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {formatFileSize(selectedFiles[0].size)}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={!selectedFiles || uploadMutation.isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;