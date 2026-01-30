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
import { usePathname } from 'next/navigation';


export default function Sidebar() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navItems = [
  { icon: Home, label: 'Dashboard', href: '/Dashboard' },
  { icon: Users, label: 'Employees', href: '/Dashboard/employees' },
  { icon: Calendar, label: 'Attendance', href: '/Dashboard/attendance' },
  { icon: Clock, label: 'Timesheet', href: '/Dashboard/timesheet' },
  { icon: FileText, label: 'Payroll', href: '/Dashboard/payroll' },
  { icon: BarChart3, label: 'Reports', href: '/Dashboard/reports' },
  { icon: Briefcase, label: 'Recruitment', href: '/Dashboard/recruitment' },
  { icon: Award, label: 'Performance', href: '/Dashboard/performance' },
];


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
        {navItems.map((item, idx) => {
    const isActive = pathname === item.href;

    return (
      <Link key={idx} href={item.href}>
        <button
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <item.icon className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
        </button>
      </Link>
    );
  })}
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
