import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Download, FileText, BarChart3, Calendar, Users, Eye, Trash2 } from 'lucide-react';
import { reportsAPI } from '../api/reports';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState('student-academic');

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['reports', filters],
    () => reportsAPI.getAll(filters),
    {
      keepPreviousData: true,
      retry: 1,
      onError: (error: any) => {
        console.error('Reports fetch error:', error);
        toast.error('Failed to load reports');
      }
    }
  );

  const generateReportMutation = useMutation(
    (reportData: any) => {
      if (reportData.type === 'student-academic') {
        return reportsAPI.generateStudentReport(reportData);
      } else {
        return reportsAPI.generateStaffReport(reportData);
      }
    },
    {
      onSuccess: () => {
        toast.success('Report generated successfully');
        queryClient.invalidateQueries('reports');
        setShowGenerateModal(false);
      },
      onError: (error: any) => {
        toast.error('Failed to generate report');
        console.error('Generate report error:', error);
      }
    }
  );

  const deleteReportMutation = useMutation(
    (reportId: string) => reportsAPI.delete(reportId),
    {
      onSuccess: () => {
        toast.success('Report deleted successfully');
        queryClient.invalidateQueries('reports');
      },
      onError: () => {
        toast.error('Failed to delete report');
      }
    }
  );

  const handleGenerateReport = () => {
    const reportData = {
      title: `${reportType === 'student-academic' ? 'Student Academic' : 'Staff Administrative'} Report - ${new Date().toLocaleDateString()}`,
      type: reportType,
      description: `Generated ${reportType} report`,
      parameters: {
        dateRange: {
          startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
          endDate: new Date().toISOString()
        },
        faculty: '',
        department: ''
      },
      format: 'pdf',
      accessLevel: 'restricted'
    };

    generateReportMutation.mutate(reportData);
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteReportMutation.mutate(reportId);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'student-academic':
        return 'bg-blue-100 text-blue-800';
      case 'staff-administrative':
        return 'bg-green-100 text-green-800';
      case 'staff-academic':
        return 'bg-purple-100 text-purple-800';
      case 'departmental':
        return 'bg-orange-100 text-orange-800';
      case 'financial':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <p className="text-red-500">Error loading reports</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const reports = data?.reports || [];

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports Management</h1>
            <p className="text-gray-600">Generate, view, and manage academic and administrative reports</p>
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
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </motion.div>
        </div>
      </div>

      {/* Report Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {reports.filter((r: any) => r.type === 'student-academic').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Reports</h3>
          <p className="text-gray-600 text-sm">Academic performance and enrollment reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 rounded-lg p-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {reports.filter((r: any) => r.type === 'staff-administrative').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Reports</h3>
          <p className="text-gray-600 text-sm">Administrative and academic staff reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 rounded-lg p-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {reports.filter((r: any) => r.type === 'departmental').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Departmental</h3>
          <p className="text-gray-600 text-sm">Department-wise analysis and statistics</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {reports.filter((r: any) => r.type === 'custom').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
          <p className="text-gray-600 text-sm">Custom generated reports and analytics</p>
        </div>
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
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Types</option>
              <option value="student-academic">Student Academic</option>
              <option value="staff-administrative">Staff Administrative</option>
              <option value="staff-academic">Staff Academic</option>
              <option value="departmental">Departmental</option>
              <option value="financial">Financial</option>
            </select>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="generating">Generating</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No reports found</p>
          <p className="text-gray-400 text-sm mt-2">
            Generate your first report to get started
          </p>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Report
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any, index: number) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  {report.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {report.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                    {report.type.replace('-', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-500">Generated by:</span>
                  <p className="font-medium text-gray-900">
                    {report.generatedBy?.profile?.firstName} {report.generatedBy?.profile?.lastName}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Format:</span>
                  <p className="font-medium text-gray-900 uppercase">
                    {report.format}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Access Level:</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {report.accessLevel}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium text-gray-900">
                    {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {format(new Date(report.updatedAt), 'MMM d, yyyy h:mm a')}
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex items-center px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  <button 
                    onClick={() => handleDeleteReport(report._id)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate New Report</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="student-academic">Student Academic Report</option>
                <option value="staff-administrative">Staff Administrative Report</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generateReportMutation.isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;