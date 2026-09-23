import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an official, clean PDF attendance report for a class
 */
export function generateClassAttendancePDF(matrixData) {
  if (!matrixData || !matrixData.classInfo) {
    alert('No attendance data available to download.');
    return;
  }

  const { classInfo, dates = [], students = [], totalSessions = 0, averagePercentage = 0 } = matrixData;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Class Attendance Report', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Academic Year: ${classInfo.academicYear || '2026'}`, pageWidth / 2, 22, { align: 'center' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 26, pageWidth - 14, 26);

  // Class Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 29, pageWidth - 28, 24, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Subject:', 18, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`${classInfo.subjectName} (${classInfo.subjectCode || 'N/A'})`, 36, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Teacher:', 18, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(`${classInfo.teacherName} (ID: ${classInfo.teacherId})`, 36, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Section:', 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`Section ${classInfo.section} • ${classInfo.semester}`, 36, 47);

  // Right column
  const rightX = pageWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Students:', rightX, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`${classInfo.totalEnrolled || students.length}`, rightX + 26, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Classes Held:', rightX, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalSessions}`, rightX + 26, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Average %:', rightX, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`${averagePercentage}%`, rightX + 26, 47);

  // 1. Student Table
  let currentY = 59;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Student Attendance Summary', 14, currentY);

  const tableRows = students.map((s, idx) => [
    idx + 1,
    s.rollNumber,
    s.totalHeld,
    s.presentCount,
    s.absentCount,
    `${s.percentage}%`,
    s.percentage >= 75 ? 'Eligible' : 'Shortage'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Roll Number', 'Held', 'Present', 'Absent', 'Percentage', 'Status']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      halign: 'center',
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue 600
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 22, textColor: [16, 120, 60] },
      4: { cellWidth: 22, textColor: [220, 38, 38] },
      5: { cellWidth: 25, fontStyle: 'bold' },
      6: { cellWidth: 30 }
    }
  });

  // 2. Day-by-Day Table
  currentY = doc.lastAutoTable.finalY + 12;
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Day-by-Day Attendance Record', 14, currentY);

  if (dates.length > 0) {
    const sessionRows = dates.map((d, idx) => {
      let p = 0;
      let a = 0;
      students.forEach(st => {
        if (st.dates[d.date] === 'Present') p++;
        else if (st.dates[d.date] === 'Absent') a++;
      });
      const tot = p + a;
      const rate = tot > 0 ? ((p / tot) * 100).toFixed(0) : 0;

      return [
        idx + 1,
        d.date,
        d.topic || 'Regular Class',
        p,
        a,
        `${rate}%`
      ];
    });

    autoTable(doc, {
      startY: currentY + 3,
      head: [['#', 'Date', 'Topic Covered', 'Present', 'Absent', 'Turnout']],
      body: sessionRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center'
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25, fontStyle: 'bold' },
        2: { cellWidth: 80, halign: 'left' },
        3: { cellWidth: 20, textColor: [16, 120, 60] },
        4: { cellWidth: 20, textColor: [220, 38, 38] },
        5: { cellWidth: 20 }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // Signatures
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(20, currentY + 12, 70, currentY + 12);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Teacher Signature', 22, currentY + 16);

  const hodX = pageWidth - 70;
  doc.line(hodX, currentY + 12, hodX + 50, currentY + 12);
  doc.text('HOD Signature', hodX + 5, currentY + 16);

  const safeSubject = (classInfo.subjectName || 'Attendance').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeSubject}_Attendance.pdf`);
}

/**
 * Generates an Individual Student Attendance PDF
 */
export function generateStudentReportPDF(studentSummary) {
  if (!studentSummary || !studentSummary.rollNumber) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Student Attendance Report', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Roll Number: ${studentSummary.rollNumber}`, pageWidth / 2, 22, { align: 'center' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 26, pageWidth - 14, 26);

  // Overall Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 30, pageWidth - 28, 20, 2, 2, 'F');

  const overall = studentSummary.overall || {};
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Classes:', 20, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${overall.totalClasses || 0}`, 45, 38);

  doc.setFont('helvetica', 'bold');
  doc.text('Attended:', 70, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${overall.totalAttended || 0}`, 90, 38);

  doc.setFont('helvetica', 'bold');
  doc.text('Absent:', 115, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${overall.totalAbsent || 0}`, 130, 38);

  doc.setFont('helvetica', 'bold');
  doc.text('Percentage:', 155, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${overall.overallPercentage || 0}%`, 178, 38);

  const subjects = studentSummary.subjects || [];
  const rows = subjects.map((sub, idx) => [
    idx + 1,
    sub.subjectName,
    sub.teacherName,
    sub.totalHeld,
    sub.attended,
    sub.absent,
    `${sub.percentage}%`,
    sub.percentage >= 75 ? 'Eligible' : 'Shortage'
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Subject', 'Teacher', 'Held', 'Attended', 'Absent', 'Percentage', 'Status']],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      halign: 'center'
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 50, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'left' },
      3: { cellWidth: 15 },
      4: { cellWidth: 18, textColor: [16, 120, 60] },
      5: { cellWidth: 18, textColor: [220, 38, 38] },
      6: { cellWidth: 20, fontStyle: 'bold' },
      7: { cellWidth: 22 }
    }
  });

  doc.save(`Attendance_Roll_${studentSummary.rollNumber}.pdf`);
}
