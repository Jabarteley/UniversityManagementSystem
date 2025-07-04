import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Eye, FolderOpen, FileText, Plus, Search } from 'lucide-react';

const CourseMaterials: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('CSC301');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const classes = [
    { code: 'CSC301', name: 'Data Structures' },
    { code: 'CSC401', name: 'Software Engineering' },
    { code: 'CSC501', name: 'Advanced Algorithms' }
  ];

  const materials = [
    {
      id: 1,
      name: 'Course Syllabus - Spring 2024',
      category: 'syllabus',
      class: 'CSC301',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      downloads: 45
    },
    {
      id: 2,
      name: 'Lecture 1 - Introduction to Data Structures',
      category: 'lecture',
      class: 'CSC301',
      type: 'PDF',
      size: '5.2 MB',
      uploadDate: '2024-01-20',
      downloads: 42
    },
    {
      id: 3,
      name: 'Assignment 1 - Arrays and Linked Lists',
      category: 'assignment',
      class: 'CSC301',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-01-25',
      downloads: 38
    },
    {
      id: 4,
      name: 'Lab Exercise 1 - Implementation Practice',
      category: 'lab',
      class: 'CSC301',
      type: 'ZIP',
      size: '3.2 MB',
      uploadDate: '2024-01-30',
      downloads: 35
    }
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesClass = material.class === selectedClass;
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesClass && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'syllabus':
        return 'bg-blue-100 text-blue-800';
      case 'lecture':
        return 'bg-green-100 text-green-800';
      case 'assignment':
        return 'bg-purple-100 text-purple-800';
      case 'lab':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              {classes.map(cls => (
                <option key={cls.code} value={cls.code}>
                  {cls.code} - {cls.name}
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
              <option value="syllabus">Syllabus</option>
              <option value="lecture">Lecture Notes</option>
              <option value="assignment">Assignments</option>
              <option value="lab">Lab Exercises</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material, index) => {
          const FileIcon = getFileIcon(material.type);
          return (
            <motion.div
              key={material.id}
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
                      {material.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {material.type} • {material.size}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
                  {material.category}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center justify-between">
                  <span>Uploaded:</span>
                  <span className="font-medium text-gray-900">{material.uploadDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Downloads:</span>
                  <span className="font-medium text-gray-900">{material.downloads}</span>
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
            { name: 'Syllabus', count: 3, color: 'bg-blue-50 border-blue-200' },
            { name: 'Lecture Notes', count: 12, color: 'bg-green-50 border-green-200' },
            { name: 'Assignments', count: 8, color: 'bg-purple-50 border-purple-200' },
            { name: 'Lab Exercises', count: 6, color: 'bg-orange-50 border-orange-200' }
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