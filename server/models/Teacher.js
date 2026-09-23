const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: [true, 'Teacher ID / Roll Number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Teacher Name is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    default: 'General'
  },
  designation: {
    type: String,
    trim: true,
    default: 'Faculty'
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canCreateClasses: { type: Boolean, default: true },
    canEditAttendance: { type: Boolean, default: true },
    canExportPDF: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', TeacherSchema);
