import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { documentsAPI } from '../api/documents';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Documents: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery('documents', documentsAPI.getAll);

  const uploadMutation = useMutation(documentsAPI.upload, {
    onSuccess: () => {
      queryClient.invalidateQueries('documents');
      toast.success('Document uploaded successfully');
      setFile(null);
    },
    onError: () => {
      toast.error('Failed to upload document');
    },
  });

  const deleteMutation = useMutation(documentsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('documents');
      toast.success('Document deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete document');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      uploadMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Documents</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <input type="file" onChange={handleFileChange} className="border p-2 rounded-lg" />
          <button onClick={handleUpload} disabled={!file || uploadMutation.isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">
            <Upload className="h-4 w-4 mr-2 inline" />
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading documents...</p>
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
                <button onClick={() => deleteMutation.mutate(doc._id)} className="text-red-600"><Trash2 /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;