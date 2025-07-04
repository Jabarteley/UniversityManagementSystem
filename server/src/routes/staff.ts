import express from 'express';
import { body, validationResult } from 'express-validator';
import Staff from '../models/Staff.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Demo staff data
const getDemoStaff = () => [
  {
    _id: '1',
    staffId: 'STAFF/2023/001',
    firstName: 'Dr. Alice',
    lastName: 'Smith',
    dateOfBirth: '1980-08-15',
    gender: 'female',
    email: 'alice.smith@university.edu',
    phone: '+1234567896',
    address: {
      street: '456 Faculty St',
      city: 'University City',
      state: 'State',
      zipCode: '12345',
      country: 'Country'
    },
    emergencyContact: {
      name: 'Bob Smith',
      relationship: 'Spouse',
      phone: '+1234567897'
    },
    employmentInfo: {
      department: 'Computer Science',
      faculty: 'Engineering',
      position: 'Senior Lecturer',
      rank: 'Associate Professor',
      employmentType: 'academic',
      dateOfAppointment: '2015-09-01',
      currentStatus: 'active',
      salary: {
        basic: 80000,
        allowances: 20000,
        total: 100000
      }
    },
    qualifications: [
      {
        degree: 'PhD Computer Science',
        institution: 'MIT',
        yearObtained: 2014,
        field: 'Artificial Intelligence'
      },
      {
        degree: 'MSc Computer Science',
        institution: 'Stanford University',
        yearObtained: 2010,
        field: 'Machine Learning'
      }
    ],
    leaveRecords: [
      {
        type: 'annual',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
        days: 14,
        reason: 'Family vacation',
        status: 'approved',
        appliedDate: '2024-06-01'
      }
    ],
    promotions: [],
    deployments: [],
    nextOfKin: {
      name: 'Bob Smith',
      relationship: 'Spouse',
      phone: '+1234567897',
      email: 'bob.smith@email.com',
      address: '456 Faculty St, University City'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    staffId: 'STAFF/2023/002',
    firstName: 'John',
    lastName: 'Wilson',
    dateOfBirth: '1975-12-10',
    gender: 'male',
    email: 'john.wilson@university.edu',
    phone: '+1234567898',
    address: {
      street: '789 Admin Ave',
      city: 'University City',
      state: 'State',
      zipCode: '12345',
      country: 'Country'
    },
    emergencyContact: {
      name: 'Mary Wilson',
      relationship: 'Spouse',
      phone: '+1234567899'
    },
    employmentInfo: {
      department: 'Registry',
      faculty: 'Administration',
      position: 'Registrar',
      rank: 'Senior Administrative Officer',
      employmentType: 'administrative',
      dateOfAppointment: '2010-03-01',
      currentStatus: 'active',
      salary: {
        basic: 70000,
        allowances: 15000,
        total: 85000
      }
    },
    qualifications: [
      {
        degree: 'MBA',
        institution: 'Harvard Business School',
        yearObtained: 2008,
        field: 'Business Administration'
      }
    ],
    leaveRecords: [],
    promotions: [
      {
        fromRank: 'Administrative Officer',
        toRank: 'Senior Administrative Officer',
        effectiveDate: '2020-01-01',
        reason: 'Performance and experience',
        approvedBy: 'admin-id'
      }
    ],
    deployments: [],
    nextOfKin: {
      name: 'Mary Wilson',
      relationship: 'Spouse',
      phone: '+1234567899',
      email: 'mary.wilson@email.com',
      address: '789 Admin Ave, University City'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get all staff
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const employmentType = req.query.employmentType as string;
    const status = req.query.status as string;

    // If no MongoDB connection, return demo data
    if (!process.env.MONGODB_URI) {
      let staff = getDemoStaff();
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        staff = staff.filter(s => 
          s.firstName.toLowerCase().includes(searchLower) ||
          s.lastName.toLowerCase().includes(searchLower) ||
          s.staffId.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
        );
      }
      if (department) {
        staff = staff.filter(s => s.employmentInfo.department === department);
      }
      if (employmentType) {
        staff = staff.filter(s => s.employmentInfo.employmentType === employmentType);
      }
      if (status) {
        staff = staff.filter(s => s.employmentInfo.currentStatus === status);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStaff = staff.slice(startIndex, endIndex);

      return res.json({
        success: true,
        staff: paginatedStaff,
        pagination: {
          page,
          pages: Math.ceil(staff.length / limit),
          total: staff.length
        }
      });
    }

    const query: any = { isActive: true };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) query['employmentInfo.department'] = department;
    if (employmentType) query['employmentInfo.employmentType'] = employmentType;
    if (status) query['employmentInfo.currentStatus'] = status;

    const staff = await Staff.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      staff,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single staff member
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // If no MongoDB connection, return demo data
    if (!process.env.MONGODB_URI) {
      const staff = getDemoStaff().find(s => s._id === id);
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      return res.json({ success: true, staff });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create staff member
router.post('/', auth, authorize('admin'), [
  body('staffId').notEmpty().withMessage('Staff ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('employmentInfo.department').notEmpty().withMessage('Department is required'),
  body('employmentInfo.position').notEmpty().withMessage('Position is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If no MongoDB connection, simulate creation
    if (!process.env.MONGODB_URI) {
      const newStaff = {
        _id: Date.now().toString(),
        ...req.body,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        staff: newStaff,
        message: 'Staff member created successfully (demo mode)'
      });
    }

    const staff = await Staff.create(req.body);

    res.status(201).json({
      success: true,
      staff
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update staff member
router.put('/:id', auth, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // If no MongoDB connection, simulate update
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Staff member updated successfully (demo mode)'
      });
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grant leave to staff member
router.post('/:id/leave', auth, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const leaveData = req.body;

    // If no MongoDB connection, simulate leave grant
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Leave granted successfully (demo mode)'
      });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.leaveRecords.push({
      ...leaveData,
      approvedBy: req.user?._id,
      appliedDate: new Date()
    });
    await staff.save();

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Grant leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote staff member
router.post('/:id/promote', auth, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { toRank, reason } = req.body;

    // If no MongoDB connection, simulate promotion
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Staff member promoted successfully (demo mode)'
      });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const promotion = {
      fromRank: staff.employmentInfo.rank,
      toRank,
      effectiveDate: new Date(),
      approvedBy: req.user?._id,
      reason
    };

    staff.promotions.push(promotion);
    staff.employmentInfo.rank = toRank;
    await staff.save();

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Promote staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deploy staff member
router.post('/:id/deploy', auth, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { toDepartment, reason } = req.body;

    // If no MongoDB connection, simulate deployment
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Staff member deployed successfully (demo mode)'
      });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const deployment = {
      fromDepartment: staff.employmentInfo.department,
      toDepartment,
      effectiveDate: new Date(),
      reason,
      approvedBy: req.user?._id
    };

    staff.deployments.push(deployment);
    staff.employmentInfo.department = toDepartment;
    await staff.save();

    res.json({ success: true, staff });
  } catch (error) {
    console.error('Deploy staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete staff member (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // If no MongoDB connection, simulate deletion
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        message: 'Staff member deleted successfully (demo mode)'
      });
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;