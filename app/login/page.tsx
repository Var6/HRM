'use client';
import React, { useState } from 'react';
import { Building2, Lock, User, ArrowRight, Eye, EyeOff, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Role = 'employee' | 'admin';

const ADMIN_USERNAME = 'Citizen Cooperative';
const ADMIN_PASSWORD = 'India@1947';

export default function LoginPage() {
  const [role, setRole] = useState<Role>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
    setError('');
    setFormData({ identifier: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (role === 'admin') {
        await new Promise(r => setTimeout(r, 600));
        if (formData.identifier === ADMIN_USERNAME && formData.password === ADMIN_PASSWORD) {
          localStorage.setItem('hrSession', JSON.stringify({
            username: formData.identifier,
            role: 'HR Admin',
            loginTime: new Date().toISOString()
          }));
          router.push('/Dashboard');
        } else {
          setError('Invalid username or password.');
        }
      } else {
        const response = await fetch('/api/employee-auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeCode: formData.identifier, password: formData.password }),
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('employeeData', JSON.stringify(data.employee));
          router.push('/employee/dashboard');
        } else {
          setError(data.message || 'Invalid credentials');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home</span>
        </Link>

        <div className="relative">
          <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
            isAdmin
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20'
              : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20'
          }`}></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${
                isAdmin
                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20'
                  : 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20'
              }`}>
                {isAdmin
                  ? <Building2 className="w-12 h-12 text-blue-400" />
                  : <Users className="w-12 h-12 text-cyan-400" />
                }
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Citizen Saving & Credit
              </h2>
              <p className="text-slate-400 text-sm">Cooperative Society</p>
            </div>

            {/* Role Toggle */}
            <div className="flex bg-slate-800/60 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => handleRoleSwitch('employee')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isAdmin
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isAdmin
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                HR Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isAdmin ? 'Username' : 'Employee Code'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    placeholder={isAdmin ? 'Enter HR username' : 'Enter your employee code'}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isAdmin ? 'Enter HR password' : 'Enter your mobile number'}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isAdmin && (
                  <p className="mt-2 text-xs text-slate-500">Default password is your registered mobile number</p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isAdmin
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/25 hover:shadow-blue-500/40'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 shadow-cyan-500/25 hover:shadow-cyan-500/40'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  This is a secure portal. All login attempts are monitored and logged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
