'use client';
import React, { useState } from 'react';
import { 
  Target, TrendingUp, Award, Users, Calendar, Clock, 
  Star, CheckCircle, XCircle, AlertCircle, Plus, Download,
  Filter, Search, ChevronDown, ChevronUp, Edit, Eye,
  BarChart3, PieChart, Activity, MessageSquare, ThumbsUp,
  ThumbsDown, Send, FileText, Bell, Settings, RefreshCw,
  ChevronRight, X, Save, Trash2, BookOpen, Brain,
  Zap, Shield, Heart, Lightbulb, TrendingDown, ArrowUpCircle,
  ArrowDownCircle, Flag, ChevronLeft, User, Building2,
  Briefcase, GraduationCap, Coffee, Home, Phone, Mail
} from 'lucide-react';

// Types
interface Employee {
  id: number;
  name: string;
  code: string;
  designation: string;
  department: string;
  manager: string;
  joinDate: string;
  avatar?: string;
}

interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewPeriod: string;
  reviewDate: string;
  overallRating: number;
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  ratings: {
    quality: number;
    productivity: number;
    communication: number;
    teamwork: number;
    initiative: number;
    punctuality: number;
  };
  strengths: string[];
  areasOfImprovement: string[];
  goals: string[];
  reviewerComments: string;
  employeeComments?: string;
}

interface Goal {
  id: number;
  employeeId: number;
  employeeName: string;
  title: string;
  description: string;
  category: 'performance' | 'learning' | 'project' | 'personal';
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in-progress' | 'not-started' | 'at-risk';
  progress: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
}

interface KPI {
  id: number;
  employeeId: number;
  metric: string;
  target: number;
  achieved: number;
  unit: string;
  period: string;
  status: 'exceeded' | 'met' | 'below' | 'critical';
}

// Mock Data
const mockEmployees: Employee[] = [
  { id: 1, name: 'ALAKA KUMARI', code: 'EMP001', designation: 'Dy. Manager-HR', department: 'HR', manager: 'Sanjay Mishra', joinDate: '2020-01-15' },
  { id: 2, name: 'SANTOSH KUMAR', code: 'EMP002', designation: 'Asst. Accountant', department: 'Finance', manager: 'Sanjay Mishra', joinDate: '2020-03-20' },
  { id: 3, name: 'SANKET PRASAD SINHA', code: 'EMP003', designation: 'Asst. Branch Incharge', department: 'Operations', manager: 'Sanjay Mishra', joinDate: '2019-11-10' },
  { id: 4, name: 'KRITI KAMINI', code: 'EMP004', designation: 'Office Assistant', department: 'Admin', manager: 'Alaka Kumari', joinDate: '2021-06-01' }
];

const mockReviews: PerformanceReview[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'ALAKA KUMARI',
    reviewPeriod: 'Q4 2025',
    reviewDate: '2026-01-15',
    overallRating: 4.5,
    status: 'completed',
    ratings: {
      quality: 5,
      productivity: 4,
      communication: 5,
      teamwork: 4,
      initiative: 5,
      punctuality: 4
    },
    strengths: ['Excellent leadership skills', 'Strong communication', 'Proactive problem solving'],
    areasOfImprovement: ['Time management', 'Delegation skills'],
    goals: ['Complete HR certification', 'Implement new HRIS system', 'Reduce employee turnover by 15%'],
    reviewerComments: 'Outstanding performance throughout the quarter. Shows exceptional leadership and commitment to team development.',
    employeeComments: 'Thank you for the feedback. I will work on the identified areas for improvement.'
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: 'SANTOSH KUMAR',
    reviewPeriod: 'Q4 2025',
    reviewDate: '2026-01-18',
    overallRating: 4.0,
    status: 'completed',
    ratings: {
      quality: 4,
      productivity: 4,
      communication: 4,
      teamwork: 4,
      initiative: 4,
      punctuality: 4
    },
    strengths: ['Accurate work', 'Meets deadlines', 'Good technical skills'],
    areasOfImprovement: ['Client interaction', 'Report presentation'],
    goals: ['Learn advanced Excel', 'Complete GST certification', 'Reduce processing time by 20%'],
    reviewerComments: 'Consistent performer with good attention to detail. Shows steady improvement.',
    employeeComments: 'I appreciate the guidance and will focus on the improvement areas.'
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: 'SANKET PRASAD SINHA',
    reviewPeriod: 'Q4 2025',
    reviewDate: '',
    overallRating: 0,
    status: 'in-progress',
    ratings: {
      quality: 0,
      productivity: 0,
      communication: 0,
      teamwork: 0,
      initiative: 0,
      punctuality: 0
    },
    strengths: [],
    areasOfImprovement: [],
    goals: [],
    reviewerComments: '',
  },
  {
    id: 4,
    employeeId: 4,
    employeeName: 'KRITI KAMINI',
    reviewPeriod: 'Q4 2025',
    reviewDate: '',
    overallRating: 0,
    status: 'pending',
    ratings: {
      quality: 0,
      productivity: 0,
      communication: 0,
      teamwork: 0,
      initiative: 0,
      punctuality: 0
    },
    strengths: [],
    areasOfImprovement: [],
    goals: [],
    reviewerComments: '',
  }
];

