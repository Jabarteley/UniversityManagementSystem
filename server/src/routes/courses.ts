import express from 'express';
import Course from '../models/Course.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;