import express from 'express';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import File from '../models/File.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req: AuthRequest, res) => {
  try {
    logger.debug('Fetching dashboard stats for user:', req.user?.email);

    // Get basic counts
    const [
      totalStudents,
      totalStaff,
      totalFiles,
      totalReports,
      totalUsers,
      activeStudents,
      activeStaff
    ] = await Promise.all([
      Student.countDocuments({ isActive: { $ne: false } }),
      Staff.countDocuments({ isActive: { $ne: false } }),
      File.countDocuments({ isArchived: { $ne: true } }),
      Report.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      Student.countDocuments({ 'academicInfo.status': 'active' }),
      Staff.countDocuments({ 'employmentInfo.currentStatus': 'active' })
    ]);

    // Get recent activities from various collections
    const recentActivities = [];

    // Recent student registrations
    const recentStudents = await Student.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('firstName lastName registrationNumber createdAt');

    recentStudents.forEach(student => {
      recentActivities.push({
        _id: student._id,
        type: 'student',
        action: 'registered',
        description: `New student ${student.firstName} ${student.lastName} registered`,
        timestamp: student.createdAt,
        user: `${student.firstName} ${student.lastName}`
      });
    });

    // Recent staff additions
    const recentStaff = await Staff.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('firstName lastName staffId createdAt');

    recentStaff.forEach(staff => {
      recentActivities.push({
        _id: staff._id,
        type: 'staff',
        action: 'added',
        description: `New staff member ${staff.firstName} ${staff.lastName} added`,
        timestamp: staff.createdAt,
        user: `${staff.firstName} ${staff.lastName}`
      });
    });

    // Recent file uploads
    const recentFiles = await File.find({ isArchived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('uploadedBy', 'profile')
      .select('originalName createdAt uploadedBy');

    recentFiles.forEach(file => {
      recentActivities.push({
        _id: file._id,
        type: 'file',
        action: 'uploaded',
        description: `File "${file.originalName}" uploaded`,
        timestamp: file.createdAt,
        user: file.uploadedBy?.profile ? 
          `${file.uploadedBy.profile.firstName} ${file.uploadedBy.profile.lastName}` : 
          'Unknown User'
      });
    });

    // Recent reports
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('generatedBy', 'profile')
      .select('title createdAt generatedBy');

    recentReports.forEach(report => {
      recentActivities.push({
        _id: report._id,
        type: 'report',
        action: 'generated',
        description: `Report "${report.title}" generated`,
        timestamp: report.createdAt,
        user: report.generatedBy?.profile ? 
          `${report.generatedBy.profile.firstName} ${report.generatedBy.profile.lastName}` : 
          'Unknown User'
      });
    });

    // Sort activities by timestamp
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get faculty statistics
    const facultyStats = await Student.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$academicInfo.faculty',
          students: { $sum: 1 }
        }
      },
      { $sort: { students: -1 } }
    ]);

    // Get staff counts by faculty
    const staffByFaculty = await Staff.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$employmentInfo.faculty',
          staff: { $sum: 1 }
        }
      }
    ]);

    // Combine faculty stats
    const combinedFacultyStats = facultyStats.map(faculty => {
      const staffCount = staffByFaculty.find(s => s._id === faculty._id)?.staff || 0;
      return {
        name: faculty._id || 'Unknown',
        students: faculty.students,
        staff: staffCount
      };
    });

    // Get student status distribution
    const studentStatusStats = await Student.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$academicInfo.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get staff type distribution
    const staffTypeStats = await Staff.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$employmentInfo.employmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate additional metrics
    const currentYear = new Date().getFullYear();
    const studentsThisYear = await Student.countDocuments({
      'academicInfo.yearOfAdmission': currentYear,
      isActive: { $ne: false }
    });

    const graduatedThisYear = await Student.countDocuments({
      'academicInfo.status': 'graduated',
      updatedAt: { $gte: new Date(currentYear, 0, 1) }
    });

    const recentUploads = await File.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isArchived: { $ne: true }
    });

    const pendingReports = await Report.countDocuments({ status: 'generating' });

    const stats = {
      totalStudents,
      totalStaff,
      totalFiles,
      totalReports,
      totalUsers,
      activeStudents,
      activeStaff,
      studentsThisYear,
      graduatedThisYear,
      recentUploads,
      pendingReports
    };

    logger.debug('Dashboard stats calculated:', stats);

    res.json({
      success: true,
      stats,
      recentActivities: recentActivities.slice(0, 10), // Limit to 10 most recent
      facultyStats: combinedFacultyStats,
      studentStatusStats,
      staffTypeStats
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;