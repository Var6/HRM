'use client';
import React, { useEffect, useState } from 'react';
import { 
  Target, TrendingUp, Award, Users, Calendar, Clock, 
  Star, CheckCircle, XCircle, AlertCircle, Plus, Download,
  Filter, Search, ChevronDown, ChevronUp, Edit, Eye,
  BarChart3, PieChart, Activity, MessageSquare, ThumbsUp,
  ThumbsDown, Send, FileText, Bell, Settings, RefreshCw,
  ChevronRight, X, Save, Trash2, User, Building2,
  Briefcase, GraduationCap, Mail, TrendingDown, ArrowUpCircle,
  ArrowDownCircle, Flag, BookOpen, Brain, Zap, Heart
} from 'lucide-react';

interface Employee {
  _id: string;
  name?: string;
  employeeCode: string;
  employeeName?: string;
  designation: string;
  department: string;
  photograph?: string;
  branch?: string;
}

interface PerformanceRecord {
  _id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  rating: number;
  reviewer: string;
  comments: string;
  achievements: string[];
  improvementAreas: string[];
  createdAt: string;
}

interface PerformanceStats {
  averageRating: number;
  totalReviews: number;
  reviewsThisMonth: number;
  topPerformers: any[];
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PerformanceManagement() {
  const [selectedView, setSelectedView] = useState<'overview' | 'reviews' | 'add-review'>('overview');
  const [performances, setPerformances] = useState<PerformanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<PerformanceStats>({
    averageRating: 0,
    totalReviews: 0,
    reviewsThisMonth: 0,
    topPerformers: []
  });

  // Form states for new review
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [rating, setRating] = useState(4);
  const [reviewer, setReviewer] = useState('');
  const [comments, setComments] = useState('');
  const [achievements, setAchievements] = useState('');
  const [improvementAreas, setImprovementAreas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchPerformances();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const empRes = await fetch('/api/employees');
      if (empRes.ok) {
        const empData = await empRes.json();
        console.log('Employees fetched:', empData.data?.length);
        setEmployees(empData.data || []);
      } else {
        console.error('Failed to fetch employees:', empRes.status);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const perfRes = await fetch(`/api/performance?month=${selectedMonth}&year=${selectedYear}`);
      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setPerformances(perfData.data || []);
        calculateStats(perfData.data || []);
      } else {
        console.error('Failed to fetch performances:', perfRes.status);
      }
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviews: PerformanceRecord[]) => {
    if (reviews.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        reviewsThisMonth: 0,
        topPerformers: []
      });
      return;
    }

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    
    // Group by employee and get average rating
    const employeeRatings = new Map();
    reviews.forEach(review => {
      // Get employee name from the populated employee object
      const empName = review.employee?.name || review.employee?.employeeName || 'Unknown';
      const empCode = review.employee?.employeeCode || '';
      const displayName = empName !== 'Unknown' ? `${empName} (${empCode})` : 'Unknown';
      
      if (!employeeRatings.has(displayName)) {
        employeeRatings.set(displayName, { ratings: [], employee: review.employee || review.employeeId });
      }
      employeeRatings.get(displayName).ratings.push(review.rating);
    });

    const topPerformers = Array.from(employeeRatings.entries())
      .map(([name, data]) => ({
        name,
        avgRating: (data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length).toFixed(1),
        count: data.ratings.length,
        employee: data.employee
      }))
      .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
      .slice(0, 5);

