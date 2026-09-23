const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  studentName: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const ClassSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: [true, 'Teacher ID is required'],
    trim: true,
    index: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  subjectCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  section: {
    type: String,
    trim: true,
    default: 'A'
  },
  semester: {
    type: String,
    trim: true,
    default: 'Semester 1'
  },
  academicYear: {
    type: String,
    trim: true,
    default: '2026-2027'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  students: [StudentSchema]
}, {
  timestamps: true
});

// Index to quickly query classes where a student roll number is enrolled
ClassSchema.index({ 'students.rollNumber': 1 });

module.exports = mongoose.model('Class', ClassSchema);
