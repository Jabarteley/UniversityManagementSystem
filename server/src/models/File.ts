import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  category: 'academic' | 'administrative' | 'student' | 'staff' | 'report' | 'other';
  description?: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  accessLevel: 'public' | 'restricted' | 'confidential';
  relatedTo?: {
    type: 'student' | 'staff' | 'department' | 'course';
    id: string;
  };
  metadata: {
    department?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
  };
  versions: [{
    version: number;
    filePath: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
    changes: string;
  }];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>({
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'student', 'staff', 'report', 'other'],
    required: [true, 'File category is required']
  },
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential'],
    default: 'restricted'
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['student', 'staff', 'department', 'course']
    },
    id: String
  },
  metadata: {
    department: String,
    semester: String,
    academicYear: String,
    subject: String
  },
  versions: [{
    version: { type: Number, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changes: { type: String, required: true }
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IFile>('File', fileSchema);