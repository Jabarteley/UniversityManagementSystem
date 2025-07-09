import express from 'express';
import { uploadAny } from '../config/cloudinary.js';
import Document from '../models/Document.js';
import { auth } from '../middleware/auth.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';



const router = express.Router();

router.post('/upload', auth, uploadAny.single('file'), async (req, res) => {
  try {
    console.log('1. Received upload request');
    if (!req.file) {
      console.log('1.1. No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('2. File received', req.file);
    const uploadedFile = req.file as any;

    console.log('3. Creating new Document instance');
    const document = new Document({
      title: req.body.title || uploadedFile.originalname,
      category: req.body.category || 'general',
      accessLevel: req.body.accessLevel || 'private',
      originalName: uploadedFile.originalname,
      fileName: uploadedFile.filename || uploadedFile.originalname, // Use filename from multer or originalname
      fileType: uploadedFile.format || uploadedFile.mimetype.split('/')[1],
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      cloudinaryId: uploadedFile.public_id,
      cloudinaryUrl: uploadedFile.url,
      cloudinarySecureUrl: uploadedFile.secure_url,
      cloudinaryFolder: uploadedFile.folder || 'urms/general', // Use folder from Cloudinary response or default
      uploadedBy: (req as any).user._id,
    });

    console.log('4. Saving document to database');
    await document.save();
    console.log('5. Document saved, sending response');
    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error caught:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: (req as any).user._id });
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