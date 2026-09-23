const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

// GET /api/student/:rollNumber and /api/student/:rollNumber/summary
router.get(['/:rollNumber', '/:rollNumber/summary'], async (req, res) => {
  try {
    const rawRoll = req.params.rollNumber;
    if (!rawRoll || !rawRoll.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid student roll number'
      });
    }

    const rollNumber = rawRoll.trim().toUpperCase();

    // Find all classes where this rollNumber is registered in students array
    const enrolledClasses = await Class.find({
      'students.rollNumber': rollNumber
    }).lean();

    if (enrolledClasses.length === 0) {
      return res.json({
        success: true,
        rollNumber,
        isRegistered: false,
        message: `Roll number ${rollNumber} is not currently registered in any class. Please check with your teachers.`,
        overall: {
          totalClasses: 0,
          totalAttended: 0,
          totalAbsent: 0,
          overallPercentage: 0
        },
        subjects: []
      });
    }

    let overallTotalClasses = 0;
    let overallAttended = 0;
    let overallAbsent = 0;

    // For each class, query attendance records
    const subjectsData = await Promise.all(
      enrolledClasses.map(async (cls) => {
        // Fetch all attendance sessions for this class, sorted by date descending
        const sessions = await Attendance.find({ classId: cls._id })
          .sort({ date: -1 })
          .lean();

        const totalHeld = sessions.length;
        let attended = 0;
        let absent = 0;

        const sessionHistory = sessions.map(session => {
          const studentRecord = (session.records || []).find(
            r => r.rollNumber.toUpperCase() === rollNumber
          );

          // If no specific record found for this roll, default to Absent
          const status = studentRecord ? studentRecord.status : 'Absent';
          if (status === 'Present') {
            attended++;
          } else {
            absent++;
          }

          return {
            attendanceId: session._id,
            date: session.date,
            sessionTopic: session.sessionTopic || 'Regular Class',
            sessionTime: session.sessionTime || '',
            status,
            remarks: studentRecord ? studentRecord.remarks : ''
          };
        });

        const percentage = totalHeld > 0
          ? parseFloat(((attended / totalHeld) * 100).toFixed(1))
          : 0;

        overallTotalClasses += totalHeld;
        overallAttended += attended;
        overallAbsent += absent;

        // Calculate attendance advice:
        // How many classes needed for 75% or safe skips available
        let safeSkips = 0;
        let classesNeededFor75 = 0;

        if (totalHeld > 0) {
          if (percentage >= 75) {
            // (attended) / (totalHeld + x) >= 0.75 => x <= (attended / 0.75) - totalHeld
            safeSkips = Math.max(0, Math.floor((attended / 0.75) - totalHeld));
          } else {
            // (attended + x) / (totalHeld + x) >= 0.75 => attended + x >= 0.75 totalHeld + 0.75 x => 0.25 x >= 0.75 totalHeld - attended
            // x >= (3 * totalHeld - 4 * attended)
            classesNeededFor75 = Math.max(0, Math.ceil((3 * totalHeld - 4 * attended)));
          }
        }

        return {
          classId: cls._id,
          subjectName: cls.subjectName,
          subjectCode: cls.subjectCode,
          teacherName: cls.teacherName,
          teacherId: cls.teacherId,
          section: cls.section,
          semester: cls.semester,
          academicYear: cls.academicYear,
          totalHeld,
          attended,
          absent,
          percentage,
          statusCategory: percentage >= 75 ? 'Good' : percentage >= 65 ? 'Warning' : 'Critical',
          safeSkips,
          classesNeededFor75,
          sessions: sessionHistory
        };
      })
    );

    const overallPercentage = overallTotalClasses > 0
      ? parseFloat(((overallAttended / overallTotalClasses) * 100).toFixed(1))
      : 0;

    return res.json({
      success: true,
      rollNumber,
      isRegistered: true,
      overall: {
        totalClasses: overallTotalClasses,
        totalAttended: overallAttended,
        totalAbsent: overallAbsent,
        overallPercentage,
        statusCategory: overallPercentage >= 75 ? 'Good' : overallPercentage >= 65 ? 'Warning' : 'Critical'
      },
      subjects: subjectsData
    });
  } catch (error) {
    console.error('Error fetching student summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student attendance'
    });
  }
});

module.exports = router;
