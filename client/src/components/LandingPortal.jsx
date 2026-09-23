import React from 'react';
import {
  Users,
  BookOpen,
  FileSpreadsheet,
  CheckCircle,
  Smartphone,
  Calendar,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function LandingPortal({ onSelectRole, teachersList, onQuickStudentLogin, onQuickTeacherLogin }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Next-Gen College Attendance Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Unified Attendance for <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Teachers</span> & <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Students</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Take attendance with one tap, edit past dates effortlessly, generate official class PDFs, and let students check attendance percentages instantly with just their roll number.
        </p>
      </div>

      {/* Two Portal Cards (Mobile First) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
        {/* Teacher Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> ID & Password Required
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Teacher Side</h2>
            <p className="text-sm text-slate-600 mb-6">
              Create subjects and classes, bulk enroll roll numbers, mark daily attendance, edit past session logs, and export official attendance reports in PDF.
            </p>

            <ul className="space-y-2.5 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Create classes with custom subjects & sections</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bulk roll number importer (range e.g. 101-130)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1-Tap daily attendance & date-wise editor</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Download full class attendance sheet in PDF</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              onClick={() => onSelectRole('teacher')}
              className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition active:scale-[0.99] mobile-touch-target"
            >
              <span>Enter Teacher Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Teachers */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Demo Login (1-Click):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(teachersList || []).slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onQuickTeacherLogin(t.id, 'password123')}
                    className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-2.5 py-1 rounded-lg transition"
                  >
                    {t.name.split(' ')[0]} ({t.id})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> No Password Required
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Side</h2>
            <p className="text-sm text-slate-600 mb-6">
              Students simply enter their roll number to view complete attendance across all enrolled subjects, classes attended, absent count, and total percentages.
            </p>

            <ul className="space-y-2.5 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero login password friction — just enter Roll Number</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Total classes conducted, attended, and absent</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time percentage & 75% exam eligibility gauge</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Detailed session-by-session history & PDF report</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              onClick={() => onSelectRole('student')}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition active:scale-[0.99] mobile-touch-target"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Students */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Test Roll Numbers (1-Click):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['22CS101', '22CS102', '22CS105', '22CS110'].map((roll) => (
                  <button
                    key={roll}
                    onClick={() => onQuickStudentLogin(roll)}
                    className="text-[11px] font-mono font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-lg transition"
                  >
                    {roll}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <Smartphone className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">100% Mobile Ready</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Optimized for phones & tablets</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Edit Any Date</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Modify past session attendance</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <Download className="w-6 h-6 text-violet-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Official PDF Export</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Download full class ledger</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <FileSpreadsheet className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Multi-Teacher Support</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Hardcoded teacher profiles</p>
        </div>
      </div>
    </div>
  );
}
