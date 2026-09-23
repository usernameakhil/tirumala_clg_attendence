import React from 'react';
import { LogOut } from 'lucide-react';

export default function Navbar({ isTeacherRoute, teacher, onTeacherLogout, studentRoll, onChangeStudentRoll }) {
  if (isTeacherRoute) {
    return (
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg">College Attendance</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Faculty Portal
            </span>
          </div>

          {teacher && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800">{teacher.name}</div>
                <div className="text-xs text-slate-500">ID: {teacher.id}</div>
              </div>
              <button
                onClick={onTeacherLogout}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Student Navbar (Completely separate, NO teacher links)
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-lg">College Attendance</span>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
            Student
          </span>
        </div>

        {studentRoll && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-800 font-bold">
              Roll: {studentRoll}
            </span>
            <button
              onClick={onChangeStudentRoll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Check another roll number
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
