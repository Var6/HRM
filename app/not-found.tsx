'use client';
import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft, Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Company Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Citizen Saving & Credit</h2>
            <p className="text-xs text-slate-400">Cooperative Society</p>
          </div>
        </div>

        {/* 404 Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 shadow-2xl text-center">
            {/* 404 Number */}
            <div className="mb-6">
              <h1 className="text-9xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-300 bg-clip-text text-transparent">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Page Not Found</h2>
              <p className="text-slate-400 text-lg">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
              <p>Please contact Rishabh about this</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400 mb-4">Quick Links:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/employee/login" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                  Employee Portal
                </Link>
                <span className="text-slate-600">•</span>
                <Link href="/hr/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  HR Portal
                </Link>
                <span className="text-slate-600">•</span>
                <Link href="/Dashboard" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
