import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function MarkAttendanceModal({
  classData,
  initialDate,
  onClose,
  onSaved,
  showToast
}) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(initialDate || getToday());
  const [sessionTopic, setSessionTopic] = useState('Regular Class');
  const [records, setRecords] = useState([]);
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAttendanceForDate = async (targetDate) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAttendanceByDate(classData._id, targetDate);
      if (res.success) {
        setIsExisting(res.exists);
        setSessionTopic(res.sessionTopic || 'Regular Class');
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const fallback = (classData.students || []).map(s => ({
        rollNumber: s.rollNumber,
        status: 'Present',
        remarks: ''
      }));
      setRecords(fallback);
      setIsExisting(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classData?._id) {
      loadAttendanceForDate(date);
    }
  }, [date, classData?._id]);

  const setStudentStatus = (rollNumber, status) => {
    setRecords(prev =>
      prev.map(r => (r.rollNumber === rollNumber ? { ...r, status } : r))
    );
  };

  const markAll = (status) => {
    setRecords(prev => prev.map(r => ({ ...r, status })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        classId: classData._id,
        date,
        sessionTopic: sessionTopic.trim() || 'Regular Class',
        markedBy: classData.teacherId,
        records
      };

      const res = await api.markAttendance(payload);
      if (res.success) {
        if (showToast) {
          showToast(isExisting ? `Attendance updated for ${date}` : `Attendance saved for ${date}`, 'success');
        }
        onSaved();
        onClose();
      } else {
        setError(res.message || 'Failed to save attendance.');
      }
    } catch (err) {
      setError(err.message || 'Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.length - presentCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-lg border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-600 mb-0.5">
              {isExisting ? 'Editing Existing Attendance' : 'Marking New Attendance'}
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {classData.subjectName} (Sec {classData.section})
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date and Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Topic
              </label>
              <input
                type="text"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                placeholder="e.g. Chapter 3 Review"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Quick All Buttons and Counter */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => markAll('Present')}
                className="text-xs px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('Absent')}
                className="text-xs px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded"
              >
                Mark All Absent
              </button>
            </div>

            <div className="text-xs font-medium text-slate-600">
              <span className="text-emerald-700 font-bold">{presentCount} P</span> /{' '}
              <span className="text-red-700 font-bold">{absentCount} A</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Students List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading student list...</div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No students registered in this class.</div>
          ) : (
            records.map((r, idx) => {
              const isPresent = r.status === 'Present';
              return (
                <div
                  key={r.rollNumber}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono w-4">{idx + 1}.</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{r.rollNumber}</span>
                  </div>

                  {/* Present / Absent buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStudentStatus(r.rollNumber, 'Present')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentStatus(r.rollNumber, 'Absent')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        !isPresent
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || records.length === 0}
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            {saving ? 'Saving...' : isExisting ? 'Update Attendance' : 'Save Attendance'}
          </button>
        </div>

      </div>
    </div>
  );
}
