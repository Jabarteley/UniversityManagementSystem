import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { documentsAPI } from '../api/documents';
import { dashboardAPI } from '../api/dashboard';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Upload, FileText, Download, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseMaterials: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('academic');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

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
      documentsAPI.getAll(), // Assuming getAll can filter by category and courseCode on the backend
    {
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const uploadMutation = useMutation(documentsAPI.upload, {
    onSuccess: () => {
      toast.success(`Successfully uploaded ${title}`);
      setSelectedFile(null);
      setTitle('');
      queryClient.invalidateQueries('courseMaterials');
    },
    onError: (error: any) => {
      toast.error(`Failed to upload material: ${error.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setTitle(event.target.files[0].name.split('.')[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && selectedClass && title) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('category', selectedCategory);
      formData.append('relatedToType', 'Course');
      formData.append('relatedToId', selectedClass);
      uploadMutation.mutate(formData);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (staffLoading) return <LoadingSpinner />;

  const materials = documentsData?.data || [];

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
              <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </motion.div>
        </div>
      </div>

      {/* Upload Feedback */}
      {uploadMutation.isLoading && <p className="text-sm text-gray-500">Uploading...</p>}
      {uploadMutation.isError && <p className="text-sm text-red-500">Error uploading file.</p>}

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
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="personal">Personal</option>
              <option value="financial">Financial</option>
              <option value="legal">Legal</option>
              <option value="medical">Medical</option>
              <option value="research">Research</option>
            </select>
          </div>
        </div>
        {selectedFile && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected File Details</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center flex-1">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isLoading || !selectedFile || !title || !selectedClass}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {uploadMutation.isLoading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
          </div>
        )}
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
            const FileIcon = FileText; // Assuming all course materials are documents
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
                  <a href={material.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:text-blue-700">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </a>
                  <a href={material.cloudinaryUrl} download className="flex items-center text-xs text-green-600 hover:text-green-700">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </a>
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