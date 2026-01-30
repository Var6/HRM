'use client';
import React, { useState } from 'react';
import { 
  User, Search, Filter, AlertCircle, DollarSign, Calendar,
  Clock, TrendingUp, Users, Bell, ChevronRight, Award,
  Briefcase, Mail, Phone, MapPin, MoreVertical, Eye,
  Edit, Trash2, Download, Upload, Plus, X, CheckCircle,
  XCircle, AlertTriangle, Info
} from 'lucide-react';
import Link from 'next/link';

// Mock employee data - replace with actual API call
const mockEmployees = [
  {
    id: 1,
    employeeCode: 'EMP001',
    name: 'Rajesh Kumar',
    designation: 'Senior Developer',
    department: 'Engineering',
    email: 'rajesh.kumar@company.com',
    phone: '+91 98765 43210',
    dateOfJoining: '2023-01-15',
    status: 'active',
    photograph: null,
    salary: 85000,
    branch: 'Patna',
    notifications: [
      { type: 'warning', message: 'PF number pending' },
      { type: 'info', message: 'Appraisal due next month' }
    ]
  },
  {
    id: 2,
    employeeCode: 'EMP002',
    name: 'Priya Sharma',
    designation: 'HR Manager',
    department: 'HR',
    email: 'priya.sharma@company.com',
    phone: '+91 98765 43211',
    dateOfJoining: '2022-06-20',
    status: 'active',
    photograph: null,
    salary: 75000,
    branch: 'Arrah',
    notifications: [
      { type: 'success', message: 'All documents complete' }
    ]
  },
  {
    id: 3,
    employeeCode: 'EMP003',
    name: 'Amit Patel',
    designation: 'Sales Executive',
    department: 'Sales',
    email: 'amit.patel@company.com',
    phone: '+91 98765 43212',
    dateOfJoining: '2023-03-10',
    status: 'active',
    photograph: null,
    salary: 55000,
    branch: 'Patna',
    notifications: [
      { type: 'error', message: 'Salary payment overdue by 2 days' },
      { type: 'warning', message: 'Aadhar card not submitted' }
    ]
  },
  {
    id: 4,
    employeeCode: 'EMP004',
    name: 'Sneha Gupta',
    designation: 'Marketing Lead',
    department: 'Marketing',
    email: 'sneha.gupta@company.com',
    phone: '+91 98765 43213',
    dateOfJoining: '2021-11-05',
    status: 'active',
    photograph: null,
    salary: 92000,
    branch: 'Arrah',
    notifications: []
  },
  {
    id: 5,
    employeeCode: 'EMP005',
    name: 'Vikram Singh',
    designation: 'Finance Manager',
    department: 'Finance',
    email: 'vikram.singh@company.com',
    phone: '+91 98765 43214',
    dateOfJoining: '2020-08-15',
    status: 'active',
    photograph: null,
    salary: 110000,
    branch: 'Patna',
    notifications: [
      { type: 'info', message: 'Quarterly bonus calculation pending' }
    ]
  },
  {
    id: 6,
    employeeCode: 'EMP006',
    name: 'Anita Verma',
    designation: 'Junior Developer',
    department: 'Engineering',
    email: 'anita.verma@company.com',
    phone: '+91 98765 43215',
    dateOfJoining: '2024-01-10',
    status: 'active',
    photograph: null,
    salary: 45000,
    branch: 'Arrah',
    notifications: [
      { type: 'warning', message: 'Probation ends in 15 days' },
      { type: 'info', message: 'Training completion pending' }
    ]
  }
];

type NotificationType = 'error' | 'warning' | 'info' | 'success';

export default function EmployeesList() {
  const [employees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique departments
  const departments = ['all', ...new Set(employees.map(emp => emp.department))];

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    withIssues: employees.filter(e => e.notifications.some(n => n.type === 'error' || n.type === 'warning')).length,
    newJoiners: employees.filter(e => {
      const joinDate = new Date(e.dateOfJoining);
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 3);
      return joinDate > monthsAgo;
    }).length
  };

  // Get notification icon and color
  const getNotificationStyle = (type: string) => {
    switch(type) {
      case 'error':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'success':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      case 'info':
      default:
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Employees</h1>
              <p className="text-slate-600">Manage and monitor your workforce</p>
            </div>
            <Link 
              href="/employees/create"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Needs Attention</p>
              <p className="text-3xl font-bold text-slate-900">{stats.withIssues}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">New Joiners (3M)</p>
              <p className="text-3xl font-bold text-slate-900">{stats.newJoiners}</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="probation">On Probation</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employee Cards */}
        <div className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No employees found</h3>
              <p className="text-slate-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Employee Photo */}
                    <div className="flex-shrink-0">
                      {employee.photograph ? (
                        <img 
                          src={employee.photograph} 
                          alt={employee.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                          <User className="w-10 h-10 text-cyan-600" />
                        </div>
                      )}
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-900">{employee.name}</h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {employee.status}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-1">{employee.designation}</p>
                          <p className="text-sm text-slate-500">{employee.employeeCode}</p>
                        </div>

                        <Link
                          href={`/Dashboard/employees/${employee.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>

                      {/* Employee Details Grid */}
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Department</p>
                            <p className="text-sm font-medium text-slate-900">{employee.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Branch</p>
                            <p className="text-sm font-medium text-slate-900">{employee.branch}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Joined</p>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(employee.dateOfJoining).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Salary</p>
                            <p className="text-sm font-medium text-slate-900">₹{employee.salary.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          {employee.phone}
                        </div>
                      </div>

                      {/* Notifications */}
                      {employee.notifications.length > 0 && (
                        <div className="space-y-2">
                          {employee.notifications.map((notification, idx) => {
                            const style = getNotificationStyle(notification.type);
                            const Icon = style.icon;
                            
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 px-4 py-2 ${style.bg} border ${style.border} rounded-lg`}
                              >
                                <Icon className={`w-4 h-4 flex-shrink-0 ${style.color}`} />
                                <p className={`text-sm font-medium ${style.color}`}>
                                  {notification.message}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredEmployees.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        )}
      </div>
    </div>
  );
}