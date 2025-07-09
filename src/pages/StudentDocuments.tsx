import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { documentsAPI } from '../api/documents';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { FileText, Download, Eye } from 'lucide-react';

const StudentDocuments: React.FC = () => {
  const { user } = useAuth();
  const { data: documents, isLoading, error } = useQuery(
    ['studentDocuments', user?.id],
    documentsAPI.getAll,
    {
      enabled: !!user?.id,
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-500">Error loading documents.</div>;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Documents</h1>

      {documents?.data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 text-lg">No documents found.</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.data.map((doc: any) => (
            <motion.div key={doc._id} className="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <FileText className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold">{doc.title}</h3>
                <p className="text-sm text-gray-500">{doc.category}</p>
                <p className="text-sm text-gray-500">{(doc.fileSize / 1024).toFixed(2)} KB</p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600"><Eye /></a>
                <a href={doc.cloudinaryUrl} download className="text-green-600"><Download /></a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;