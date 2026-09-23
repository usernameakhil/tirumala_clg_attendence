import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { generateStudentReportPDF } from '../utils/pdfExport';

export default function StudentDashboard({
  studentSummary,
  onRefresh,
  onChangeRoll,
  showToast
}) {
  const [expandedSubject, setExpandedSubject] = useState(null);

  const { rollNumber, overall = {}, subjects = [] } = studentSummary;
  const isEligible = overall.overallPercentage >= 75;

  const toggleSubject = (classId) => {
    setExpandedSubject(expandedSubject === classId ? null : classId);
  };

  const handleDownloadPDF = () => {
    try {
      generateStudentReportPDF(studentSummary);
      if (showToast) showToast('Attendance report downloaded!', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to download PDF', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onChangeRoll}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Check another roll number</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance for Roll No: <span className="font-mono text-blue-700">{rollNumber}</span>
          </h1>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Overall Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Overall Attendance Summary
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Total Classes</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{overall.totalClasses}</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg">
            <div className="text-xs text-emerald-700 font-medium">Attended</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{overall.totalAttended}</div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-xs text-red-700 font-medium">Absent</div>
            <div className="text-2xl font-bold text-red-800 mt-1">{overall.totalAbsent}</div>
          </div>

          <div className={`p-3 rounded-lg ${isEligible ? 'bg-blue-50' : 'bg-red-50'}`}>
            <div className={`text-xs font-medium ${isEligible ? 'text-blue-700' : 'text-red-700'}`}>
              Total Percentage
            </div>
            <div className={`text-2xl font-bold mt-1 ${isEligible ? 'text-blue-800' : 'text-red-800'}`}>
              {overall.overallPercentage}%
            </div>
          </div>
        </div>

        {/* Status line */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Exam Status:</span>
            {isEligible ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Eligible for Exams (75% or above)
              </span>
            ) : (
              <span className="text-red-700 font-bold bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                Low Attendance (Below 75%)
              </span>
            )}
          </div>

          <span className="text-slate-400 hidden sm:inline">
            Minimum 75% required
          </span>
        </div>
      </div>

      {/* Subject-Wise List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Your Subjects ({subjects.length})
        </h2>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No subjects found for this roll number.
          </div>
        ) : (
          subjects.map((sub) => {
            const isSubEligible = sub.percentage >= 75;
            const isExpanded = expandedSubject === sub.classId;

            return (
              <div
                key={sub.classId}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Subject Header */}
                <div
                  onClick={() => toggleSubject(sub.classId)}
                  className="p-5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-base">
                          {sub.subjectName}
                        </span>
                        {sub.subjectCode && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            {sub.subjectCode}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">Sec {sub.section}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Teacher: <span className="text-slate-700 font-medium">{sub.teacherName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-right">
                        <div className={`text-xl font-bold ${isSubEligible ? 'text-emerald-600' : 'text-red-600'}`}>
                          {sub.percentage}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {sub.attended} of {sub.totalHeld} attended
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isSubEligible ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expanded Date-Wise Log */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-200">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Class History ({sub.sessions.length} Days)
                    </h3>

                    {sub.sessions.length === 0 ? (
                      <div className="text-xs text-slate-400 py-2">No attendance marked yet.</div>
                    ) : (
                      <div className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200">
                        {sub.sessions.map((sess, idx) => {
                          const isPresent = sess.status === 'Present';
                          return (
                            <div
                              key={sess.attendanceId || idx}
                              className="p-3 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-semibold text-slate-800">{sess.date}</div>
                                <div className="text-slate-500 text-[11px] mt-0.5">{sess.sessionTopic}</div>
                              </div>

                              <span
                                className={`font-semibold px-2.5 py-1 rounded text-xs ${
                                  isPresent
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {sess.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
