const mongoose = require('mongoose');

const AttendanceRecordItemSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const AttendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required'],
    index: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Date is required'],
    trim: true
  },
  sessionTime: {
    type: String,
    trim: true,
    default: ''
  },
  sessionTopic: {
    type: String,
    trim: true,
    default: 'Regular Lecture'
  },
  markedBy: {
    type: String,
    required: true,
    trim: true
  },
  records: [AttendanceRecordItemSchema]
}, {
  timestamps: true
});

// Ensure a single class has only one attendance session per date for easy editing and tracking
AttendanceSchema.index({ classId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ 'records.rollNumber': 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
