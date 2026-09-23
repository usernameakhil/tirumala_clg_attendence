import React, { useState } from 'react';
import { api } from '../services/api';

export default function TeacherLogin({ onLoginSuccess }) {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teacherId.trim() || !password) {
      setError('Please enter both your Teacher ID and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.teacherLogin(teacherId.trim(), password);
      if (res.success && res.teacher) {
        localStorage.setItem('teacherData', JSON.stringify(res.teacher));
        onLoginSuccess(res.teacher);
      } else {
        setError(res.message || 'Invalid Teacher ID or password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Teacher Login</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your Teacher ID and password to manage your classes and attendance.
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
              Teacher ID
            </label>
            <input
              type="text"
              required
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value.toUpperCase())}
              placeholder="e.g. TECH101"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
