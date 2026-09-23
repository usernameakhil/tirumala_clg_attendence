import React, { useState } from 'react';
import { X } from 'lucide-react';
import { managementApi } from '../../services/managementApi';

export default function TeacherFormModal({ token, editTeacher, onClose, onSaved }) {
  const isEdit = !!editTeacher;

  const [teacherId, setTeacherId] = useState(editTeacher?.teacherId || '');
  const [name, setName] = useState(editTeacher?.name || '');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(editTeacher?.department || '');
  const [designation, setDesignation] = useState(editTeacher?.designation || '');
  const [email, setEmail] = useState(editTeacher?.email || '');
  const [canCreate, setCanCreate] = useState(editTeacher?.permissions?.canCreateClasses !== false);
  const [canEdit, setCanEdit] = useState(editTeacher?.permissions?.canEditAttendance !== false);
  const [canExport, setCanExport] = useState(editTeacher?.permissions?.canExportPDF !== false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teacherId.trim() || !name.trim()) {
      setError('Teacher ID and Name are required.');
      return;
    }
    if (!isEdit && !password.trim()) {
      setError('Password is required when creating a new teacher.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        teacherId: teacherId.trim().toUpperCase(),
        name: name.trim(),
        department: department.trim(),
        designation: designation.trim(),
        email: email.trim(),
        permissions: {
          canCreateClasses: canCreate,
          canEditAttendance: canEdit,
          canExportPDF: canExport
        }
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (isEdit) {
        await managementApi.updateTeacher(token, editTeacher._id, payload);
      } else {
        payload.password = password.trim();
        await managementApi.createTeacher(token, payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-slate-200 my-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Teacher Account' : 'Add New Teacher'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? `Editing: ${editTeacher.name} (${editTeacher.teacherId})` : 'Fill in all required details'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teacher ID / Roll Number *
              </label>
              <input
                type="text"
                required
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value.toUpperCase())}
                placeholder="e.g. TECH103"
                disabled={isEdit}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:border-slate-700 disabled:bg-slate-100 disabled:text-slate-500"
              />
              {isEdit && (
                <p className="text-[10px] text-slate-400 mt-1">ID cannot be changed after creation</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Set a password'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Ananya Iyer"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Assistant Professor"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teacher@college.edu"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-700"
            />
          </div>

          {/* Permissions */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-2">Permissions</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canCreate}
                  onChange={(e) => setCanCreate(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-xs text-slate-700">Allow creating classes and adding students</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canEdit}
                  onChange={(e) => setCanEdit(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-xs text-slate-700">Allow marking and editing attendance</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canExport}
                  onChange={(e) => setCanExport(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-xs text-slate-700">Allow downloading attendance PDF reports</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
