const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { parseRollNumbers } = require('../utils/rollParser');

// POST /api/classes - Create a new class
router.post('/', async (req, res) => {
  try {
    const {
      teacherId,
      teacherName,
      subjectName,
      subjectCode,
      section,
      semester,
      academicYear,
      description,
      studentRolls // string or array
    } = req.body;

    if (!teacherId || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and Subject Name are required'
      });
    }

    const students = parseRollNumbers(studentRolls);

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid student roll number'
      });
    }

    const newClass = new Class({
      teacherId: teacherId.trim().toUpperCase(),
      teacherName: teacherName || teacherId,
      subjectName: subjectName.trim(),
      subjectCode: (subjectCode || '').trim().toUpperCase(),
      section: (section || 'A').trim().toUpperCase(),
      semester: (semester || 'Semester 1').trim(),
      academicYear: (academicYear || '2026-2027').trim(),
      description: (description || '').trim(),
      students
    });

    await newClass.save();

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create class'
    });
  }
});

// GET /api/classes - List all classes (optionally filtered by teacherId)
router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = {};

    if (teacherId) {
      filter.teacherId = teacherId.trim().toUpperCase();
    }

    const classes = await Class.find(filter).sort({ createdAt: -1 }).lean();

    // Enrich each class with count of sessions and student count
    const enrichedClasses = await Promise.all(
      classes.map(async (cls) => {
        const totalSessions = await Attendance.countDocuments({ classId: cls._id });
        const lastSession = await Attendance.findOne({ classId: cls._id })
          .sort({ date: -1 })
          .select('date sessionTopic')
          .lean();

        return {
          ...cls,
          studentCount: cls.students?.length || 0,
          totalSessions,
          lastSessionDate: lastSession ? lastSession.date : null,
          lastSessionTopic: lastSession ? lastSession.sessionTopic : null
        };
      })
    );

    return res.json({
      success: true,
      classes: enrichedClasses
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
});

// GET /api/classes/:id - Get details of a single class
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).lean();
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const totalSessions = await Attendance.countDocuments({ classId: classData._id });
    const sessions = await Attendance.find({ classId: classData._id })
      .sort({ date: -1 })
      .select('date sessionTopic sessionTime createdAt')
      .lean();

    return res.json({
      success: true,
      class: {
        ...classData,
        studentCount: classData.students?.length || 0,
        totalSessions,
        sessions
      }
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch class details'
    });
  }
});

// PUT /api/classes/:id - Update class details and/or student list
router.put('/:id', async (req, res) => {
  try {
    const {
      subjectName,
      subjectCode,
      section,
      semester,
      academicYear,
      description,
      studentRolls
    } = req.body;

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (subjectName) classData.subjectName = subjectName.trim();
    if (subjectCode !== undefined) classData.subjectCode = subjectCode.trim().toUpperCase();
    if (section !== undefined) classData.section = section.trim().toUpperCase();
    if (semester !== undefined) classData.semester = semester.trim();
    if (academicYear !== undefined) classData.academicYear = academicYear.trim();
    if (description !== undefined) classData.description = description.trim();

    if (studentRolls !== undefined) {
      const parsed = parseRollNumbers(studentRolls);
      if (parsed.length > 0) {
        classData.students = parsed;
      }
    }

    await classData.save();

    return res.json({
      success: true,
      message: 'Class updated successfully',
      class: classData
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update class'
    });
  }
});

// DELETE /api/classes/:id - Delete class and all associated attendance sessions
router.delete('/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    const deleted = await Class.findByIdAndDelete(classId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Delete all attendance records associated with this class
    await Attendance.deleteMany({ classId });

    return res.json({
      success: true,
      message: 'Class and all attendance history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    });
  }
});

module.exports = router;