const mockGoals: Goal[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'ALAKA KUMARI',
    title: 'Complete SHRM-CP Certification',
    description: 'Obtain SHRM Certified Professional certification to enhance HR expertise',
    category: 'learning',
    priority: 'high',
    status: 'in-progress',
    progress: 65,
    startDate: '2025-10-01',
    dueDate: '2026-03-31'
  },
  {
    id: 2,
    employeeId: 1,
    employeeName: 'ALAKA KUMARI',
    title: 'Reduce Employee Turnover',
    description: 'Implement retention strategies to reduce turnover by 15%',
    category: 'performance',
    priority: 'high',
    status: 'in-progress',
    progress: 45,
    startDate: '2025-11-01',
    dueDate: '2026-04-30'
  },
  {
    id: 3,
    employeeId: 2,
    employeeName: 'SANTOSH KUMAR',
    title: 'Master Advanced Excel',
    description: 'Complete advanced Excel course including macros and VBA',
    category: 'learning',
    priority: 'medium',
    status: 'in-progress',
    progress: 80,
    startDate: '2025-09-01',
    dueDate: '2026-02-28'
  },
  {
    id: 4,
    employeeId: 2,
    employeeName: 'SANTOSH KUMAR',
    title: 'GST Compliance Certification',
    description: 'Obtain GST practitioner certification',
    category: 'learning',
    priority: 'high',
    status: 'completed',
    progress: 100,
    startDate: '2025-08-01',
    dueDate: '2025-12-31',
    completedDate: '2025-12-20'
  },
  {
    id: 5,
    employeeId: 3,
    employeeName: 'SANKET PRASAD SINHA',
    title: 'Improve Branch Efficiency',
    description: 'Streamline operations to improve efficiency by 25%',
    category: 'performance',
    priority: 'high',
    status: 'at-risk',
    progress: 30,
    startDate: '2025-10-01',
    dueDate: '2026-01-31'
  },
  {
    id: 6,
    employeeId: 4,
    employeeName: 'KRITI KAMINI',
    title: 'Learn MS Office Advanced',
    description: 'Complete advanced training in Word, Excel, and PowerPoint',
    category: 'learning',
    priority: 'medium',
    status: 'in-progress',
    progress: 55,
    startDate: '2025-11-01',
    dueDate: '2026-03-31'
  }
];

const mockKPIs: KPI[] = [
  { id: 1, employeeId: 1, metric: 'Employee Satisfaction Score', target: 85, achieved: 88, unit: '%', period: 'Q4 2025', status: 'exceeded' },
  { id: 2, employeeId: 1, metric: 'Time to Hire', target: 30, achieved: 25, unit: 'days', period: 'Q4 2025', status: 'exceeded' },
  { id: 3, employeeId: 1, metric: 'Training Hours Delivered', target: 100, achieved: 95, unit: 'hours', period: 'Q4 2025', status: 'met' },
  { id: 4, employeeId: 2, metric: 'Invoice Processing Time', target: 48, achieved: 36, unit: 'hours', period: 'Q4 2025', status: 'exceeded' },
  { id: 5, employeeId: 2, metric: 'Reconciliation Accuracy', target: 98, achieved: 99.5, unit: '%', period: 'Q4 2025', status: 'exceeded' },
  { id: 6, employeeId: 2, metric: 'Report Turnaround Time', target: 24, achieved: 28, unit: 'hours', period: 'Q4 2025', status: 'below' },
  { id: 7, employeeId: 3, metric: 'Branch Revenue Growth', target: 15, achieved: 12, unit: '%', period: 'Q4 2025', status: 'below' },
  { id: 8, employeeId: 3, metric: 'Customer Satisfaction', target: 90, achieved: 85, unit: '%', period: 'Q4 2025', status: 'below' },
  { id: 9, employeeId: 4, metric: 'Document Processing Accuracy', target: 95, achieved: 97, unit: '%', period: 'Q4 2025', status: 'exceeded' }
];

