import express from 'express';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/faculties', auth, async (req, res) => {
  try {
    const studentFaculties = await Student.distinct('academicInfo.faculty');
    const staffFaculties = await Staff.distinct('employmentInfo.faculty');
    const faculties = [...new Set([...studentFaculties, ...staffFaculties])];
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/departments', auth, async (req, res) => {
  try {
    const studentDepartments = await Student.distinct('academicInfo.department');
    const staffDepartments = await Staff.distinct('employmentInfo.department');
    const departments = [...new Set([...studentDepartments, ...staffDepartments])];
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/levels', auth, async (req, res) => {
  try {
    const levels = await Student.distinct('academicInfo.level');
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/employment-types', auth, async (req, res) => {
  try {
    const employmentTypes = await Staff.distinct('employmentInfo.employmentType');
    res.json(employmentTypes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/classes', auth, async (req, res) => {
  try {
    // Assuming classes are defined in Staff teachingLoad or a separate Course model
    // For now, let's mock some classes or fetch from Staff teachingLoad
    const staffClasses = await Staff.aggregate([
      { $unwind: '$teachingLoad.courses' },
      { $group: { _id: '$teachingLoad.courses.courseCode', courseName: { $first: '$teachingLoad.courses.courseName' }, studentCount: { $sum: '$teachingLoad.courses.studentCount' } } },
      { $project: { _id: 0, code: '$_id', name: '$courseName', students: '$studentCount' } }
    ]);
    res.json(staffClasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;