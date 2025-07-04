import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Demo students data
const getDemoStudents = () => [
  {
    _id: '1',
    registrationNumber: 'UNI/2023/001',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Michael',
    dateOfBirth: '2000-05-15',
    gender: 'male',
    email: 'john.doe@university.edu',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'University City',
      state: 'State',
      zipCode: '12345',
      country: 'Country'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Mother',
      phone: '+1234567891'
    },
    academicInfo: {
      faculty: 'Engineering',
      department: 'Computer Science',
      program: 'Bachelor of Science',
      level: '300',
      yearOfAdmission: 2023,
      currentSemester: 2,
      status: 'active'
    },
    guardian: {
      name: 'Robert Doe',
      relationship: 'Father',
      phone: '+1234567892',
      email: 'robert.doe@email.com',
      address: '456 Guardian St, Guardian City'
    },
    results: [
      {
        semester: 1,
        year: 2023,
        courses: [
          {
            courseCode: 'CSC101',
            courseName: 'Introduction to Computer Science',
            creditUnits: 3,
            grade: 'A',
            gradePoint: 4.0
          },
          {
            courseCode: 'MTH101',
            courseName: 'Calculus I',
            creditUnits: 3,
            grade: 'B+',
            gradePoint: 3.5
          }
        ],
        gpa: 3.75,
        cgpa: 3.75
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    registrationNumber: 'UNI/2023/002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '2001-03-20',
    gender: 'female',
    email: 'sarah.johnson@university.edu',
    phone: '+1234567893',
    address: {
      street: '789 College Ave',
      city: 'University City',
      state: 'State',
      zipCode: '12345',
      country: 'Country'
    },
    emergencyContact: {
      name: 'Mary Johnson',
      relationship: 'Mother',
      phone: '+1234567894'
    },
    academicInfo: {
      faculty: 'Medicine',
      department: 'Medicine and Surgery',
      program: 'Bachelor of Medicine',
      level: '200',
      yearOfAdmission: 2023,
      currentSemester: 2,
      status: 'active'
    },
    guardian: {
      name: 'David Johnson',
      relationship: 'Father',
      phone: '+1234567895',
      email: 'david.johnson@email.com',
      address: '321 Guardian Ave, Guardian City'
    },
    results: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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

    // If no MongoDB connection, return demo data
    if (!process.env.MONGODB_URI) {
      let students = getDemoStudents();
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        students = students.filter(student => 
          student.firstName.toLowerCase().includes(searchLower) ||
          student.lastName.toLowerCase().includes(searchLower) ||
          student.registrationNumber.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower)
        );
      }
      if (faculty) {
        students = students.filter(s => s.academicInfo.faculty === faculty);
      }
      if (department) {
        students = students.filter(s => s.academicInfo.department === department);
      }
      if (level) {
        students = students.filter(s => s.academicInfo.level === level);
      }
      if (status) {
        students = students.filter(s => s.academicInfo.status === status);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStudents = students.slice(startIndex, endIndex);

      return res.json({
        success: true,
        students: paginatedStudents,
        pagination: {
          page,
          pages: Math.ceil(students.length / limit),
          total: students.length
        }
      });
    }

    const query: any = { isActive: true };
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

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

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

    // If no MongoDB connection, return demo data
    if (!process.env.MONGODB_URI) {
      const student = getDemoStudents().find(s => s.registrationNumber === regNumber);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json({ success: true, student });
    }

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

    // If no MongoDB connection, return demo data
    if (!process.env.MONGODB_URI) {
      const student = getDemoStudents().find(s => s._id === id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json({ success: true, student });
    }

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

// Create student
router.post('/', auth, authorize('admin', 'staff'), [
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
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

    // If no MongoDB connection, simulate creation
    if (!process.env.MONGODB_URI) {
      const newStudent = {
        _id: Date.now().toString(),
        ...req.body,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        student: newStudent,
        message: 'Student created successfully (demo mode)'
      });
    }

    const student = await Student.create(req.body);

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

    // If no MongoDB connection, simulate update
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Student updated successfully (demo mode)'
      });
    }

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

// Add result to student
router.post('/:id/results', auth, authorize('admin', 'staff'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const resultData = req.body;

    // If no MongoDB connection, simulate adding result
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Result added successfully (demo mode)'
      });
    }

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

    // If no MongoDB connection, simulate deletion
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Student deleted successfully (demo mode)'
      });
    }

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