export default function PerformanceManagement() {
  const [selectedView, setSelectedView] = useState<'overview' | 'reviews' | 'goals' | 'kpis' | 'analytics'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'overdue': 'bg-red-100 text-red-700 border-red-200',
      'not-started': 'bg-slate-100 text-slate-700 border-slate-200',
      'at-risk': 'bg-orange-100 text-orange-700 border-orange-200',
      'exceeded': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'met': 'bg-green-100 text-green-700 border-green-200',
      'below': 'bg-amber-100 text-amber-700 border-amber-200',
      'critical': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600';
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3.5) return 'text-cyan-600';
    if (rating >= 3) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
        <span className="ml-2 font-bold text-slate-900">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Calculate statistics
  const stats = {
    totalReviews: mockReviews.length,
    completedReviews: mockReviews.filter(r => r.status === 'completed').length,
    pendingReviews: mockReviews.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
    averageRating: mockReviews.filter(r => r.overallRating > 0).reduce((sum, r) => sum + r.overallRating, 0) / mockReviews.filter(r => r.overallRating > 0).length,
    totalGoals: mockGoals.length,
    completedGoals: mockGoals.filter(g => g.status === 'completed').length,
    inProgressGoals: mockGoals.filter(g => g.status === 'in-progress').length,
    atRiskGoals: mockGoals.filter(g => g.status === 'at-risk').length
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Management</h1>
              <p className="text-slate-600">Track employee performance, goals, and development</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-6 py-3 bg-linear-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25">
                <Plus className="w-5 h-5" />
                New Review
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-blue-50 to-blue-50 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Q4 2025
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}</p>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {((stats.completedReviews / stats.totalReviews) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Completed Reviews</p>
              <p className="text-3xl font-bold text-slate-900">{stats.completedReviews}/{stats.totalReviews}</p>
              <p className="text-xs text-green-600 mt-2">On track</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                  {((stats.completedGoals / stats.totalGoals) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Goals Completed</p>
              <p className="text-3xl font-bold text-slate-900">{stats.completedGoals}/{stats.totalGoals}</p>
              <p className="text-xs text-cyan-600 mt-2">{stats.inProgressGoals} in progress</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Alert
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">At Risk Goals</p>
              <p className="text-3xl font-bold text-slate-900">{stats.atRiskGoals}</p>
              <p className="text-xs text-amber-600 mt-2">Needs attention</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'reviews', label: 'Reviews', icon: Award },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'kpis', label: 'KPIs', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    selectedView === tab.id
                      ? 'bg-linear-to-r from-blue-400 to-blue-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <button 
                onClick={() => setSelectedView('reviews')}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 shadow-sm p-6 text-left transition-all hover:shadow-lg group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-blue-50 to-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Performance Reviews</h3>
                <p className="text-sm text-slate-600 mb-3">Conduct and manage employee performance reviews</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {stats.completedReviews} Completed
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    {stats.pendingReviews} Pending
                  </span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedView('goals')}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 shadow-sm p-6 text-left transition-all hover:shadow-lg group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-cyan-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Goals & Objectives</h3>
                <p className="text-sm text-slate-600 mb-3">Track progress on employee goals and targets</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {stats.completedGoals} Achieved
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {stats.inProgressGoals} Active
                  </span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedView('kpis')}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-green-300 shadow-sm p-6 text-left transition-all hover:shadow-lg group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-green-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Key Performance Indicators</h3>
                <p className="text-sm text-slate-600 mb-3">Monitor metrics and performance indicators</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    {mockKPIs.filter(k => k.status === 'exceeded').length} Exceeded
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    {mockKPIs.filter(k => k.status === 'below').length} Below
                  </span>
                </div>
              </button>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Performance Reviews</h2>
                <button 
                  onClick={() => setSelectedView('reviews')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {mockReviews.filter(r => r.status === 'completed').slice(0, 3).map((review) => (
                  <div key={review.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-1">{review.employeeName}</h3>
                          <p className="text-sm text-slate-600 mb-2">{review.reviewPeriod} • {review.reviewDate}</p>
                          <div className="flex items-center gap-4">
                            {renderStars(review.overallRating)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(review.status)}`}>
                          {review.status.toUpperCase()}
                        </span>
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Goals */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Active Goals</h2>
                <button 
                  onClick={() => setSelectedView('goals')}
                  className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {mockGoals.filter(g => g.status === 'in-progress').slice(0, 4).map((goal) => (
                  <div key={goal.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">{goal.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{goal.employeeName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                        goal.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {goal.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Progress</span>
                        <span className="text-xs font-bold text-slate-900">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            goal.progress >= 75 ? 'bg-linear-to-r from-green-500 to-emerald-600' :
                            goal.progress >= 50 ? 'bg-linear-to-r from-cyan-500 to-blue-600' :
                            goal.progress >= 25 ? 'bg-linear-to-r from-amber-500 to-orange-600' :
                            'bg-linear-to-r from-red-500 to-rose-600'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Due: {goal.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {selectedView === 'reviews' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-blue-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{review.employeeName}</h3>
                          <p className="text-slate-600 mb-2">{review.reviewPeriod}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{review.reviewDate || 'Not completed'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(review.status)}`}>
                          {review.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => setSelectedReview(selectedReview === review.id ? null : review.id)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                        >
                          {selectedReview === review.id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Details
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    {review.status === 'completed' && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-linear-to-br from-blue-50 to-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700 mb-2 font-semibold">OVERALL RATING</p>
                          {renderStars(review.overallRating)}
                        </div>
                        <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 mb-2 font-semibold">REVIEW STATUS</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-slate-900">Completed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {selectedReview === review.id && review.status === 'completed' && (
                      <div className="pt-6 mt-6 border-t border-slate-200">
                        {/* Rating Breakdown */}
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-slate-900 mb-4">Rating Breakdown</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {Object.entries(review.ratings).map(([category, rating]) => (
                              <div key={category} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-slate-700 capitalize">
                                    {category.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span className={`font-bold ${getRatingColor(rating)}`}>{rating.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Strengths */}
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <ThumbsUp className="w-5 h-5 text-green-600" />
                              Key Strengths
                            </h4>
                            <ul className="space-y-2">
                              {review.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                  <span className="text-sm text-slate-700">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Areas of Improvement */}
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-amber-600" />
                              Areas for Improvement
                            </h4>
                            <ul className="space-y-2">
                              {review.areasOfImprovement.map((area, idx) => (
                                <li key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                  <span className="text-sm text-slate-700">{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Goals */}
                        <div className="mt-6">
                          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-cyan-600" />
                            Goals for Next Period
                          </h4>
                          <ul className="space-y-2">
                            {review.goals.map((goal, idx) => (
                              <li key={idx} className="flex items-start gap-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                                <Flag className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-700">{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Comments */}
                        <div className="mt-6 grid md:grid-cols-2 gap-6">
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-slate-600" />
                              Reviewer Comments
                            </h4>
                            <p className="text-sm text-slate-700">{review.reviewerComments}</p>
                          </div>
                          {review.employeeComments && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Employee Response
                              </h4>
                              <p className="text-sm text-slate-700">{review.employeeComments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pending/In-Progress Actions */}
                    {review.status !== 'completed' && (
                      <div className="flex items-center justify-end gap-3 mt-4">
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                          Cancel
                        </button>
                        <button className="px-6 py-2 bg-linear-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Start Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {selectedView === 'goals' && (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <button className="px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg">
                  All Goals
                </button>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                  In Progress
                </button>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                  Completed
                </button>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                  At Risk
                </button>
                <button className="ml-auto px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
            </div>

            {/* Goals Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {mockGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 shadow-sm p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                          goal.category === 'performance' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          goal.category === 'learning' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          goal.category === 'project' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {goal.category.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                          goal.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {goal.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{goal.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
                      <p className="text-sm text-slate-500 mb-1">{goal.employeeName}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-slate-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          goal.status === 'completed' ? 'bg-linear-to-r from-green-500 to-emerald-600' :
                          goal.status === 'at-risk' ? 'bg-linear-to-r from-red-500 to-rose-600' :
                          goal.progress >= 75 ? 'bg-linear-to-r from-cyan-500 to-blue-600' :
                          goal.progress >= 50 ? 'bg-linear-to-r from-blue-400 to-indigo-600' :
                          'bg-linear-to-r from-amber-500 to-orange-600'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {goal.startDate}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        {goal.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-center border ${getStatusColor(goal.status)}`}>
                      {goal.status.toUpperCase().replace('-', ' ')}
                    </span>
                    <button className="p-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs Tab */}
        {selectedView === 'kpis' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-emerald-50 to-green-50 rounded-lg">
                    <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Exceeded Target</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {mockKPIs.filter(k => k.status === 'exceeded').length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Met Target</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockKPIs.filter(k => k.status === 'met').length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
                    <ArrowDownCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Below Target</p>
                <p className="text-3xl font-bold text-amber-600">
                  {mockKPIs.filter(k => k.status === 'below').length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-red-50 to-rose-50 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Critical</p>
                <p className="text-3xl font-bold text-red-600">
                  {mockKPIs.filter(k => k.status === 'critical').length}
                </p>
              </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Key Performance Indicators - Q4 2025</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Metric</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Target</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Achieved</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Performance</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockKPIs.map((kpi) => {
                      const employee = mockEmployees.find(e => e.id === kpi.employeeId);
                      const performance = ((kpi.achieved / kpi.target) * 100).toFixed(1);
                      return (
                        <tr key={kpi.id} className="border-b border-slate-200 hover:bg-slate-50 transition-all">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{employee?.name}</p>
                              <p className="text-xs text-slate-500">{employee?.designation}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-900">{kpi.metric}</td>
                          <td className="px-4 py-4 text-right text-slate-900 font-medium">
                            {kpi.target} {kpi.unit}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-slate-900">
                            {kpi.achieved} {kpi.unit}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-bold ${
                              parseFloat(performance) >= 100 ? 'text-emerald-600' :
                              parseFloat(performance) >= 90 ? 'text-green-600' :
                              parseFloat(performance) >= 75 ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {performance}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(kpi.status)}`}>
                              {kpi.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedView === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-blue-600" />
                  Review Status Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Completed</span>
                      <span className="font-bold text-slate-900">{stats.completedReviews} ({((stats.completedReviews / stats.totalReviews) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: `${(stats.completedReviews / stats.totalReviews) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Pending</span>
                      <span className="font-bold text-slate-900">{stats.pendingReviews} ({((stats.pendingReviews / stats.totalReviews) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-amber-500 to-orange-600 h-3 rounded-full" style={{ width: `${(stats.pendingReviews / stats.totalReviews) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-600" />
                  Goal Status Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Completed</span>
                      <span className="font-bold text-slate-900">{stats.completedGoals} ({((stats.completedGoals / stats.totalGoals) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: `${(stats.completedGoals / stats.totalGoals) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">In Progress</span>
                      <span className="font-bold text-slate-900">{stats.inProgressGoals} ({((stats.inProgressGoals / stats.totalGoals) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-cyan-500 to-blue-600 h-3 rounded-full" style={{ width: `${(stats.inProgressGoals / stats.totalGoals) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">At Risk</span>
                      <span className="font-bold text-slate-900">{stats.atRiskGoals} ({((stats.atRiskGoals / stats.totalGoals) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-red-500 to-rose-600 h-3 rounded-full" style={{ width: `${(stats.atRiskGoals / stats.totalGoals) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Department Performance Overview</h3>
              <div className="space-y-4">
                {['HR', 'Finance', 'Operations', 'Admin'].map((dept, idx) => {
                  const avgRating = [4.5, 4.0, 3.8, 4.2][idx];
                  return (
                    <div key={dept}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{dept}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= avgRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-slate-900">{avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-linear-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                          style={{ width: `${(avgRating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                Top Performers
              </h3>
              <div className="space-y-4">
                {mockReviews
                  .filter(r => r.overallRating > 0)
                  .sort((a, b) => b.overallRating - a.overallRating)
                  .map((review, idx) => (
                    <div key={review.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-linear-to-br from-amber-400 to-yellow-500' :
                        idx === 1 ? 'bg-linear-to-br from-slate-300 to-slate-400' :
                        'bg-linear-to-br from-orange-400 to-amber-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{review.employeeName}</h4>
                        <p className="text-sm text-slate-600">{mockEmployees.find(e => e.id === review.employeeId)?.designation}</p>
                      </div>
                      {renderStars(review.overallRating)}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}