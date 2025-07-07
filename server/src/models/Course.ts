import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  courseName: string;
  creditHours: number;
  level: string;
  semester: string;
  faculty: string;
  department: string;
}

const courseSchema = new Schema<ICourse>({
  courseCode: {
    type: String,
    required: true,
    unique: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  creditHours: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
});

export default mongoose.model<ICourse>('Course', courseSchema);