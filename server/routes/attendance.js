const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

// Helper to format date to YYYY-MM-DD
function formatDate(d) {
  const date = d ? new Date(d) : new Date();
  return date.toISOString().split('T')[0];
}

// POST /api/attendance/mark - Mark or Upsert attendance for a class on a specific date
router.post('/mark', async (req, res) => {
  try {
    const {
      classId,
      date,
      sessionTime,
      sessionTopic,
      markedBy,
      records
    } = req.body;

    if (!classId || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and student records array are required'
      });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const sessionDate = date ? String(date).trim() : formatDate();

    // Clean records
    const cleanedRecords = records.map(r => ({
      rollNumber: String(r.rollNumber).trim().toUpperCase(),
      status: r.status === 'Absent' ? 'Absent' : 'Present',
      remarks: r.remarks ? String(r.remarks).trim() : ''
    }));

    // Find if session already exists for this class & date
    let attendance = await Attendance.findOne({ classId, date: sessionDate });

    if (attendance) {
      // Update existing attendance session
      attendance.records = cleanedRecords;
      if (sessionTime !== undefined) attendance.sessionTime = sessionTime;
      if (sessionTopic !== undefined) attendance.sessionTopic = sessionTopic;
      if (markedBy) attendance.markedBy = markedBy;
      await attendance.save();

      return res.json({
        success: true,
        message: `Attendance updated for date ${sessionDate}`,
        attendance,
        isUpdate: true
      });
    } else {
      // Create new session
      attendance = new Attendance({
        classId,
        date: sessionDate,
        sessionTime: sessionTime || '',
        sessionTopic: sessionTopic || 'Regular Lecture',
        markedBy: markedBy || classData.teacherId,
        records: cleanedRecords
      });
      await attendance.save();

      return res.status(201).json({
        success: true,
        message: `Attendance marked successfully for ${sessionDate}`,
        attendance,
        isUpdate: false
      });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record attendance'
    });
  }
});

// GET /api/attendance/class/:classId - Get all sessions for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const sessions = await Attendance.find({ classId })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Enumerate stats per session
    const enrichedSessions = sessions.map(session => {
      let presentCount = 0;
      let absentCount = 0;
      (session.records || []).forEach(r => {
        if (r.status === 'Present') presentCount++;
        else absentCount++;
      });
      const total = presentCount + absentCount;
      const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

      return {
        ...session,
        presentCount,
        absentCount,
        totalMarked: total,
        percentage
      };
    });

    return res.json({
      success: true,
      sessions: enrichedSessions
    });
  } catch (error) {
    console.error('Error fetching attendance sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history'
    });
  }
});

// GET /api/attendance/class/:classId/date/:date - Get attendance for a particular date (for editing)
router.get('/class/:classId/date/:date', async (req, res) => {
  try {
    const { classId, date } = req.params;
    const classData = await Class.findById(classId).lean();
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const attendance = await Attendance.findOne({ classId, date }).lean();

    // Prepare full student roster with status (defaults to Present if not marked)
    const recordsMap = new Map();
    if (attendance && attendance.records) {
      attendance.records.forEach(r => {
        recordsMap.set(r.rollNumber.toUpperCase(), r);
      });
    }

    const rosterWithStatus = (classData.students || []).map(student => {
      const existing = recordsMap.get(student.rollNumber.toUpperCase());
      return {
        rollNumber: student.rollNumber,
        studentName: student.studentName || '',
        status: existing ? existing.status : 'Present',
        remarks: existing ? existing.remarks : ''
      };
    });

    return res.json({
      success: true,
      exists: !!attendance,
      attendanceId: attendance ? attendance._id : null,
      date,
      sessionTopic: attendance ? attendance.sessionTopic : 'Regular Lecture',
      sessionTime: attendance ? attendance.sessionTime : '',
      records: rosterWithStatus
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance for specified date'
    });
  }
});

