import express from 'express';
import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    logger.debug('Fetching reports with params:', { page, limit, type, status, search });

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query)
      .populate('generatedBy', 'profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    logger.debug(`Found ${reports.length} reports out of ${total} total`);

    res.json({
      success: true,
      reports,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Generate student academic report
router.post('/student-academic', auth, authorize('admin', 'staff'), [
  body('title').notEmpty().withMessage('Report title is required'),
  body('parameters.dateRange.startDate').isISO8601().withMessage('Valid start date is required'),
  body('parameters.dateRange.endDate').isISO8601().withMessage('Valid end date is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate actual report data
    const { parameters } = req.body;
    const query: any = { isActive: { $ne: false } };
    
    if (parameters.faculty) query['academicInfo.faculty'] = parameters.faculty;
    if (parameters.department) query['academicInfo.department'] = parameters.department;
    if (parameters.level) query['academicInfo.level'] = parameters.level;

    const students = await Student.find(query);
    
    // Calculate report data
    const reportData = {
      totalStudents: students.length,
      averageGPA: students.reduce((sum, s) => {
        const latestResult = s.results[s.results.length - 1];
        return sum + (latestResult?.cgpa || 0);
      }, 0) / (students.length || 1),
      facultyBreakdown: await Student.aggregate([
        { $match: query },
        { $group: { _id: '$academicInfo.faculty', count: { $sum: 1 } } }
      ]),
      statusBreakdown: await Student.aggregate([
        { $match: query },
        { $group: { _id: '$academicInfo.status', count: { $sum: 1 } } }
      ])
    };

    const report = await Report.create({
      ...req.body,
      type: 'student-academic',
      generatedBy: req.user?._id,
      data: reportData,
      status: 'completed'
    });

    await report.populate('generatedBy', 'profile');

    logger.success('Student academic report generated:', report.title);

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    logger.error('Generate student report error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Generate staff administrative report
router.post('/staff-administrative', auth, authorize('admin'), [
  body('title').notEmpty().withMessage('Report title is required'),
  body('parameters.dateRange.startDate').isISO8601().withMessage('Valid start date is required'),
  body('parameters.dateRange.endDate').isISO8601().withMessage('Valid end date is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate actual report data
    const { parameters } = req.body;
    const query: any = { isActive: { $ne: false } };
    
    if (parameters.department) query['employmentInfo.department'] = parameters.department;
    if (parameters.employmentType) query['employmentInfo.employmentType'] = parameters.employmentType;

    const staff = await Staff.find(query);
    
    // Calculate report data
    const reportData = {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.employmentInfo?.currentStatus === 'active').length,
      onLeave: staff.filter(s => s.employmentInfo?.currentStatus === 'on-leave').length,
      departmentBreakdown: await Staff.aggregate([
        { $match: query },
        { $group: { _id: '$employmentInfo.department', count: { $sum: 1 } } }
      ]),
      typeBreakdown: await Staff.aggregate([
        { $match: query },
        { $group: { _id: '$employmentInfo.employmentType', count: { $sum: 1 } } }
      ])
    };

    const report = await Report.create({
      ...req.body,
      type: 'staff-administrative',
      generatedBy: req.user?._id,
      data: reportData,
      status: 'completed'
    });

    await report.populate('generatedBy', 'profile');

    logger.success('Staff administrative report generated:', report.title);

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    logger.error('Generate staff report error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get single report
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id).populate('generatedBy', 'profile');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download report
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.filePath) {
      res.download(report.filePath, `${report.title}.${report.format}`);
    } else {
      res.json({ success: true, data: report.data });
    }
  } catch (error) {
    logger.error('Download report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete report
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent class reports
router.get('/class/recent', auth, async (req, res) => {
  try {
    const recentReports = await Report.find({ type: { $in: ['class-performance', 'class-attendance', 'class-progress', 'class-assignment'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type parameters.class generatedDate status');

    res.json(recentReports.map(report => ({
      id: report._id,
      title: report.title,
      type: report.type.replace('class-', '').replace('-', ' '),
      class: report.parameters.class,
      generatedDate: report.createdAt,
      status: report.status
    })));
  } catch (error) {
    logger.error('Get recent class reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get class performance data
router.get('/class/:classCode/performance', auth, async (req, res) => {
  try {
    const { classCode } = req.params;

    // Mock data for now, replace with actual aggregation from student results
    const performanceData = {
      classAverage: 78.5,
      highestScore: 95,
      lowestScore: 45,
      passRate: 93,
      gradeDistribution: [
        { grade: 'A', count: 8, percentage: 18 },
        { grade: 'B', count: 15, percentage: 33 },
        { grade: 'C', count: 12, percentage: 27 },
        { grade: 'D', count: 7, percentage: 16 },
        { grade: 'F', count: 3, percentage: 7 }
      ],
    };

    res.json(performanceData);
  } catch (error) {
    logger.error('Get class performance data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;