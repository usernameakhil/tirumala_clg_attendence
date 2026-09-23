import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Edit3, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { generateClassAttendancePDF } from '../utils/pdfExport';
import MarkAttendanceModal from './MarkAttendanceModal';

export default function ClassDetailView({ classId, teacher, onBack, showToast }) {
  const [classData, setClassData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'students'

  // Modal
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedEditDate, setSelectedEditDate] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [clsRes, sessRes, matRes] = await Promise.all([
        api.getClassById(classId),
        api.getClassAttendance(classId),
        api.getClassMatrix(classId)
      ]);
      if (clsRes.success) setClassData(clsRes.class);
      if (sessRes.success) setSessions(sessRes.sessions);
      if (matRes.success) setMatrixData(matRes);
    } catch (err) {
      if (showToast) showToast('Failed to load class details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchDetails();
    }
  }, [classId]);

  const handleOpenMarkAttendance = (targetDate = null) => {
    setSelectedEditDate(targetDate);
    setAttendanceModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    try {
      if (showToast) showToast('Generating PDF attendance sheet...', 'info');
      const fresh = await api.getClassMatrix(classId);
      if (fresh.success) {
        generateClassAttendancePDF(fresh);
        if (showToast) showToast('PDF downloaded successfully!', 'success');
      }
    } catch (err) {
      if (showToast) showToast('Failed to download PDF', 'error');
    }
  };

  const handleDeleteSession = async (sessionId, sessionDate) => {
    if (!window.confirm(`Delete attendance record for ${sessionDate}?`)) return;
    try {
      const res = await api.deleteAttendance(sessionId);
      if (res.success) {
        if (showToast) showToast(`Deleted attendance for ${sessionDate}`, 'info');
        fetchDetails();
      }
    } catch (err) {
      if (showToast) showToast('Failed to delete session', 'error');
    }
  };

  if (loading && !classData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-sm text-slate-500">
        Loading class details...
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <p className="text-sm text-slate-600 mb-4">Class not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Back to Classes
        </button>
      </div>
    );
  }

  const enrolledStudents = matrixData?.students || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Classes</span>
        </button>
      </div>

      {/* Class Header Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {classData.subjectCode || 'CLASS'}
              </span>
              <span className="text-xs text-slate-500">Section {classData.section}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{classData.semester}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{classData.subjectName}</h1>
            <p className="text-xs text-slate-500 mt-1">Teacher: {classData.teacherName}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenMarkAttendance(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Take Attendance</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 text-center">
          <div>
            <div className="text-xs text-slate-500">Total Students</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{enrolledStudents.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Classes Conducted</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{sessions.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Class Average</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{matrixData?.averagePercentage || 0}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'sessions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Attendance Records ({sessions.length} Days)
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Student List ({enrolledStudents.length} Students)
        </button>
      </div>

      {/* TAB 1: Sessions History with Edit Day Option */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>List of attendance marked by date. Click <strong>Edit</strong> on any day to change records.</span>
            <button
              onClick={() => handleOpenMarkAttendance(null)}
              className="text-blue-600 hover:underline font-semibold"
            >
              + Mark Today
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              No attendance marked yet. Click "Take Attendance" to mark your first class.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {sessions.map((sess) => (
                <div
                  key={sess._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{sess.date}</span>
                      {sess.sessionTime && (
                        <span className="text-xs text-slate-400">({sess.sessionTime})</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 font-medium">
                      {sess.sessionTopic || 'Regular Class'}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-emerald-700 font-semibold">{sess.presentCount} Present</span>
                      <span className="text-red-700 font-semibold">{sess.absentCount} Absent</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{sess.percentage}% Turnout</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => handleOpenMarkAttendance(sess.date)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Attendance</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSession(sess._id, sess.date)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Student List & Percentage */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Roll Number</th>
                  <th className="p-3.5">Classes Held</th>
                  <th className="p-3.5 text-emerald-700">Present</th>
                  <th className="p-3.5 text-red-700">Absent</th>
                  <th className="p-3.5">Percentage</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {enrolledStudents.map((st) => {
                  const isStEligible = st.percentage >= 75;
                  return (
                    <tr key={st.rollNumber} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{st.rollNumber}</td>
                      <td className="p-3.5">{st.totalHeld}</td>
                      <td className="p-3.5 font-bold text-emerald-700">{st.presentCount}</td>
                      <td className="p-3.5 font-bold text-red-700">{st.absentCount}</td>
                      <td className="p-3.5 font-bold">{st.percentage}%</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                            isStEligible
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isStEligible ? 'Eligible' : 'Shortage (<75%)'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Marking / Editing Attendance */}
      {attendanceModalOpen && (
        <MarkAttendanceModal
          classData={classData}
          initialDate={selectedEditDate}
          onClose={() => {
            setAttendanceModalOpen(false);
            setSelectedEditDate(null);
          }}
          onSaved={() => {
            fetchDetails();
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}
