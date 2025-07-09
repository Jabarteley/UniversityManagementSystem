import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { documentsAPI } from '../api/documents';
import toast from 'react-hot-toast';

const UploadDocuments: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('academic');
  const [accessLevel, setAccessLevel] = useState('restricted');
  const queryClient = useQueryClient();

  const uploadMutation = useMutation(documentsAPI.upload,
    {
      onSuccess: () => {
        toast.success(`Successfully uploaded ${title}`);
        setSelectedFile(null);
        setTitle('');
        setCategory('academic');
        setAccessLevel('restricted');
        queryClient.invalidateQueries('documents');
      },
      onError: (error: any) => {
        toast.error(`Failed to upload document: ${error.message}`);
      },
    }
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setTitle(event.target.files[0].name.split('.')[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('accessLevel', accessLevel);
      uploadMutation.mutate(formData);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">
            Submit required documents with proper metadata tagging
          </p>
        </motion.div>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop file here or click to browse
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
          </p>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </label>
        </div>

        {selectedFile && (
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700">Access Level</label>
              <select
                id="accessLevel"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="confidential">Confidential</option>
                <option value="classified">Classified</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center flex-1">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isLoading || !selectedFile || !title}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadDocuments;