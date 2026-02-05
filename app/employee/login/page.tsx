'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeCode: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/employee-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store employee data in localStorage
        localStorage.setItem('employeeData', JSON.stringify(data.employee));
        
        // Redirect to dashboard
        router.push('/employee/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Citizen Saving and Credit<br />Cooperative Society
          </h1>
          <p className="text-slate-600">Employee Self-Service Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Welcome Back</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="employeeCode" className="block text-sm font-medium text-slate-700 mb-2">
                Employee Code
              </label>
              <input
                type="text"
                id="employeeCode"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your employee code"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your mobile number"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Default password is your registered mobile number
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>Need help? Contact HR at <span className="text-blue-600 font-medium">hr@citizencooperative.in</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 Citizen Saving and Credit Cooperative Society</p>
          <p className="mt-1">All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
