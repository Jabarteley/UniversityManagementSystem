import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  staffId: string;
  userId: mongoose.Types.ObjectId; // Reference to User
  
  // Employment Information
  employmentInfo: {
    department: string;
    faculty: string;
    position: string;
    rank: string;
    employmentType: 'academic' | 'administrative' | 'support' | 'contract';
    dateOfAppointment: Date;
    currentStatus: 'active' | 'on-leave' | 'suspended' | 'retired' | 'terminated';
    contractEndDate?: Date;
    workSchedule: {
      type: 'full-time' | 'part-time' | 'contract';
      hoursPerWeek?: number;
    };
    supervisor?: mongoose.Types.ObjectId;
  };
  
  // Salary and Benefits
  compensation: {
    basicSalary: number;
    allowances: {
      housing?: number;
      transport?: number;
      medical?: number;
      other?: number;
    };
    totalSalary: number;
    payGrade: string;
    lastSalaryReview?: Date;
  };
  
  // Qualifications and Certifications
  qualifications: [{
    degree: string;
    institution: string;
    yearObtained: number;
    field: string;
    grade?: string;
    verified: boolean;
    documentId?: string;
  }];
  
  certifications: [{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber?: string;
    verified: boolean;
  }];
  
  // Leave Management
  leaveRecords: [{
    type: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'study' | 'terminal' | 'emergency';
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: mongoose.Types.ObjectId;
    appliedDate: Date;
    documents?: string[];
  }];
  
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
    study: number;
  };
  
  // Career Progression
  promotions: [{
    fromRank: string;
    toRank: string;
    fromGrade: string;
    toGrade: string;
    effectiveDate: Date;
    approvedBy: mongoose.Types.ObjectId;
    reason: string;
    salaryIncrease?: number;
  }];
  
  deployments: [{
    fromDepartment: string;
    toDepartment: string;
    fromFaculty?: string;
    toFaculty?: string;
    effectiveDate: Date;
    reason: string;
    approvedBy: mongoose.Types.ObjectId;
    duration?: string;
  }];
  
  // Performance and Training
  performance: [{
    year: number;
    rating: 'excellent' | 'very-good' | 'good' | 'satisfactory' | 'needs-improvement';
    comments?: string;
    goals?: string[];
    reviewedBy: mongoose.Types.ObjectId;
    reviewDate: Date;
  }];
  
  training: [{
    title: string;
    provider: string;
    startDate: Date;
    endDate: Date;
    type: 'internal' | 'external' | 'online' | 'conference';
    certificateObtained: boolean;
    cost?: number;
  }];
  
  // Teaching Load (for academic staff)
  teachingLoad?: {
    courses: [{
      courseCode: string;
      courseName: string;
      semester: string;
      year: number;
      creditHours: number;
      studentCount: number;
    }];
    totalCreditHours: number;
    researchSupervision: [{
      studentName: string;
      level: 'undergraduate' | 'masters' | 'phd';
      topic: string;
      startDate: Date;
      expectedCompletion?: Date;
    }];
  };
  
  // Research and Publications (for academic staff)
  research?: {
    publications: [{
      title: string;
      type: 'journal' | 'conference' | 'book' | 'chapter';
      year: number;
      journal?: string;
      isbn?: string;
      doi?: string;
      coAuthors?: string[];
    }];
    grants: [{
      title: string;
      fundingAgency: string;
      amount: number;
      startDate: Date;
      endDate: Date;
      status: 'active' | 'completed' | 'terminated';
    }];
    projects: [{
      title: string;
      description: string;
      startDate: Date;
      endDate?: Date;
      collaborators?: string[];
      status: 'ongoing' | 'completed' | 'suspended';
    }];
  };
  
  // Documents and Files
  documents: mongoose.Types.ObjectId[];
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  };
  
  // Next of Kin
  nextOfKin: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
    percentage?: number; // for benefits
  };
  
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

