'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeNavbar from '@/components/employee/EmployeeNavbar';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Home, Calendar, AlertCircle, Award, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface EmployeeData {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  mobileNumber: string;
}

interface LeaveRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  hrRemarks?: string;
  rejectionReason?: string;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
}

interface CalendarDay {
  date: Date;
  isPresent?: boolean;
  isLeave?: boolean;
  isHoliday?: boolean;
  isOff?: boolean;
  isPast?: boolean;
  leaveType?: string;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EmployeeLeaves() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData');
    
    if (!employeeData) {
      router.push('/employee/login');
      return;
    }

    const parsedEmployee = JSON.parse(employeeData);
    setEmployee(parsedEmployee);

    fetchLeaveRequests(parsedEmployee._id);
    fetchHolidays();
  }, []);

  useEffect(() => {
    if (holidays.length > 0) {
      generateCalendar();
    }
  }, [selectedMonth, selectedYear, holidays, leaveRequests]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const fetchLeaveRequests = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/leaves?employeeId=${employeeId}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setLeaveRequests(data.data);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/holidays');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setHolidays(data.data);
      } else if (Array.isArray(data.holidays)) {
        setHolidays(data.holidays);
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setHolidays([]);
    }
  };

  const isTuesday = (date: Date) => date.getDay() === 2;

  const isHoliday = (date: Date) => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toDateString() === date.toDateString();
    });
  };

  const getHolidayName = (date: Date) => {
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.toDateString() === date.toDateString();
    });
    return holiday?.name || '';
  };

  const hasLeaveOnDate = (date: Date) => {
    return leaveRequests.some(leave => {
      if (leave.status !== 'approved') return false;
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const generateCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const days: CalendarDay[] = [];

    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push({ date: new Date(0) });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(selectedYear, selectedMonth, i);
      const isPast = currentDate < new Date() && currentDate.toDateString() !== new Date().toDateString();
      const isOff = isTuesday(currentDate);
      const holiday = isHoliday(currentDate);
      const hasLeave = hasLeaveOnDate(currentDate);

      days.push({
        date: currentDate,
        isPresent: isPast && !isOff && !holiday && !hasLeave,
        isLeave: hasLeave,
        isHoliday: holiday,
        isOff: isOff,
        isPast
      });
    }

    setCalendarDays(days);
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const calculateWorkingDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    let days = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (!isTuesday(d) && !isHoliday(d)) {
        days++;
      }
    }

    return days;
  };

  const workingDays = calculateWorkingDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employee) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee._id,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          numberOfDays: workingDays,
          reason: formData.reason
        })
      });

      if (response.ok) {
        await fetchLeaveRequests(employee._id);
        setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        setShowForm(false);
        // Set 5-second cooldown after successful submission
        setCooldown(5);
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        setLeaveRequests(leaveRequests.filter(l => l._id !== leaveId));
        setOpenDropdown(null);
        alert('Leave request deleted successfully');
      } else {
        alert(data.message || 'Failed to cancel leave request');
      }
    } catch (error) {
      console.error('Error canceling leave:', error);
      alert('Error canceling leave request. Please try again.');
    }
  };

  const fullName = employee
    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
    : 'Employee';

  const LeaveRequestCard = ({ leave, onAction, isOpen }: { leave: LeaveRequest, onAction: () => void, isOpen: boolean }) => (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-slate-800 capitalize">
            {leave.leaveType} Leave
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${getStatusBadgeColor(leave.status)}`}>
            {leave.status.toUpperCase()}
          </span>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
            <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-semibold text-slate-900">
                {new Date(leave.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500">to</p>
              <p className="font-semibold text-slate-900">
                {new Date(leave.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs font-semibold text-blue-600 mt-1">
                {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
          <p className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="break-words">{leave.reason}</span>
          </p>
          {leave.status === 'approved' && leave.hrRemarks && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded border border-green-200">
              <svg className="w-4 h-4 mt-0.5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">HR Approval</p>
                <span className="text-green-700 break-words text-sm">{leave.hrRemarks}</span>
              </div>
            </div>
          )}
          {leave.status === 'rejected' && leave.rejectionReason && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded border border-red-200">
              <svg className="w-4 h-4 mt-0.5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <p className="text-xs text-red-600 font-semibold mb-1">Rejection Reason</p>
                <span className="text-red-700 break-words text-sm">{leave.rejectionReason}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Date Applied & Actions - Stack on mobile */}
      <div className="flex flex-col gap-4 md:items-end md:min-w-fit">
        <div className="md:text-right">
          <p className="text-xs text-slate-500">Applied on</p>
          <p className="text-sm font-medium text-slate-700">
            {new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Action Dropdown */}
        <div className="relative md:self-end">
          <button
            onClick={onAction}
            className="w-full md:w-auto px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center gap-2 md:gap-0"
          >
            <MoreVertical className="w-5 h-5" />
            <span className="md:hidden text-sm">Actions</span>
          </button>

          {isOpen && (
            <div className="absolute left-0 md:right-0 mt-2 w-full md:w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
              <button
                onClick={() => {
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 border-b border-slate-200"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View Details</span>
              </button>

              {leave.status === 'pending' && (
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 border-b border-slate-200"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Request</span>
                </button>
              )}

              {leave.status === 'pending' && (
                <button
                  onClick={() => {
                    handleCancelLeave(leave._id);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Cancel Request</span>
                </button>
              )}

              {leave.status !== 'pending' && (
                <button
                  onClick={() => {
                    handleCancelLeave(leave._id);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeNavbar employeeName={fullName} employeeCode={employee?.employeeCode || ''} />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Leave Management</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">Apply for leave and track your requests with calendar view</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center sm:justify-start space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{showForm ? 'Cancel' : 'New Leave Request'}</span>
          </button>
        </div>

        {/* Leave Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Working Days
                  </label>
                  <div className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-semibold">
                    {workingDays} {workingDays === 1 ? 'day' : 'days'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Excludes Tuesdays and public holidays
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || workingDays === 0 || cooldown > 0}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : cooldown > 0 ? `Please wait ${cooldown}s...` : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
          {/* Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid - Responsive */}
          <div className="overflow-x-auto mb-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-max sm:min-w-0">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs sm:text-sm font-semibold text-slate-600 py-2 w-12 sm:w-auto">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                if (day.date.getTime() === 0) {
                  return <div key={index} className="w-12 sm:w-auto" />;
                }

                const isToday = day.date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`aspect-square w-12 sm:w-auto border-2 rounded-lg p-1 sm:p-2 transition-all flex flex-col items-center justify-center text-xs sm:text-sm ${
                      day.isHoliday
                        ? 'bg-pink-100 border-pink-300'
                        : day.isOff
                        ? 'bg-purple-50 border-purple-300'
                        : day.isLeave
                        ? 'bg-blue-50 border-blue-300'
                        : day.isPresent
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-slate-200'
                    } ${isToday ? 'ring-2 ring-cyan-500' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full w-full text-center">
                      <span className={`text-xs sm:text-sm font-semibold ${
                        isToday ? 'text-cyan-600' : day.isOff ? 'text-purple-600' : day.isHoliday ? 'text-pink-600' : 'text-slate-900'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      {day.isHoliday ? (
                        <span className="text-xs text-pink-600 font-bold text-center leading-tight line-clamp-1">
                          {getHolidayName(day.date).substring(0, 3)}
                        </span>
                      ) : day.isOff ? (
                        <span className="text-xs text-purple-600 font-medium">OFF</span>
                      ) : day.isLeave ? (
                        <Home className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      ) : day.isPresent ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - Stack on mobile */}
          <div className="pt-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Legend</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200 text-xs sm:text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-slate-700">Present</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs sm:text-sm">
                <Home className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-700">On Leave</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs sm:text-sm">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-slate-700">Off (Tue)</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-pink-50 rounded-lg border border-pink-200 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
                <span className="text-slate-700">Holiday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Approved Leaves Section */}
        {leaveRequests.filter(l => l.status === 'approved').length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md border-2 border-green-200 overflow-hidden mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 border-b border-green-300">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                Approved Leaves
              </h2>
            </div>
            
            <div className="divide-y divide-green-200">
              {leaveRequests
                .filter(leave => leave.status === 'approved')
                .map((leave) => (
                  <div key={leave._id} className="p-4 sm:p-6 hover:bg-green-100/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-green-900 capitalize">
                            {leave.leaveType} Leave
                          </h3>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-900 border border-green-400 w-fit">
                            APPROVED ✓
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-green-800">
                          <div className="bg-white/50 p-2 rounded border-l-4 border-green-500">
                            <p className="flex items-start gap-2 font-semibold">
                              <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>
                                {new Date(leave.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} to {new Date(leave.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                <br />
                                <span className="text-xs text-green-700">({leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'})</span>
                              </span>
                            </p>
                          </div>
                          {leave.reason && (
                            <p className="text-green-700 text-sm">
                              <strong>Reason:</strong> {leave.reason}
                            </p>
                          )}
                          {leave.hrRemarks && (
                            <div className="flex items-start gap-2 p-2 bg-white rounded border-l-4 border-green-500">
                              <p className="text-green-700 break-words text-sm"><strong>HR Remarks:</strong> {leave.hrRemarks}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Actions */}
                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="md:text-right">
                          <p className="text-xs text-green-600">Approved on</p>
                          <p className="text-sm font-medium text-green-900">
                            {new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        {/* Action Dropdown */}
                        <div className="relative w-full md:w-auto">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === leave._id ? null : leave._id)}
                            className="w-full md:w-auto px-3 py-2 text-green-600 hover:text-green-900 hover:bg-green-200 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <MoreVertical className="w-5 h-5" />
                            <span className="md:hidden text-sm">Actions</span>
                          </button>

                          {openDropdown === leave._id && (
                            <div className="absolute left-0 md:right-0 mt-2 w-full md:w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 border-b border-slate-200"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">View Details</span>
                              </button>

                              <button
                                onClick={() => {
                                  handleCancelLeave(leave._id);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Leave Requests Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
            <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase">Total Requests</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-2">{leaveRequests.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border border-yellow-200">
            <p className="text-yellow-600 text-xs sm:text-sm font-semibold uppercase">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-2">{leaveRequests.filter(r => r.status === 'pending').length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
            <p className="text-green-600 text-xs sm:text-sm font-semibold uppercase">Approved</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-2">{leaveRequests.filter(r => r.status === 'approved').length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 sm:p-4 border border-red-200">
            <p className="text-red-600 text-xs sm:text-sm font-semibold uppercase">Rejected</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-2">{leaveRequests.filter(r => r.status === 'rejected').length}</p>
          </div>
        </div>

        {/* Leave Requests Tabs View */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">My Leave Requests</h2>
          </div>
          
          {leaveRequests.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-slate-600">No leave requests yet</p>
              <p className="text-sm text-slate-500">Click "New Leave Request" to apply for leave</p>
            </div>
          ) : (
            <>
              {/* Pending Requests */}
              {leaveRequests.filter(r => r.status === 'pending').length > 0 && (
                <div className="border-b border-slate-200">
                  <div className="px-4 sm:px-6 py-3 bg-yellow-50 border-b border-yellow-200">
                    <h3 className="text-base sm:text-lg font-semibold text-yellow-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Pending Approval ({leaveRequests.filter(r => r.status === 'pending').length})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {leaveRequests.filter(r => r.status === 'pending').map((leave) => (
                      <div key={leave._id} className="p-4 sm:p-6 hover:bg-yellow-50 transition-colors">
                        <LeaveRequestCard leave={leave} onAction={() => setOpenDropdown(openDropdown === leave._id ? null : leave._id)} isOpen={openDropdown === leave._id} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Requests */}
              {leaveRequests.filter(r => r.status === 'approved').length > 0 && (
                <div className="border-b border-slate-200">
                  <div className="px-4 sm:px-6 py-3 bg-green-50 border-b border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-green-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Approved ({leaveRequests.filter(r => r.status === 'approved').length})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {leaveRequests.filter(r => r.status === 'approved').map((leave) => (
                      <div key={leave._id} className="p-4 sm:p-6 hover:bg-green-50 transition-colors">
                        <LeaveRequestCard leave={leave} onAction={() => setOpenDropdown(openDropdown === leave._id ? null : leave._id)} isOpen={openDropdown === leave._id} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Requests */}
              {leaveRequests.filter(r => r.status === 'rejected').length > 0 && (
                <div>
                  <div className="px-4 sm:px-6 py-3 bg-red-50 border-b border-red-200">
                    <h3 className="text-base sm:text-lg font-semibold text-red-900 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Rejected ({leaveRequests.filter(r => r.status === 'rejected').length})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {leaveRequests.filter(r => r.status === 'rejected').map((leave) => (
                      <div key={leave._id} className="p-4 sm:p-6 hover:bg-red-50 transition-colors">
                        <LeaveRequestCard leave={leave} onAction={() => setOpenDropdown(openDropdown === leave._id ? null : leave._id)} isOpen={openDropdown === leave._id} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Holiday Calendar Info */}
        {holidays && holidays.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Information
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Weekly off: <strong>Tuesday</strong></li>
              <li>• Working days exclude Tuesdays and public holidays</li>
              <li>• {holidays.length} public {holidays.length === 1 ? 'holiday' : 'holidays'} currently scheduled</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
