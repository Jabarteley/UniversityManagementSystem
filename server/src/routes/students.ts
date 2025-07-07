import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';

import User from '../models/User.js';

const router = express.Router();

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const faculty = req.query.faculty as string;
    const department = req.query.department as string;
    const level = req.query.level as string;
    const status = req.query.status as string;

    const query: any = { isActive: { $ne: false } };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (faculty) query['academicInfo.faculty'] = faculty;
    if (department) query['academicInfo.department'] = department;
    if (level) query['academicInfo.level'] = level;
    if (status) query['academicInfo.status'] = status;

    console.log('Student query:', query);
    const students = await Student.find(query)
      .populate('userId', 'profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);
    console.log('Found students:', students);
    console.log('Total students (countDocuments):', total);

    res.json({
      success: true,
      students,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by registration number (for result portal)
router.get('/registration/:regNumber', async (req, res) => {
  try {
    const { regNumber } = req.params;

    const student = await Student.findOne({ 
      registrationNumber: regNumber,
      isActive: true 
    }).select('registrationNumber firstName lastName academicInfo results');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error('Get student by registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single student
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students by staff
router.get('/staff/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching students for staff userId:', userId);
    const staff = await Staff.findOne({ userId });
    if (!staff) {
      console.log('Staff not found for userId:', userId);
      return res.status(404).json({ message: 'Staff not found' });
    }
    console.log('Found staff:', staff._id);

    const teachingCourseCodes = staff.teachingLoad?.courses.map(course => course.courseCode) || [];
    console.log('Staff teaching course codes:', teachingCourseCodes);

    const students = await Student.find({
      'academicInfo.courses.courseCode': { $in: teachingCourseCodes }
    }).populate('userId', 'profile');

    console.log(`Found ${students.length} students for staff ${userId}`);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students by staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/class/:courseCode', auth, async (req, res) => {
  try {
    const { courseCode } = req.params;
    const students = await Student.find({ 'results.courses.courseCode': courseCode });
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create student
router.post('/', auth, authorize('admin', 'staff'), [
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('profile.firstName').notEmpty().withMessage('First name is required'),
  body('profile.lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('academicInfo.faculty').notEmpty().withMessage('Faculty is required'),
  body('academicInfo.department').notEmpty().withMessage('Department is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, profile, ...studentData } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for new user creation.' });
    }

    let user;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      user = existingUser;
    } else {
      let username = email.split('@')[0];
      if (username.length < 3) {
        username = (username + '___').substring(0, 3); // Ensure min length of 3
      }
      user = new User({
        email,
        password,
        username,
        role: 'student',
        profile
      });
      await user.save();
    }

    const student = await Student.create({ ...studentData, userId: user._id });

    res.status(201).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    

    const student = await Student.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student academic records and summary
router.get('/:id/academic-records', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure the logged-in user is the student themselves or an admin/staff
    if (req.user?.role === 'student' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = student.results.map(result => ({
      type: `Semester ${result.semester} Results`,
      semester: result.semester,
      year: result.year,
      status: 'Available',
      lastUpdated: student.updatedAt,
      description: `Academic results for Semester ${result.semester}, ${result.year}`,
      gpa: result.gpa,
      cgpa: result.cgpa,
      courses: result.courses
    }));

    const academicSummary = {
      currentCGPA: student.results.length > 0 ? student.results[student.results.length - 1].cgpa : 0,
      completedCourses: student.results.reduce((sum, result) => sum + result.courses.length, 0),
      currentLevel: student.academicInfo.level,
    };

    res.json({ success: true, records, summary: academicSummary });
  } catch (error) {
    console.error('Get student academic records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add result to student
router.post('/:id/results', auth, authorize('admin', 'staff'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const resultData = req.body;

    

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.results.push(resultData);
    await student.save();

    res.json({ success: true, student });
  } catch (error) {
    console.error('Add result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    

    const student = await Student.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;