import express from 'express';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document.js';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import { uploadDocument, uploadImage, uploadAny, deleteFromCloudinary } from '../config/cloudinary.js';
import DocumentProcessingService from '../services/documentProcessing.js';
import SearchService from '../services/searchService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const documentProcessor = DocumentProcessingService.getInstance();
const searchService = SearchService.getInstance();

// Get all documents with advanced filtering and search
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      subcategory,
      accessLevel,
      tags,
      dateFrom,
      dateTo,
      uploadedBy,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query: any = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (accessLevel) query.accessLevel = accessLevel;
    if (uploadedBy) query.uploadedBy = uploadedBy;
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    // Tags filter
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Search functionality
    if (search) {
      const searchResults = await searchService.searchDocuments(search as string, {
        category: category as string,
        subcategory: subcategory as string,
        accessLevel: accessLevel ? [accessLevel as string] : undefined,
        tags: tags ? (tags as string).split(',').map(tag => tag.trim()) : undefined,
        uploadedBy: uploadedBy as string,
        limit: parseInt(limit as string)
      });

      const documentIds = searchResults.map(result => result.item._id);
      query._id = { $in: documentIds };
    }

    // Access control - users can only see documents they have permission to view
    if (req.user?.role !== 'admin' && req.user?.role !== 'system-admin') {
      query.$or = [
        { accessLevel: 'public' },
        { uploadedBy: req.user?._id },
        { 'permissions.canView': req.user?._id }
      ];
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'profile username')
      .populate('relatedTo.id')
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string)),
        total,
        limit: parseInt(limit as string)
      }
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Upload document
router.post('/upload', auth, [
  body('title').notEmpty().withMessage('Document title is required'),
  body('category').isIn(['academic', 'administrative', 'personal', 'financial', 'legal', 'medical', 'research']).withMessage('Valid category is required'),
  body('accessLevel').isIn(['public', 'restricted', 'confidential', 'classified']).withMessage('Valid access level is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const {
      title,
      description,
      category,
      subcategory,
      accessLevel,
      tags,
      relatedToType,
      relatedToId,
      relatedToName
    } = req.body;

    // Process document for text extraction and metadata
    const { extractedText, metadata } = await documentProcessor.processDocument(
      req.file.filename,
      req.file.originalname.split('.').pop() || ''
    );

    // Extract keywords from text
    const extractedKeywords = documentProcessor.extractKeywords(extractedText);
    const allTags = tags ? [...tags.split(',').map((tag: string) => tag.trim()), ...extractedKeywords] : extractedKeywords;

    // Create document record
    const documentData = {
      title,
      description,
      category,
      subcategory,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.originalname.split('.').pop()?.toLowerCase() || '',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      cloudinaryId: req.file.filename,
      cloudinaryUrl: (req.file as any).path,
      cloudinarySecureUrl: (req.file as any).path,
      cloudinaryFolder: 'urms/documents',
      ocrText: extractedText,
      extractedMetadata: metadata,
      tags: allTags,
      accessLevel,
      uploadedBy: req.user?._id,
      relatedTo: relatedToType && relatedToId ? {
        type: relatedToType,
        id: relatedToId,
        name: relatedToName
      } : undefined,
      auditLog: [{
        action: 'created',
        performedBy: req.user?._id,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }]
    };

    const document = await Document.create(documentData);
    await document.populate('uploadedBy', 'profile username');

    // Refresh search index
    await searchService.refreshIndexes();

    logger.info(`Document uploaded: ${document.title} by ${req.user?.username}`);

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get single document
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('uploadedBy', 'profile username')
      .populate('relatedTo.id');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    const hasAccess = 
      document.accessLevel === 'public' ||
      document.uploadedBy._id.toString() === req.user?._id.toString() ||
      document.permissions.canView.includes(req.user?._id) ||
      req.user?.role === 'admin' ||
      req.user?.role === 'system-admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Log view action
    await document.addAuditLog('viewed', req.user?._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Increment view count
    await document.incrementView();

    res.json({ success: true, document });
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document
router.get('/:id/download', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    const hasAccess = 
      document.accessLevel === 'public' ||
      document.uploadedBy.toString() === req.user?._id.toString() ||
      document.permissions.canView.includes(req.user?._id) ||
      req.user?.role === 'admin' ||
      req.user?.role === 'system-admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Log download action
    await document.addAuditLog('downloaded', req.user?._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Increment download count
    await document.incrementDownload();

    // Redirect to Cloudinary URL for download
    res.redirect(document.cloudinarySecureUrl);
  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document metadata
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check edit permissions
    const canEdit = 
      document.uploadedBy.toString() === req.user?._id.toString() ||
      document.permissions.canEdit.includes(req.user?._id) ||
      req.user?.role === 'admin' ||
      req.user?.role === 'system-admin';

    if (!canEdit) {
      return res.status(403).json({ message: 'Edit permission denied' });
    }

    // Update document
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { 
        ...req.body,
        version: document.version + 1
      },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'profile username');

    // Log modification action
    await updatedDocument?.addAuditLog('modified', req.user?._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: 'Metadata updated'
    });

    // Refresh search index
    await searchService.refreshIndexes();

    res.json({ success: true, document: updatedDocument });
  } catch (error) {
    logger.error('Update document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check delete permissions
    const canDelete = 
      document.uploadedBy.toString() === req.user?._id.toString() ||
      document.permissions.canDelete.includes(req.user?._id) ||
      req.user?.role === 'admin' ||
      req.user?.role === 'system-admin';

    if (!canDelete) {
      return res.status(403).json({ message: 'Delete permission denied' });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(document.cloudinaryId);

    // Log deletion action
    await document.addAuditLog('deleted', req.user?._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Soft delete (mark as inactive)
    await Document.findByIdAndUpdate(id, { isActive: false });

    // Refresh search index
    await searchService.refreshIndexes();

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search documents
router.get('/search/query', auth, async (req: AuthRequest, res) => {
  try {
    const { q, category, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await searchService.searchDocuments(q as string, {
      category: category as string,
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      results: results.map(result => ({
        document: result.item,
        score: result.score,
        matches: result.matches
      }))
    });
  } catch (error) {
    logger.error('Search documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document analytics
router.get('/:id/analytics', auth, authorize('admin', 'system-admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      success: true,
      analytics: {
        ...document.analytics,
        auditLog: document.auditLog.slice(-10) // Last 10 actions
      }
    });
  } catch (error) {
    logger.error('Get document analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;