import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

export default function CreateClassModal({ teacher, onClose, onCreated, showToast }) {
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState('Semester 1');
  const [studentRolls, setStudentRolls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subjectName.trim()) {
      setError('Please provide a subject name.');
      return;
    }

    if (!studentRolls.trim()) {
      setError('Please provide at least one student roll number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        section: section.trim(),
        semester: semester.trim(),
        studentRolls: studentRolls.trim()
      };

      const res = await api.createClass(payload);
      if (res.success && res.class) {
        if (showToast) {
          showToast(`Class "${res.class.subjectName}" created successfully!`, 'success');
        }
        onCreated(res.class);
        onClose();
      } else {
        setError(res.message || 'Failed to create class.');
      }
    } catch (err) {
      setError(err.message || 'Error creating class.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg border border-slate-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Class</h2>
            <p className="text-xs text-slate-500">Teacher: {teacher.name} ({teacher.id})</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Operating Systems, Mathematics"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS201"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs uppercase font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                placeholder="e.g. A"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs uppercase focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Semester 3"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Roll Numbers *
            </label>
            <textarea
              rows={4}
              required
              value={studentRolls}
              onChange={(e) => setStudentRolls(e.target.value)}
              placeholder="Enter roll numbers separated by commas, newlines, or range:&#10;e.g. 101 to 130&#10;or 101, 102, 103, 104"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: You can type a range like <code>101-130</code> to add all numbers automatically.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