const staffSchema = new Schema<IStaff>({
  staffId: {
    type: String,
    required: [true, 'Staff ID is required'],
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
  employmentInfo: {
    department: { type: String, required: true },
    faculty: { type: String, required: true },
    position: { type: String, required: true },
    rank: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ['academic', 'administrative', 'support', 'contract'],
      required: true
    },
    dateOfAppointment: { type: Date, required: true },
    currentStatus: {
      type: String,
      enum: ['active', 'on-leave', 'suspended', 'retired', 'terminated'],
      default: 'active'
    },
    contractEndDate: Date,
    workSchedule: {
      type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract'],
        default: 'full-time'
      },
      hoursPerWeek: Number
    },
    supervisor: { type: Schema.Types.ObjectId, ref: 'Staff' }
  },
  compensation: {
    basicSalary: { type: Number, required: true },
    allowances: {
      housing: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    totalSalary: { type: Number, required: true },
    payGrade: { type: String, required: true },
    lastSalaryReview: Date
  },
  qualifications: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    yearObtained: { type: Number, required: true },
    field: { type: String, required: true },
    grade: String,
    verified: { type: Boolean, default: false },
    documentId: String
  }],
  certifications: [{
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    certificateNumber: String,
    verified: { type: Boolean, default: false }
  }],
  leaveRecords: [{
    type: {
      type: String,
      enum: ['annual', 'sick', 'casual', 'maternity', 'paternity', 'study', 'terminal', 'emergency'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    appliedDate: { type: Date, default: Date.now },
    documents: [String]
  }],
  leaveBalance: {
    annual: { type: Number, default: 30 },
    sick: { type: Number, default: 15 },
    casual: { type: Number, default: 10 },
    study: { type: Number, default: 5 }
  },
  promotions: [{
    fromRank: { type: String, required: true },
    toRank: { type: String, required: true },
    fromGrade: { type: String, required: true },
    toGrade: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    salaryIncrease: Number
  }],
  deployments: [{
    fromDepartment: { type: String, required: true },
    toDepartment: { type: String, required: true },
    fromFaculty: String,
    toFaculty: String,
    effectiveDate: { type: Date, required: true },
    reason: { type: String, required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    duration: String
  }],
  performance: [{
    year: { type: Number, required: true },
    rating: {
      type: String,
      enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement'],
      required: true
    },
    comments: String,
    goals: [String],
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewDate: { type: Date, required: true }
  }],
  training: [{
    title: { type: String, required: true },
    provider: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: {
      type: String,
      enum: ['internal', 'external', 'online', 'conference'],
      required: true
    },
    certificateObtained: { type: Boolean, default: false },
    cost: Number
  }],
  teachingLoad: {
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    totalCreditHours: { type: Number, default: 0 },
    researchSupervision: [{
      student: { type: Schema.Types.ObjectId, ref: 'Student' },
      studentName: { type: String, required: true },
      level: {
        type: String,
        enum: ['undergraduate', 'masters', 'phd'],
        required: true
      },
      topic: { type: String, required: true },
      startDate: { type: Date, required: true },
      expectedCompletion: Date
    }]
  },
  research: {
    publications: [{
      title: { type: String, required: true },
      type: {
        type: String,
        enum: ['journal', 'conference', 'book', 'chapter'],
        required: true
      },
      year: { type: Number, required: true },
      journal: String,
      isbn: String,
      doi: String,
      coAuthors: [String]
    }],
    grants: [{
      title: { type: String, required: true },
      fundingAgency: { type: String, required: true },
      amount: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      status: {
        type: String,
        enum: ['active', 'completed', 'terminated'],
        default: 'active'
      }
    }],
    projects: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: Date,
      collaborators: [String],
      status: {
        type: String,
        enum: ['ongoing', 'completed', 'suspended'],
        default: 'ongoing'
      }
    }]
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: String
  },
  nextOfKin: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    percentage: { type: Number, default: 100 }
  },
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

staffSchema.index({ 'employmentInfo.department': 1 });
staffSchema.index({ 'employmentInfo.faculty': 1 });
staffSchema.index({ 'employmentInfo.employmentType': 1 });
staffSchema.index({ 'employmentInfo.currentStatus': 1 });
staffSchema.index({ isActive: 1 });

// Pre-save middleware to update metadata and calculate total salary
staffSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.metadata.lastUpdated = new Date();
    this.metadata.version += 1;
  }
  
  // Calculate total salary
  if (this.isModified('compensation')) {
    const allowances = this.compensation.allowances;
    this.compensation.totalSalary = this.compensation.basicSalary + 
      (allowances.housing || 0) + 
      (allowances.transport || 0) + 
      (allowances.medical || 0) + 
      (allowances.other || 0);
  }
  
  next();
});

export default mongoose.model<IStaff>('Staff', staffSchema);