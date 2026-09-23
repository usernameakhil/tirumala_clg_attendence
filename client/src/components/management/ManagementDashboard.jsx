import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Power, RefreshCw, LogOut, BookOpen, Users, CheckCircle2, XCircle } from 'lucide-react';
import { managementApi } from '../../services/managementApi';
import TeacherFormModal from './TeacherFormModal';

export default function ManagementDashboard({ token, onLogout }) {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // null | 'create' | { teacher }
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [teachersRes, statsRes] = await Promise.all([
        managementApi.getTeachers(token),
        managementApi.getStats(token)
      ]);
      if (teachersRes.success) setTeachers(teachersRes.teachers || []);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleStatus = async (teacher) => {
    setActionLoading(teacher._id + '_toggle');
    try {
      const res = await managementApi.toggleTeacherStatus(token, teacher._id);
      if (res.success) {
        setTeachers(prev =>
          prev.map(t => t._id === teacher._id ? { ...t, isActive: res.isActive } : t)
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.name} (${teacher.teacherId})?\nThis will not delete their classes or attendance records.`)) return;
    setActionLoading(teacher._id + '_delete');
    try {
      const res = await managementApi.deleteTeacher(token, teacher._id);
      if (res.success) {
        setTeachers(prev => prev.filter(t => t._id !== teacher._id));
        await fetchAll();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg">Management Panel</span>
              <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Control teacher accounts, passwords, and permissions</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Total Teachers</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTeachers}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-emerald-600 font-medium">Active Teachers</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.activeTeachers}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Total Classes</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalClasses}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Attendance Records</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAttendance}</div>
            </div>
          </div>
        )}

        {/* Teachers Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Teacher Accounts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, change passwords, set permissions, or disable teacher logins from here.
              </p>
            </div>

            <button
              onClick={() => setFormModal('create')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400">Loading teacher accounts...</div>
          ) : teachers.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              <p>No teachers added yet.</p>
              <button
                onClick={() => setFormModal('create')}
                className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Add First Teacher
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Teacher ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Department</th>
                    <th className="px-4 py-3 hidden md:table-cell">Password</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell">Permissions</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Classes</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const isToggling = actionLoading === t._id + '_toggle';
                    const isDeleting = actionLoading === t._id + '_delete';
                    return (
                      <tr key={t._id} className={`hover:bg-slate-50 ${!t.isActive ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{t.teacherId}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{t.name}</div>
                          <div className="text-slate-400 text-[11px]">{t.email || '—'}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-slate-600">
                          <div>{t.department}</div>
                          <div className="text-slate-400 text-[11px]">{t.designation}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-mono">
                            {t.password}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          {t.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              <XCircle className="w-3 h-3" /> Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-col gap-0.5 text-[11px]">
                            <span className={t.permissions?.canCreateClasses ? 'text-emerald-700' : 'text-slate-400'}>
                              {t.permissions?.canCreateClasses ? '✓' : '✗'} Create Classes
                            </span>
                            <span className={t.permissions?.canEditAttendance ? 'text-emerald-700' : 'text-slate-400'}>
                              {t.permissions?.canEditAttendance ? '✓' : '✗'} Edit Attendance
                            </span>
                            <span className={t.permissions?.canExportPDF ? 'text-emerald-700' : 'text-slate-400'}>
                              {t.permissions?.canExportPDF ? '✓' : '✗'} Export PDF
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-slate-700 font-semibold">
                          {t.classCount || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit */}
                            <button
                              onClick={() => setFormModal({ teacher: t })}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit teacher"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Enable / Disable */}
                            <button
                              onClick={() => handleToggleStatus(t)}
                              disabled={isToggling}
                              className={`p-1.5 rounded-lg transition ${
                                t.isActive
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={t.isActive ? 'Disable login' : 'Enable login'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(t)}
                              disabled={isDeleting}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete teacher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-white rounded-xl border border-amber-200 p-4 text-xs text-amber-700 space-y-1">
          <div className="font-bold text-sm text-amber-800 mb-1">How this works</div>
          <p>• <strong>Add Teacher</strong> — creates a new teacher login. The teacher can then sign in at the Teacher Portal URL using the ID and password you set here.</p>
          <p>• <strong>Edit</strong> — change the teacher's name, department, password, or permissions at any time. Changes take effect on the next login.</p>
          <p>• <strong>Disable / Enable (⏻)</strong> — blocks or restores a teacher's login without deleting their data.</p>
          <p>• <strong>Delete</strong> — removes the teacher account. Their existing classes and attendance records are kept in the database.</p>
          <p>• <strong>Permissions</strong> — control whether a teacher can create classes, edit attendance, or download PDF reports.</p>
        </div>

      </div>

      {/* Form Modal */}
      {formModal === 'create' && (
        <TeacherFormModal
          token={token}
          editTeacher={null}
          onClose={() => setFormModal(null)}
          onSaved={fetchAll}
        />
      )}
      {formModal && formModal.teacher && (
        <TeacherFormModal
          token={token}
          editTeacher={formModal.teacher}
          onClose={() => setFormModal(null)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
