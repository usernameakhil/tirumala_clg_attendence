import React, { useState } from 'react';
import { api } from '../services/api';
import StudentDashboard from './StudentDashboard';

export default function StudentPortal({ initialRoll, onSetRoll, showToast }) {
  const [rollInput, setRollInput] = useState(initialRoll || '');
  const [loading, setLoading] = useState(false);
  const [studentSummary, setStudentSummary] = useState(null);
  const [error, setError] = useState('');

  const fetchAttendance = async (roll) => {
    if (!roll || !roll.trim()) {
      setError('Please enter your roll number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const trimmed = roll.trim().toUpperCase();
      const res = await api.getStudentSummary(trimmed);

      if (res.success) {
        if (!res.isRegistered) {
          setError(`Roll number "${trimmed}" was not found in any class. Please contact your teacher.`);
          setStudentSummary(null);
        } else {
          setStudentSummary(res);
          localStorage.setItem('studentRoll', trimmed);
          if (onSetRoll) onSetRoll(trimmed);
        }
      } else {
        setError(res.message || 'Could not find attendance for this roll number.');
      }
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAttendance(rollInput);
  };

  if (studentSummary) {
    return (
      <StudentDashboard
        studentSummary={studentSummary}
        onRefresh={() => fetchAttendance(studentSummary.rollNumber)}
        onChangeRoll={() => {
          setStudentSummary(null);
          setRollInput('');
          localStorage.removeItem('studentRoll');
          if (onSetRoll) onSetRoll('');
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Check Your Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your student roll number below to view your attendance.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              required
              value={rollInput}
              onChange={(e) => setRollInput(e.target.value.toUpperCase())}
              placeholder="e.g. 101"
              className="w-full px-3.5 py-3 rounded-lg border border-slate-300 text-base focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 uppercase font-mono tracking-wide"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'View Attendance'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            No password required. Just type your roll number and click View Attendance.
          </p>
        </div>

      </div>
    </div>
  );
}
