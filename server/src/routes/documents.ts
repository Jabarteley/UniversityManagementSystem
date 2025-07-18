import express from 'express';
import Document from '../models/Document.js';
import { auth } from '../middleware/auth.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import { UploadedFile } from 'express-fileupload';

const router = express.Router();

router.post('/upload', auth, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file as UploadedFile;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.tempFilePath, 'urms/general');

    const document = new Document({
      title: req.body.title || file.name,
      category: req.body.category || 'general',
      accessLevel: req.body.accessLevel || 'private',
      originalName: file.name,
      fileName: result.public_id,
      fileType: result.format,
      fileSize: result.bytes,
      mimeType: file.mimetype,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.url,
      cloudinarySecureUrl: result.secure_url,
      cloudinaryFolder: result.folder || 'urms/general',
      uploadedBy: (req as any).user._id,
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error caught:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { courseCode, category } = req.query;
    const filter: any = { uploadedBy: (req as any).user._id };

    if (courseCode) {
      filter.relatedToType = 'Course';
      filter.relatedToId = courseCode;
    }

    if (category) {
      filter.category = category;
    }

    const documents = await Document.find(filter);
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    
    await deleteFromCloudinary(document.cloudinaryId);
    await document.remove();

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;