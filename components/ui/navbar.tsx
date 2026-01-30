'use client';
import React, { useState } from 'react';
import { Menu, X, Bell, Search, User, ChevronDown, Users, Calendar, FileText, Settings, BarChart3, Clock } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { icon: Users, label: 'Employees', href: '#employees' },
    { icon: Calendar, label: 'Attendance', href: '#attendance' },
    { icon: Clock, label: 'Timesheet', href: '#timesheet' },
    { icon: FileText, label: 'Payroll', href: '#payroll' },
    { icon: BarChart3, label: 'Reports', href: '#reports' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  HRM Pro
                </h1>
                <p className="text-[10px] text-slate-400 -mt-1">Human Resource Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500/20 rounded-full group-hover:scale-110 transition-transform"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400">HR Manager</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <a href="#profile" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">My Profile</span>
                  </a>
                  <a href="#settings" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </a>
                  <hr className="my-2 border-slate-700" />
                  <a href="#logout" className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700 transition-colors"   onClick={() => window.location.reload()}>
                    <span className="text-sm">Sign Out</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-700/50 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
              <div className="mt-4 px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}