// PUT /api/attendance/:id - Update attendance session directly
router.put('/:id', async (req, res) => {
  try {
    const { records, sessionTopic, sessionTime, date } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (date && date !== attendance.date) {
      // Check collision
      const existingDate = await Attendance.findOne({
        classId: attendance.classId,
        date,
        _id: { $ne: attendance._id }
      });
      if (existingDate) {
        return res.status(400).json({
          success: false,
          message: `Attendance already exists for date ${date}`
        });
      }
      attendance.date = date;
    }

    if (sessionTopic !== undefined) attendance.sessionTopic = sessionTopic;
    if (sessionTime !== undefined) attendance.sessionTime = sessionTime;

    if (records && Array.isArray(records)) {
      attendance.records = records.map(r => ({
        rollNumber: String(r.rollNumber).trim().toUpperCase(),
        status: r.status === 'Absent' ? 'Absent' : 'Present',
        remarks: r.remarks ? String(r.remarks).trim() : ''
      }));
    }

    await attendance.save();

    return res.json({
      success: true,
      message: 'Attendance session updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance'
    });
  }
});

// DELETE /api/attendance/:id - Delete an attendance session
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found'
      });
    }

    return res.json({
      success: true,
      message: 'Attendance session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete attendance session'
    });
  }
});

// GET /api/attendance/class/:classId/matrix - Complete attendance matrix for class & PDF export
router.get('/class/:classId/matrix', async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId).lean();

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get all sessions sorted chronologically ascending
    const sessions = await Attendance.find({ classId })
      .sort({ date: 1 })
      .lean();

    const dates = sessions.map(s => ({
      id: s._id,
      date: s.date,
      topic: s.sessionTopic,
      time: s.sessionTime
    }));

    const totalSessions = sessions.length;

    // Build map: rollNumber -> { [date]: 'Present' | 'Absent' }
    const studentAttendanceMap = new Map();
    (classData.students || []).forEach(student => {
      studentAttendanceMap.set(student.rollNumber.toUpperCase(), {
        rollNumber: student.rollNumber.toUpperCase(),
        studentName: student.studentName || '',
        dates: {},
        presentCount: 0,
        absentCount: 0,
        totalHeld: totalSessions,
        percentage: 0
      });
    });

    sessions.forEach(session => {
      const sessionDate = session.date;
      (session.records || []).forEach(r => {
        const roll = r.rollNumber.toUpperCase();
        if (!studentAttendanceMap.has(roll)) {
          // If roll was recorded but not in initial roster
          studentAttendanceMap.set(roll, {
            rollNumber: roll,
            studentName: '',
            dates: {},
            presentCount: 0,
            absentCount: 0,
            totalHeld: totalSessions,
            percentage: 0
          });
        }
        const record = studentAttendanceMap.get(roll);
        record.dates[sessionDate] = r.status;
        if (r.status === 'Present') {
          record.presentCount += 1;
        } else {
          record.absentCount += 1;
        }
      });
    });

    // Compute percentages
    let classTotalPercentage = 0;
    const studentsList = Array.from(studentAttendanceMap.values()).map(student => {
      // If student was missing from any session, consider absent or not marked
      const attended = student.presentCount;
      const pct = totalSessions > 0 ? ((attended / totalSessions) * 100) : 0;
      student.percentage = parseFloat(pct.toFixed(1));
      classTotalPercentage += student.percentage;
      return student;
    });

    const averagePercentage = studentsList.length > 0
      ? (classTotalPercentage / studentsList.length).toFixed(1)
      : 0;

    return res.json({
      success: true,
      classInfo: {
        id: classData._id,
        subjectName: classData.subjectName,
        subjectCode: classData.subjectCode,
        teacherId: classData.teacherId,
        teacherName: classData.teacherName,
        section: classData.section,
        semester: classData.semester,
        academicYear: classData.academicYear,
        totalEnrolled: studentsList.length
      },
      dates,
      totalSessions,
      averagePercentage,
      students: studentsList
    });
  } catch (error) {
    console.error('Error generating attendance matrix:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate attendance matrix'
    });
  }
});

module.exports = router;
