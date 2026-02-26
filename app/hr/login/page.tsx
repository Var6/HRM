'use client';
import React, { useState } from 'react';
import { Building2, Lock, User, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HRLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Hardcoded HR credentials
  const VALID_USERNAME = 'Citizen Cooperative';
  const VALID_PASSWORD = 'India@1947';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      if (formData.username === VALID_USERNAME && formData.password === VALID_PASSWORD) {
        // Store HR session
        if (typeof window !== 'undefined') {
          localStorage.setItem('hrSession', JSON.stringify({
            username: formData.username,
            role: 'HR Admin',
            loginTime: new Date().toISOString()
          }));
        }
        router.push('/Dashboard');
      } else {
        setError('Invalid username or password. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home page</span>
        </Link>

        {/* Login Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl mb-4">
                <Building2 className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">HR Admin Login</h2>
              <p className="text-slate-400 text-center">Sign in to access the HR Dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username/Email
                  <br/>
                  kjh
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter HR username"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter HR password"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Security Note */}
            <div className="mt-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  This is a secure HR admin area. All login attempts are monitored and logged.
                </p>
              </div>
            </div>

            {/* Employee Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Are you an employee?{' '}
                <Link href="/employee/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
