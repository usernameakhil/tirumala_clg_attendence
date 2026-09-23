import React, { useState, useEffect } from 'react';
import { Plus, Download, ChevronRight, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import CreateClassModal from './CreateClassModal';
import ClassDetailView from './ClassDetailView';
import { generateClassAttendancePDF } from '../utils/pdfExport';

export default function TeacherDashboard({ teacher, onLogout, showToast }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.getClasses(teacher.id);
      if (res.success) {
        setClasses(res.classes || []);
      }
    } catch (err) {
      if (showToast) showToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher?.id) {
      fetchClasses();
    }
  }, [teacher?.id]);

  const handleDeleteClass = async (e, classId, subjectName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${subjectName}" and all its attendance records?`)) {
      return;
    }
    try {
      const res = await api.deleteClass(classId);
      if (res.success) {
        if (showToast) showToast(`Class "${subjectName}" deleted`, 'info');
        fetchClasses();
      }
    } catch (err) {
      if (showToast) showToast('Failed to delete class', 'error');
    }
  };

  const handleQuickDownloadPDF = async (e, classId) => {
    e.stopPropagation();
    try {
      if (showToast) showToast('Generating PDF...', 'info');
      const matrixRes = await api.getClassMatrix(classId);
      if (matrixRes.success) {
        generateClassAttendancePDF(matrixRes);
        if (showToast) showToast('PDF downloaded successfully!', 'success');
      }
    } catch (err) {
      if (showToast) showToast('Failed to generate PDF', 'error');
    }
  };

  if (selectedClassId) {
    return (
      <ClassDetailView
        classId={selectedClassId}
        teacher={teacher}
        onBack={() => {
          setSelectedClassId(null);
          fetchClasses();
        }}
        showToast={showToast}
      />
    );
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalClassesTaken = classes.reduce((sum, c) => sum + (c.totalSessions || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {teacher.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Department: {teacher.department} • Faculty ID: <span className="font-mono font-semibold">{teacher.id}</span>
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">My Classes</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{classes.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Enrolled Students</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalStudents}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Classes Conducted</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalClassesTaken}</div>
        </div>
      </div>

      {/* Classes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your Classes</h2>
          <span className="text-xs text-slate-500">
            Click any class to take or edit attendance
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            Loading classes...
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm space-y-3">
            <p>You haven't created any classes yet.</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls._id}
                onClick={() => setSelectedClassId(cls._id)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {cls.subjectCode || 'CLASS'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Sec {cls.section}</span>
                      <button
                        onClick={(e) => handleDeleteClass(e, cls._id, cls.subjectName)}
                        className="p-1 text-slate-300 hover:text-red-600 rounded transition"
                        title="Delete class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {cls.subjectName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {cls.semester}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Students</span>
                      <strong className="text-slate-800 font-semibold">{cls.studentCount} Roll Numbers</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Classes Taken</span>
                      <strong className="text-slate-800 font-semibold">{cls.totalSessions} Sessions</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => handleQuickDownloadPDF(e, cls._id)}
                    className="text-xs font-medium text-slate-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                    <span>Open</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createModalOpen && (
        <CreateClassModal
          teacher={teacher}
          onClose={() => setCreateModalOpen(false)}
          onCreated={(newCls) => {
            fetchClasses();
            setSelectedClassId(newCls._id);
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}
