'use client';
import React, { useState } from 'react';
import { 
  Users, Lock, Mail, ArrowRight, Check, Shield, Clock, 
  BarChart3, TrendingUp, Globe, Zap, ChevronRight, Eye, EyeOff 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
 
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // add near top inside component


  // Hardcoded credentials
  const VALID_USERNAME = 'Citizen Cooperative';
  const VALID_PASSWORD = 'India@1947';
  const handleSubmit = (e:any) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      if (formData.username === VALID_USERNAME && formData.password === VALID_PASSWORD) {
          router.push('/Dashboard');
      } else {
        setError('Invalid username or password. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleInputChange = (e:any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Dashboard Component (shown after successful login)
 
  // Login/Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
      

        {/* Hero Section with Login */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300 font-medium">Trusted by 10,000+ Organizations</span>
              </div>

              <div>
                <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                  Streamline Your
                  <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    HR Operations
                  </span>
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed">
                  Comprehensive human resource management platform that empowers your team 
                  and simplifies workforce administration.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: 'Secure & Compliant', color: 'cyan' },
                  { icon: Clock, label: 'Real-time Tracking', color: 'blue' },
                  { icon: BarChart3, label: 'Advanced Analytics', color: 'cyan' },
                  { icon: Globe, label: 'Cloud-based', color: 'blue' }
                ].map((feature, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/30 transition-all group"
                  >
                    <div className={`p-2 bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 rounded-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                    </div>
                    <span className="text-sm text-slate-300 font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-3xl font-bold text-white">98%</span>
                  </div>
                  <p className="text-sm text-slate-400">Customer Satisfaction</p>
                </div>
                <div className="h-12 w-px bg-slate-700"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-3xl font-bold text-white">50K+</span>
                  </div>
                  <p className="text-sm text-slate-400">Active Users</p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                  <p className="text-slate-400">Sign in to access your HRM dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter your username"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <a href="#forgot" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Credentials Hint */}
                <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-400 text-center">
                    <span className="text-cyan-400 font-medium">Demo Access:</span> Use the credentials to explore the platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/50">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Manage Your Workforce
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to simplify HR operations and boost productivity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Employee Management',
                description: 'Centralized employee database with complete profiles and documentation',
                icon: Users,
                color: 'cyan'
              },
              {
                title: 'Attendance Tracking',
                description: 'Automated time tracking with real-time attendance monitoring',
                icon: Clock,
                color: 'blue'
              },
              {
                title: 'Analytics & Reports',
                description: 'Comprehensive insights and customizable reports for data-driven decisions',
                icon: BarChart3,
                color: 'cyan'
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/30 transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                <a href="#" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium mt-4 group-hover:gap-3 transition-all">
                  Learn more
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

