import express from 'express';
import { body, validationResult } from 'express-validator';
import Staff from '../models/Staff.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();



// Get all staff
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const employmentType = req.query.employmentType as string;
    const status = req.query.status as string;

    

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