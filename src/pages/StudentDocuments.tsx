import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { Upload, Download, Eye, FolderOpen, FileText, Image, CheckCircle } from 'lucide-react';
import { documentsAPI } from '../api/documents';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const StudentDocuments: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { user } = useAuth();
  const { data, isLoading, error } = useQuery(
    ['studentDocuments', selectedCategory, user?.id],
    () => documentsAPI.getByStudent(user?.id || '', {
      category: selectedCategory === 'all' ? undefined : selectedCategory as any,
    }),
    {
      enabled: !!user?.id,
      keepPreviousData: true,
    }
  );

  const documents = data?.documents || [];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-500">Error loading documents.</div>;

  const filteredDocuments = documents;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return FileText;
      case 'docx':
      case 'doc':
        return FileText;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return Image;
      default:
        return FileText;
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Documents</h1>
          <p className="text-gray-600">
            Manage your personal documents and submissions
          </p>
        </motion.div>
      </div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-4">
          <Upload className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Upload New Document</h3>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Choose Files
          </button>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Documents ({documents.length})
          </button>
          <button
            onClick={() => setSelectedCategory('academic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'academic'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Academic ({documents.filter(d => d.category === 'academic').length})
          </button>
          <button
            onClick={() => setSelectedCategory('personal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'personal'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Personal ({documents.filter(d => d.category === 'personal').length})
          </button>
        </div>
      </motion.div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document, index) => {
          const FileIcon = getFileIcon(document.type);
          return (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <FileIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {document.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {document.type} • {document.size}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                  {document.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-medium text-gray-900 capitalize">{document.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uploaded:</span>
                  <span className="font-medium text-gray-900">{document.uploadDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </button>
                <div className="flex space-x-2">
                  <button className="flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upload Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Document Upload Guidelines</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Academic Documents</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Course registration forms</li>
              <li>• Assignment submissions</li>
              <li>• Thesis and project reports</li>
              <li>• Internship documentation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Personal Documents</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Medical certificates</li>
              <li>• Leave applications</li>
              <li>• Identity documents</li>
              <li>• Financial aid forms</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDocuments;