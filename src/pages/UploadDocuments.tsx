import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

const UploadDocuments: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    for (const file of selectedFiles) {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
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
            Drop files here or click to browse
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </label>
        </div>
      </motion.div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Selected Files ({selectedFiles.length})</h3>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload All
            </button>
          </div>
          
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    
                    {/* Upload Progress */}
                    {uploadStatus[file.name] === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[file.name] || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploading... {uploadProgress[file.name] || 0}%
                        </p>
                      </div>
                    )}
                    
                    {/* Upload Success */}
                    {uploadStatus[file.name] === 'success' && (
                      <div className="flex items-center mt-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <p className="text-xs text-green-600">Upload successful</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadStatus[file.name] === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Document Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Document Categories</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-900 mb-2">Academic Submissions</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Assignment submissions</li>
                <li>• Project reports</li>
                <li>• Thesis drafts</li>
                <li>• Research papers</li>
              </ul>
            </div>
            
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Administrative Forms</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Course registration</li>
                <li>• Leave applications</li>
                <li>• Change of program</li>
                <li>• Transcript requests</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-900 mb-2">Personal Documents</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Medical certificates</li>
                <li>• Identity documents</li>
                <li>• Financial aid forms</li>
                <li>• Emergency contact updates</li>
              </ul>
            </div>
            
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-medium text-orange-900 mb-2">Internship & Career</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Internship reports</li>
                <li>• Job placement forms</li>
                <li>• Industry training certificates</li>
                <li>• Career counseling requests</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Upload Guidelines</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">File Requirements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Maximum file size: 10MB</li>
              <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
              <li>• Clear, readable documents only</li>
              <li>• Proper file naming recommended</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Processing Time</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Academic submissions: 3-5 business days</li>
              <li>• Administrative forms: 1-2 business days</li>
              <li>• Personal documents: 2-3 business days</li>
              <li>• Urgent requests: Contact registry office</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadDocuments;