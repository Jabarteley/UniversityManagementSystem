import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { BarChart3, Download, Eye, Plus, Calendar } from 'lucide-react';
import axios from 'axios';

import { filtersAPI } from '../api/filters';
import { reportsAPI } from '../api/reports';

const reportTypes = [
  { id: 'performance', name: 'Class Performance', description: 'Grade distribution and statistics' },
  { id: 'attendance', name: 'Attendance Report', description: 'Student attendance patterns' },
  { id: 'progress', name: 'Progress Tracking', description: 'Individual student progress' },
  { id: 'assignment', name: 'Assignment Analysis', description: 'Assignment submission and scores' }
];

const ClassReports: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('performance');

  const { data: classes = [], isLoading: classesLoading } = useQuery('classes', fetchClasses);
  const { data: recentReports = [], isLoading: reportsLoading } = useQuery('recentReports', fetchRecentReports);
  const {
    data: performanceData,
    isLoading: perfLoading,
  } = useQuery(['performanceData', selectedClass], () => fetchPerformanceData(selectedClass), {
    enabled: !!selectedClass && selectedReportType === 'performance',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Class Reports</h1>
            <p className="text-gray-600">Generate and view reports for your classes</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-4 sm:mt-0">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </motion.div>
        </div>
      </div>

      {/* Report Generation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="" disabled>Select Class</option>
              {classes.map((cls: any) => (
                <option key={cls.code} value={cls.code}>
                  {cls.code} - {cls.name} ({cls.students} students)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg mb-4 text-sm text-blue-700">
          {reportTypes.find((t) => t.id === selectedReportType)?.description}
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </motion.div>

      {/* Performance Report */}
      {selectedReportType === 'performance' && performanceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Class Performance Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Class Average" value={`${performanceData.classAverage}%`} color="blue" />
            <StatCard label="Highest Score" value={`${performanceData.highestScore}%`} color="green" />
            <StatCard label="Lowest Score" value={`${performanceData.lowestScore}%`} color="orange" />
            <StatCard label="Pass Rate" value={`${performanceData.passRate}%`} color="purple" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Grade Distribution</h4>
            <div className="space-y-2">
              {performanceData.gradeDistribution.map((grade: any) => (
                <div key={grade.grade} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-700">Grade {grade.grade}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          grade.grade === 'A' ? 'bg-green-500' :
                          grade.grade === 'B' ? 'bg-blue-500' :
                          grade.grade === 'C' ? 'bg-yellow-500' :
                          grade.grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${grade.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {grade.count} ({grade.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
        </div>
        {reportsLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report: any, index: number) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.class}</span>
                    <span>•</span>
                    <span>{report.generatedDate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {report.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className={`text-center p-4 bg-${color}-50 rounded-lg`}>
    <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
    <div className={`text-sm text-${color}-700`}>{label}</div>
  </div>
);

export default ClassReports;