    setStats({
      averageRating: parseFloat(avgRating as string),
      totalReviews: reviews.length,
      reviewsThisMonth: reviews.length,
      topPerformers
    });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !reviewer.trim()) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          rating: parseFloat(rating.toString()),
          reviewer,
          comments,
          achievements: achievements.split('\n').filter(a => a.trim()),
          improvementAreas: improvementAreas.split('\n').filter(a => a.trim()),
          date: new Date()
        })
      });

      if (response.ok) {
        alert('Performance review added successfully!');
        setSelectedEmployee('');
        setRating(4);
        setReviewer('');
        setComments('');
        setAchievements('');
        setImprovementAreas('');
        setSelectedView('overview');
        fetchEmployees();
        fetchPerformances();
      } else {
        alert('Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Error adding review');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPerformances = performances.filter(perf => {
    const empName = perf.employee?.employeeName || '';
    const empCode = perf.employee?.employeeCode || '';
    const q = searchQuery.toLowerCase();
    return empName.toLowerCase().includes(q) || empCode.toLowerCase().includes(q);
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 4) return 'bg-blue-100 text-blue-700';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Good';
    if (rating >= 3) return 'Average';
    return 'Needs Improvement';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <TrendingUp className="w-12 h-12 text-cyan-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <Award className="w-10 h-10 text-cyan-600" />
                Performance Management
              </h1>
              <p className="text-slate-600 mt-2">Track, evaluate and manage employee performance</p>
            </div>
            <button
              onClick={() => setSelectedView('add-review')}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </button>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'reviews', label: 'All Reviews', icon: FileText },
              { id: 'add-review', label: 'Add Review', icon: Plus }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    selectedView === tab.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Avg Rating
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-2">out of 5.0</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalReviews}</p>
                <p className="text-xs text-slate-500 mt-2">All time</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Month
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">Reviews This Month</p>
                <p className="text-3xl font-bold text-slate-900">{stats.reviewsThisMonth}</p>
                <p className="text-xs text-slate-500 mt-2">{months[selectedMonth]} {selectedYear}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    Top
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">Top Performer</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.topPerformers[0]?.name.split(' ')[0] || 'N/A'}
                </p>
                <p className="text-xs text-slate-500 mt-2">{stats.topPerformers[0]?.avgRating} avg rating</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Top 5 Performers</h3>
              <div className="space-y-3">
                {stats.topPerformers.map((performer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center font-bold text-cyan-600">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{performer.name}</p>
                        <p className="text-sm text-slate-500">{performer.count} review{performer.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold ${getRatingColor(parseFloat(performer.avgRating))}`}>
                      {performer.avgRating} ★
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {selectedView === 'reviews' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by employee name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredPerformances.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews found</h3>
                  <p className="text-slate-600">No performance reviews for the selected criteria</p>
                </div>
              ) : (
                filteredPerformances.map((perf) => (
                  <div
                    key={perf._id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{perf.employee?.employeeName || 'Unknown'}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <span>{perf.employee?.employeeCode}</span>
                            <span>•</span>
                            <span>{perf.employee?.designation}</span>
                            <span>•</span>
                            <span>{perf.employee?.department}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-4 py-2 rounded-full font-bold ${getRatingColor(perf.rating)}`}>
                          {perf.rating} ★
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{getRatingLabel(perf.rating)}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4 pb-4 border-b border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">Reviewer</p>
                        <p className="text-slate-900">{perf.reviewer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">Review Date</p>
                        <p className="text-slate-900">{formatDate(perf.date)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-600 mb-2">Comments</p>
                      <p className="text-slate-700">{perf.comments}</p>
                    </div>

                    {perf.achievements && perf.achievements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Achievements
                        </p>
                        <ul className="space-y-1">
                          {perf.achievements.map((ach, idx) => (
                            <li key={idx} className="text-slate-700 flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {perf.improvementAreas && perf.improvementAreas.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Areas for Improvement
                        </p>
                        <ul className="space-y-1">
                          {perf.improvementAreas.map((area, idx) => (
                            <li key={idx} className="text-slate-700 flex items-start gap-2">
                              <span className="text-amber-600 mt-1">→</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add Review Tab */}
        {selectedView === 'add-review' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Performance Review</h2>

              <form onSubmit={handleAddReview} className="space-y-6">
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Employee *
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">-- Choose an employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name || emp.employeeName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Performance Rating (1-5) *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getRatingColor(rating)}`}>
                      {rating} ★
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{getRatingLabel(rating)}</p>
                </div>

                {/* Reviewer */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                    placeholder="Enter reviewer name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Review Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter detailed feedback and comments..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Key Achievements (one per line)
                  </label>
                  <textarea
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="List key achievements and accomplishments"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Improvement Areas */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Areas for Improvement (one per line)
                  </label>
                  <textarea
                    value={improvementAreas}
                    onChange={(e) => setImprovementAreas(e.target.value)}
                    placeholder="List areas where employee can improve"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedView('overview')}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {submitting ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
