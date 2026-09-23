import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TeacherLogin from './components/TeacherLogin';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import ManagementLogin from './components/management/ManagementLogin';
import ManagementDashboard from './components/management/ManagementDashboard';
import Toast from './components/Toast';

export default function App() {
  // Check routes
  const [currentRoute, setCurrentRoute] = useState(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    if (
      pathname.startsWith('/admin-panel') ||
      pathname.startsWith('/mgmt-panel') ||
      pathname.startsWith('/sys-admin-mgmt') ||
      search.includes('portal=admin') ||
      search.includes('portal=mgmt')
    ) {
      return 'mgmt';
    }
    
    if (pathname.startsWith('/teacher') || search.includes('portal=teacher')) {
      return 'teacher';
    }
    
    return 'student';
  });

  // Admin token state
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('adminToken') || '';
  });

  // Teacher state
  const [teacher, setTeacher] = useState(() => {
    try {
      const saved = localStorage.getItem('teacherData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Student roll state
  const [studentRoll, setStudentRoll] = useState(() => {
    return localStorage.getItem('studentRoll') || '';
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Listen to popstate (browser back/forward navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      const search = window.location.search;

      if (
        pathname.startsWith('/admin-panel') ||
        pathname.startsWith('/mgmt-panel') ||
        pathname.startsWith('/sys-admin-mgmt') ||
        search.includes('portal=admin') ||
        search.includes('portal=mgmt')
      ) {
        setCurrentRoute('mgmt');
      } else if (pathname.startsWith('/teacher') || search.includes('portal=teacher')) {
        setCurrentRoute('teacher');
      } else {
        setCurrentRoute('student');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleTeacherLogout = () => {
    localStorage.removeItem('teacherData');
    setTeacher(null);
    showToast('Logged out successfully', 'info');
  };

  const handleTeacherLoginSuccess = (teacherData) => {
    setTeacher(teacherData);
    showToast(`Welcome, ${teacherData.name}`, 'success');
  };

  const handleAdminLoginSuccess = (token) => {
    sessionStorage.setItem('adminToken', token);
    setAdminToken(token);
    showToast('Admin logged in successfully', 'success');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAdminToken('');
    showToast('Admin logged out', 'info');
  };

  // MANAGEMENT LAYER: Self-contained dedicated UI, completely hidden from students & teachers
  if (currentRoute === 'mgmt') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        {adminToken ? (
          <ManagementDashboard
            token={adminToken}
            onLogout={handleAdminLogout}
          />
        ) : (
          <ManagementLogin
            onLoginSuccess={handleAdminLoginSuccess}
          />
        )}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // STANDARD PORTALS (Teacher at /teacher, Student at /)
  const isTeacherRoute = currentRoute === 'teacher';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navbar with role-specific views */}
      <Navbar
        isTeacherRoute={isTeacherRoute}
        teacher={teacher}
        onTeacherLogout={handleTeacherLogout}
        studentRoll={studentRoll}
        onChangeStudentRoll={() => {
          setStudentRoll('');
          localStorage.removeItem('studentRoll');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {isTeacherRoute ? (
          // TEACHER PORTAL (Accessible strictly via /teacher URL)
          teacher ? (
            <TeacherDashboard
              teacher={teacher}
              onLogout={handleTeacherLogout}
              showToast={showToast}
            />
          ) : (
            <TeacherLogin
              onLoginSuccess={handleTeacherLoginSuccess}
            />
          )
        ) : (
          // STUDENT PORTAL (Default on / root URL — zero access to teacher or admin controls)
          <StudentPortal
            initialRoll={studentRoll}
            onSetRoll={(roll) => setStudentRoll(roll)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Simple Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>College Attendance System</span>
          <span className="text-slate-400">
            {isTeacherRoute ? 'Faculty Section' : 'Student Attendance Portal'}
          </span>
        </div>
      </footer>
    </div>
  );
}
