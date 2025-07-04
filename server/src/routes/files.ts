import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import File from '../models/File.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all files
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const accessLevel = req.query.accessLevel as string;

    logger.debug('Fetching files with params:', { page, limit, search, category, accessLevel });

    const query: any = { isArchived: { $ne: true } };
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category) query.category = category;
    if (accessLevel) query.accessLevel = accessLevel;

    const files = await File.find(query)
      .populate('uploadedBy', 'profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(query);

    logger.debug(`Found ${files.length} files out of ${total} total`);

    res.json({
      success: true,
      files,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get files error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Upload file
router.post('/upload', auth, upload.single('file'), [
  body('category').isIn(['academic', 'administrative', 'student', 'staff', 'report', 'other']).withMessage('Valid category is required'),
  body('accessLevel').isIn(['public', 'restricted', 'confidential']).withMessage('Valid access level is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      uploadedBy: req.user?._id,
      category: req.body.category,
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
      accessLevel: req.body.accessLevel,
      metadata: {
        department: req.body.department || '',
        semester: req.body.semester || '',
        academicYear: req.body.academicYear || '',
        subject: req.body.subject || ''
      }
    };

    const file = await File.create(fileData);
    await file.populate('uploadedBy', 'profile');

    logger.success('File uploaded successfully:', file.originalName);

    res.status(201).json({
      success: true,
      file
    });
  } catch (error) {
    logger.error('Upload file error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get single file
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id).populate('uploadedBy', 'profile');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ success: true, file });
  } catch (error) {
    logger.error('Get file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    logger.error('Download file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update file metadata
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'profile');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ success: true, file });
  } catch (error) {
    logger.error('Update file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive file
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByIdAndUpdate(
      id,
      { isArchived: true, updatedAt: new Date() },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ success: true, message: 'File archived successfully' });
  } catch (error) {
    logger.error('Archive file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByIdAndDelete(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // TODO: Delete actual file from filesystem
    // fs.unlinkSync(file.filePath);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;