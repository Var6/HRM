'use client';
import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, FileText, BarChart3, Settings, Bell, Search,
  TrendingUp, TrendingDown, User, ChevronDown, Menu, X, Home, 
  CheckCircle, XCircle, AlertCircle, DollarSign, Briefcase, Award,
  Activity, ArrowUpRight, ArrowDownRight, MoreVertical, Plus, Filter,
  Download, RefreshCw, Eye, Mail, Phone, MapPin, Target, Zap, Star
} from 'lucide-react';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [activeTab, setActiveTab] = useState('overview');

  // Stats Data
  const stats = [
    { 
      label: 'Total Employees', 
      value: '1,234', 
      change: '+12.5%', 
      trend: 'up',
      icon: Users, 
      color: 'from-cyan-500 to-blue-600',
      bg: 'from-cyan-500/10 to-blue-600/10'
    },
    { 
      label: 'Present Today', 
      value: '1,156', 
      change: '+8.2%', 
      trend: 'up',
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-600',
      bg: 'from-green-500/10 to-emerald-600/10'
    },
    { 
      label: 'On Leave', 
      value: '78', 
      change: '-3.1%', 
      trend: 'down',
      icon: XCircle, 
      color: 'from-orange-500 to-amber-600',
      bg: 'from-orange-500/10 to-amber-600/10'
    },
    { 
      label: 'Pending Tasks', 
      value: '42', 
      change: '+5.4%', 
      trend: 'up',
      icon: AlertCircle, 
      color: 'from-purple-500 to-pink-600',
      bg: 'from-purple-500/10 to-pink-600/10'
    },
  ];

  // Recent Activities
  const activities = [
    { user: 'Rajesh Kumar', action: 'marked attendance', time: '2 min ago', type: 'success' },
    { user: 'Priya Sharma', action: 'submitted leave request', time: '15 min ago', type: 'warning' },
    { user: 'Amit Patel', action: 'completed onboarding', time: '1 hour ago', type: 'success' },
    { user: 'Sneha Gupta', action: 'updated profile', time: '2 hours ago', type: 'info' },
    { user: 'Vikram Singh', action: 'submitted timesheet', time: '3 hours ago', type: 'success' },
  ];

  // Upcoming Events
  const upcomingEvents = [
    { title: 'Team Meeting', date: 'Today, 3:00 PM', department: 'Engineering', color: 'cyan' },
    { title: 'Performance Review', date: 'Tomorrow, 10:00 AM', department: 'HR', color: 'purple' },
    { title: 'Training Session', date: 'Feb 2, 2:00 PM', department: 'Sales', color: 'green' },
    { title: 'Town Hall', date: 'Feb 5, 11:00 AM', department: 'All Hands', color: 'orange' },
  ];

  // Top Performers
  const topPerformers = [
    { name: 'Arjun Reddy', department: 'Sales', score: 98, avatar: 'AR' },
    { name: 'Meera Krishnan', department: 'Engineering', score: 96, avatar: 'MK' },
    { name: 'Rohan Desai', department: 'Marketing', score: 94, avatar: 'RD' },
    { name: 'Ananya Iyer', department: 'Product', score: 92, avatar: 'AI' },
  ];

  // Department Stats
  const departments = [
    { name: 'Engineering', employees: 324, growth: '+12%', color: 'cyan' },
    { name: 'Sales', employees: 256, growth: '+8%', color: 'green' },
    { name: 'Marketing', employees: 189, growth: '+15%', color: 'purple' },
    { name: 'HR', employees: 67, growth: '+5%', color: 'orange' },
    { name: 'Finance', employees: 123, growth: '+7%', color: 'blue' },
    { name: 'Operations', employees: 275, growth: '+10%', color: 'pink' },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-sm text-slate-600 mt-1">Welcome back, here's what's happening today</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="pl-10 pr-4 py-2.5 w-80 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Period Selector */}
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all group">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Settings */}
                <button className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all group overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      stat.trend === 'up' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Analytics Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Attendance Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Attendance Overview</h3>
                  <p className="text-sm text-slate-600 mt-1">Weekly attendance trends</p>
                </div>
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const percentages = [92, 95, 88, 94, 90, 45, 30];
                  return (
                    <div key={day}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700 w-12">{day}</span>
                        <span className="text-slate-600">{percentages[idx]}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${
                            percentages[idx] > 80 
                              ? 'from-green-500 to-emerald-600' 
                              : percentages[idx] > 50 
                              ? 'from-orange-500 to-amber-600' 
                              : 'from-red-500 to-rose-600'
                          } transition-all duration-500`}
                          style={{ width: `${percentages[idx]}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Departments</h3>
                  <p className="text-sm text-slate-600 mt-1">Employee distribution</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {departments.map((dept, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-green-600">{dept.growth}</span>
                        <span className="text-sm font-bold text-slate-900">{dept.employees}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-${dept.color}-500 to-${dept.color}-600 group-hover:scale-x-105 transition-transform origin-left`}
                        style={{ width: `${(dept.employees / 324) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activities and Events Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
                <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
                  View all
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-all group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'success' 
                        ? 'bg-green-100 text-green-600' 
                        : activity.type === 'warning'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        <span className="text-slate-600">{activity.action}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Upcoming Events</h3>
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-cyan-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${event.color}-500/20 to-${event.color}-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Calendar className={`w-6 h-6 text-${event.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{event.date}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-1 bg-${event.color}-100 text-${event.color}-700 rounded-full font-medium`}>
                        {event.department}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Top Performers</h3>
                  <p className="text-sm text-slate-400 mt-0.5">This month's star employees</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all">
                View Rankings
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPerformers.map((performer, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-cyan-500/50 hover:bg-slate-700/50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      {idx === 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-white">🏆</span>
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {performer.avatar}
                      </div>
                    </div>
                    <h4 className="font-bold text-white mb-1">{performer.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{performer.department}</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                        style={{ width: `${performer.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-400 mt-2">{performer.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}