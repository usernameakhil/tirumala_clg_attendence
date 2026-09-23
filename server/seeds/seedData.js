const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

const SAMPLE_STUDENTS = ['101', '102', '103', '104', '105'];

async function seedDatabase(force = false) {
  try {
    const existingClassesCount = await Class.countDocuments();
    if (existingClassesCount > 0 && !force) {
      console.log(`Database already has ${existingClassesCount} classes.`);
      return;
    }

    // Clear existing data
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Teacher.deleteMany({});
    console.log('Cleared old data from MongoDB.');

    console.log('🌱 Seeding 2 sample teachers...');

    // Seed 2 teachers into DB (no more hardcoding, managed via admin panel)
    const t1 = await new Teacher({
      teacherId: 'TECH101',
      name: 'Dr. Sarah Sharma',
      password: 'password123',
      department: 'Computer Science',
      designation: 'Associate Professor',
      email: 'sarah@college.edu',
      isActive: true
    }).save();

    const t2 = await new Teacher({
      teacherId: 'TECH102',
      name: 'Prof. Rajesh Verma',
      password: 'password123',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      email: 'rajesh@college.edu',
      isActive: true
    }).save();

    console.log('🌱 Adding 2 example classes for testing...');

    // Class 1 - TECH101
    const class1 = new Class({
      teacherId: 'TECH101',
      teacherName: 'Dr. Sarah Sharma',
      subjectName: 'Web Development',
      subjectCode: 'CS301',
      section: 'A',
      semester: 'Semester 5',
      academicYear: '2026',
      description: 'HTML, CSS, JavaScript, React and Node.js basics',
      students: SAMPLE_STUDENTS.map(roll => ({ rollNumber: roll, studentName: '' }))
    });
    await class1.save();

    await new Attendance({
      classId: class1._id,
      date: '2026-09-20',
      sessionTime: '10:00 AM - 11:00 AM',
      sessionTopic: 'Introduction to Web Basics',
      markedBy: 'TECH101',
      records: [
        { rollNumber: '101', status: 'Present' },
        { rollNumber: '102', status: 'Present' },
        { rollNumber: '103', status: 'Absent' },
        { rollNumber: '104', status: 'Present' },
        { rollNumber: '105', status: 'Present' }
      ]
    }).save();

    await new Attendance({
      classId: class1._id,
      date: '2026-09-22',
      sessionTime: '10:00 AM - 11:00 AM',
      sessionTopic: 'React Components and State',
      markedBy: 'TECH101',
      records: [
        { rollNumber: '101', status: 'Present' },
        { rollNumber: '102', status: 'Absent' },
        { rollNumber: '103', status: 'Present' },
        { rollNumber: '104', status: 'Present' },
        { rollNumber: '105', status: 'Absent' }
      ]
    }).save();

    // Class 2 - TECH102
    const class2 = new Class({
      teacherId: 'TECH102',
      teacherName: 'Prof. Rajesh Verma',
      subjectName: 'Database Systems',
      subjectCode: 'CS302',
      section: 'B',
      semester: 'Semester 5',
      academicYear: '2026',
      description: 'SQL queries, tables, and database design',
      students: SAMPLE_STUDENTS.slice(0, 4).map(roll => ({ rollNumber: roll, studentName: '' }))
    });
    await class2.save();

    await new Attendance({
      classId: class2._id,
      date: '2026-09-21',
      sessionTime: '11:30 AM - 12:30 PM',
      sessionTopic: 'Introduction to SQL',
      markedBy: 'TECH102',
      records: [
        { rollNumber: '101', status: 'Present' },
        { rollNumber: '102', status: 'Present' },
        { rollNumber: '103', status: 'Present' },
        { rollNumber: '104', status: 'Absent' }
      ]
    }).save();

    await new Attendance({
      classId: class2._id,
      date: '2026-09-23',
      sessionTime: '11:30 AM - 12:30 PM',
      sessionTopic: 'Tables and Keys',
      markedBy: 'TECH102',
      records: [
        { rollNumber: '101', status: 'Present' },
        { rollNumber: '102', status: 'Present' },
        { rollNumber: '103', status: 'Absent' },
        { rollNumber: '104', status: 'Present' }
      ]
    }).save();

    console.log('✅ Seeded 2 teachers and 2 sample classes successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = { seedDatabase };
