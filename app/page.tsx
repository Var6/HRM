'use client';
import React from 'react';
import { Users, Building2, ArrowRight, Shield, Clock, BarChart3, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Citizen Saving & Credit</h1>
                  <p className="text-sm text-slate-400">Cooperative Society</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Welcome to Our
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                HR Management System
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Comprehensive human resource management platform for employees and administrators
            </p>
          </div>

          {/* Login Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Employee Portal */}
            <Link href="/login">
              <div className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all shadow-2xl">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Users className="w-16 h-16 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Employee Portal</h3>
                      <p className="text-slate-400">
                        Access your profile, apply for leaves, view payslips, and manage requests
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400 font-medium group-hover:gap-4 transition-all">
                      <span>Login as Employee</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* HR Portal */}
            <Link href="/login">
              <div className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all shadow-2xl">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Building2 className="w-16 h-16 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">HR Portal</h3>
                      <p className="text-slate-400">
                        Manage employees, process payroll, approve requests, and access reports
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-4 transition-all">
                      <span>Login as HR Admin</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Shield, label: 'Secure & Compliant', color: 'cyan' },
              { icon: Clock, label: 'Real-time Tracking', color: 'blue' },
              { icon: BarChart3, label: 'Advanced Analytics', color: 'cyan' },
              { icon: Globe, label: 'Cloud-based Access', color: 'blue' }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center gap-3 p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/30 transition-all group"
              >
                <div className={`p-3 bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 rounded-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <span className="text-sm text-slate-300 font-medium text-center">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-slate-500 text-sm">
              © 2026 Citizen Saving & Credit Cooperative Society. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
