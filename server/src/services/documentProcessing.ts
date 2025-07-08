import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import cloudinary from '../config/cloudinary.js';

export class DocumentProcessingService {
  private static instance: DocumentProcessingService;
  private ocrWorker: Tesseract.Worker | null = null;

  private constructor() {}

  public static getInstance(): DocumentProcessingService {
    if (!DocumentProcessingService.instance) {
      DocumentProcessingService.instance = new DocumentProcessingService();
    }
    return DocumentProcessingService.instance;
  }

  // Initialize OCR worker
  async initializeOCR(): Promise<void> {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker();
      await this.ocrWorker.loadLanguage('eng');
      await this.ocrWorker.initialize('eng');
    }
  }

  // Extract text from PDF
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  }

  // Extract text from image using OCR
  async extractTextFromImage(buffer: Buffer): Promise<string> {
    try {
      await this.initializeOCR();
      
      // Preprocess image for better OCR results
      const processedImage = await sharp(buffer)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();

      if (!this.ocrWorker) {
        throw new Error('OCR worker not initialized');
      }

      const { data: { text } } = await this.ocrWorker.recognize(processedImage);
      return text;
    } catch (error) {
      console.error('Error extracting text from image:', error);
      return '';
    }
  }

  // Process document based on type
  async processDocument(cloudinaryId: string, fileType: string): Promise<{
    extractedText: string;
    metadata: any;
  }> {
    try {
      // Get file from Cloudinary
      const fileUrl = cloudinary.url(cloudinaryId, { resource_type: 'auto' });
      console.log('Cloudinary file URL:', fileUrl);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from Cloudinary: ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      let extractedText = '';
      let metadata: any = {};

      // Process based on file type
      if (fileType.toLowerCase() === 'pdf') {
        extractedText = await this.extractTextFromPDF(buffer);
        metadata = await this.extractPDFMetadata(buffer);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType.toLowerCase())) {
        extractedText = await this.extractTextFromImage(buffer);
        metadata = await this.extractImageMetadata(buffer);
      }

      return {
        extractedText: extractedText.trim(),
        metadata
      };
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        extractedText: '',
        metadata: {}
      };
    }
  }

  // Extract PDF metadata
  private async extractPDFMetadata(buffer: Buffer): Promise<any> {
    try {
      const data = await pdfParse(buffer);
      return {
        pageCount: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
      return {};
    }
  }

  // Extract image metadata
  private async extractImageMetadata(buffer: Buffer): Promise<any> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      console.error('Error extracting image metadata:', error);
      return {};
    }
  }

  // Generate document thumbnail
  async generateThumbnail(cloudinaryId: string, fileType: string): Promise<string | null> {
    try {
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType.toLowerCase())) {
        // For images, create a thumbnail using Cloudinary transformations
        return cloudinary.url(cloudinaryId, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        });
      } else if (fileType.toLowerCase() === 'pdf') {
        // For PDFs, generate thumbnail of first page
        return cloudinary.url(cloudinaryId, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'jpg',
          page: 1
        });
      }
      return null;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  // Extract keywords from text
  extractKeywords(text: string): string[] {
    if (!text) return [];

    // Simple keyword extraction (can be enhanced with NLP libraries)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Check if word is a stop word
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
      'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
      'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could',
      'can', 'may', 'might', 'must', 'shall'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  // Clean up OCR worker
  async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

export default DocumentProcessingService;