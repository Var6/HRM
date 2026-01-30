'use client';

import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  Briefcase,
  Award,
  Home,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-72' : 'w-20'
      } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col relative`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                HRM Pro
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {[
          { icon: Home, label: 'Dashboard', active: true },
          { icon: Users, label: 'Employees' },
          { icon: Calendar, label: 'Attendance' },
          { icon: Clock, label: 'Timesheet' },
          { icon: FileText, label: 'Payroll' },
          { icon: BarChart3, label: 'Reports' },
          { icon: Briefcase, label: 'Recruitment' },
          { icon: Award, label: 'Performance' },
        ].map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              item.active
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {sidebarOpen && (
                <Link href={`/Dashboard/${item.label}`}>

              <span className="text-sm font-medium">{item.label}</span>
                </Link>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-24 w-6 h-6 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
      >
        <ChevronDown
          className={`w-4 h-4 transform ${
            sidebarOpen ? 'rotate-90' : '-rotate-90'
          }`}
        />
      </button>
    </aside>
  );
}
