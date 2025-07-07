import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const linkProfiles = async () => {
  await connectDB();
  logger.info('Database connected for profile linking script.');

  try {
    const users = await User.find({ $or: [{ role: 'student' }, { role: 'staff' }] });
    logger.info(`Found ${users.length} student/staff users to check.`);

    for (const user of users) {
      let profileLinked = false;

      if (user.role === 'student') {
        const studentProfile = await Student.findOne({ userId: user._id });
        if (!studentProfile) {
          logger.warning(`Student profile not found for user: ${user.email}. Creating one.`);
          const newStudent = new Student({
            userId: user._id,
            registrationNumber: `REG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            academicInfo: {
              faculty: 'Unknown',
              department: 'Unknown',
              program: 'Unknown',
              level: '100',
              yearOfAdmission: new Date().getFullYear(),
              currentSemester: 1,
              status: 'active',
            },
            emergencyContact: { name: 'N/A', relationship: 'N/A', phone: 'N/A' },
            guardian: { name: 'N/A', relationship: 'N/A', phone: 'N/A', address: 'N/A' },
            financial: { tuitionStatus: 'unpaid', scholarships: [], outstandingBalance: 0 },
            results: [],
            documents: [],
            medical: { allergies: [], medications: [] },
            activities: [],
            isActive: true,
            metadata: { lastUpdated: new Date(), updatedBy: user._id, version: 1 },
          });
          await newStudent.save();
          user.recordRef = newStudent._id;
          user.recordType = 'Student';
          await user.save();
          logger.info(`Created and linked student profile for ${user.email}.`);
          profileLinked = true;
        } else if (!user.recordRef || user.recordRef.toString() !== studentProfile._id.toString()) {
          logger.info(`Linking existing student profile for user: ${user.email}.`);
          user.recordRef = studentProfile._id;
          user.recordType = 'Student';
          await user.save();
          profileLinked = true;
        }
      } else if (user.role === 'staff') {
        const staffProfile = await Staff.findOne({ userId: user._id });
        if (!staffProfile) {
          logger.warning(`Staff profile not found for user: ${user.email}. Creating one.`);
          const newStaff = new Staff({
            userId: user._id,
            staffId: `STAFF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            employmentInfo: {
              department: 'Unknown',
              faculty: 'Unknown',
              position: 'Unknown',
              rank: 'Unknown',
              employmentType: 'academic',
              dateOfAppointment: new Date(),
              currentStatus: 'active',
              workSchedule: { type: 'full-time' },
            },
            compensation: { basicSalary: 0, allowances: {}, totalSalary: 0, payGrade: 'N/A' },
            qualifications: [],
            certifications: [],
            leaveRecords: [],
            leaveBalance: { annual: 0, sick: 0, casual: 0, study: 0 },
            promotions: [],
            deployments: [],
            performance: [],
            training: [],
            documents: [],
            emergencyContact: { name: 'N/A', relationship: 'N/A', phone: 'N/A' },
            nextOfKin: { name: 'N/A', relationship: 'N/A', phone: 'N/A', address: 'N/A' },
            isActive: true,
            metadata: { lastUpdated: new Date(), updatedBy: user._id, version: 1 },
          });
          await newStaff.save();
          user.recordRef = newStaff._id;
          user.recordType = 'Staff';
          await user.save();
          logger.info(`Created and linked staff profile for ${user.email}.`);
          profileLinked = true;
        } else if (!user.recordRef || user.recordRef.toString() !== staffProfile._id.toString()) {
          logger.info(`Linking existing staff profile for user: ${user.email}.`);
          user.recordRef = staffProfile._id;
          user.recordType = 'Staff';
          await user.save();
          profileLinked = true;
        }
      }

      if (profileLinked) {
        logger.info(`Profile for ${user.email} (${user.role}) ensured.`);
      } else {
        logger.info(`Profile for ${user.email} (${user.role}) already linked.`);
      }
    }

    logger.info('Profile linking script finished.');
  } catch (error) {
    logger.error('Error during profile linking:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Database disconnected.');
  }
};

linkProfiles();