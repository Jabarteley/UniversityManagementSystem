import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  registrationNumber: string;
  userId: mongoose.Types.ObjectId; // Reference to User
  
  // Academic Information
  academicInfo: {
    faculty: string;
    department: string;
    program: string;
    level: string;
    yearOfAdmission: number;
    currentSemester: number;
    status: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'deferred';
    expectedGraduation?: Date;
    advisor?: mongoose.Types.ObjectId;
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Guardian Information
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
    occupation?: string;
  };
  
  // Financial Information
  financial: {
    tuitionStatus: 'paid' | 'partial' | 'unpaid';
    scholarships: [{
      name: string;
      amount: number;
      year: number;
      status: 'active' | 'completed' | 'suspended';
    }];
    outstandingBalance: number;
  };
  
  // Academic Records
  results: [{
    semester: number;
    year: number;
    courses: [{
      courseCode: string;
      courseName: string;
      creditUnits: number;
      grade: string;
      gradePoint: number;
      instructor?: string;
    }];
    gpa: number;
    cgpa: number;
    remarks?: string;
  }];
  
  // Documents and Files
  documents: [{
    type: string;
    name: string;
    cloudinaryId: string;
    url: string;
    uploadDate: Date;
    verified: boolean;
  }];
  
  // Medical Information
  medical: {
    bloodGroup?: string;
    allergies?: string[];
    medications?: string[];
    emergencyMedicalContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  // Extracurricular Activities
  activities: [{
    name: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }];
  
  // Status and Metadata
  isActive: boolean;
  metadata: {
    lastUpdated: Date;
    updatedBy: mongoose.Types.ObjectId;
    version: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  academicInfo: {
    faculty: { type: String, required: true },
    department: { type: String, required: true },
    program: { type: String, required: true },
    level: { type: String, required: true },
    yearOfAdmission: { type: Number, required: true },
    currentSemester: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['active', 'graduated', 'suspended', 'withdrawn', 'deferred'],
      default: 'active'
    },
    expectedGraduation: Date,
    advisor: { type: Schema.Types.ObjectId, ref: 'Staff' }
  },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String
  },
  guardian: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    occupation: String
  },
  financial: {
    tuitionStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid'
    },
    scholarships: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      year: { type: Number, required: true },
      status: {
        type: String,
        enum: ['active', 'completed', 'suspended'],
        default: 'active'
      }
    }],
    outstandingBalance: { type: Number, default: 0 }
  },
  results: [{
    semester: { type: Number, required: true },
    year: { type: Number, required: true },
    courses: [{
      courseCode: { type: String, required: true },
      courseName: { type: String, required: true },
      creditUnits: { type: Number, required: true },
      grade: { type: String, required: true },
      gradePoint: { type: Number, required: true },
      instructor: String
    }],
    gpa: { type: Number, required: true },
    cgpa: { type: Number, required: true },
    remarks: String
  }],
  documents: [{
    type: { type: String, required: true },
    name: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  medical: {
    bloodGroup: String,
    allergies: [String],
    medications: [String],
    emergencyMedicalContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  activities: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    description: String
  }],
  isActive: { type: Boolean, default: true },
  metadata: {
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Indexes for performance
studentSchema.index({ registrationNumber: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ 'academicInfo.faculty': 1 });
studentSchema.index({ 'academicInfo.department': 1 });
studentSchema.index({ 'academicInfo.level': 1 });
studentSchema.index({ 'academicInfo.status': 1 });
studentSchema.index({ isActive: 1 });

// Pre-save middleware to update metadata
studentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.metadata.lastUpdated = new Date();
    this.metadata.version += 1;
  }
  next();
});

export default mongoose.model<IStudent>('Student', studentSchema);