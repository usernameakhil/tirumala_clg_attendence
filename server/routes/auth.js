const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const TEACHERS = require('../config/teachers');

// POST /api/auth/teacher/login - Authenticates dynamically from MongoDB
router.post('/teacher/login', async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    if (!teacherId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your Teacher ID and password'
      });
    }

    const normalizedId = teacherId.trim().toUpperCase();

    // 1. Check MongoDB Teacher collection
    let teacher = await Teacher.findOne({ teacherId: normalizedId });

    // Fallback: If database has no teachers yet, check fallback config
    if (!teacher) {
      const fallback = TEACHERS.find(t => t.id.toUpperCase() === normalizedId);
      if (fallback) {
        // Auto-save to MongoDB
        teacher = new Teacher({
          teacherId: fallback.id.toUpperCase(),
          name: fallback.name,
          password: fallback.password,
          department: fallback.department,
          designation: fallback.designation,
          email: fallback.email,
          isActive: true
        });
        await teacher.save();
      }
    }

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Teacher ID or password'
      });
    }

    // Check if management deactivated this account
    if (teacher.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your teacher account has been deactivated by management. Please contact administrator.'
      });
    }

    // Verify password
    if (teacher.password !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Teacher ID or password'
      });
    }

    const teacherData = {
      id: teacher.teacherId,
      name: teacher.name,
      department: teacher.department,
      designation: teacher.designation,
      email: teacher.email,
      permissions: teacher.permissions || { canCreateClasses: true, canEditAttendance: true, canExportPDF: true }
    };

    return res.json({
      success: true,
      message: 'Login successful',
      teacher: teacherData
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

module.exports = router;
