'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeNavbar from '@/components/employee/EmployeeNavbar';

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

export default function EmployeeLeaves() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  }, [router]);

  const fetchLeaveRequests = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/leaves?employeeId=${employeeId}`);
      const data = await response.json();

      if (data.success) {
        setLeaveRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/holidays');
      const data = await response.json();

      if (data.success) {
        setHolidays(data.data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const calculateWorkingDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    const holidayDates = new Set(
      holidays.map(h => new Date(h.date).toDateString())
    );

    let workingDays = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toDateString();

      // Skip Tuesdays (2) and holidays
      if (dayOfWeek !== 2 && !holidayDates.has(dateString)) {
        workingDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;

    const workingDays = calculateWorkingDays();
    
    if (workingDays === 0) {
      alert('Selected dates do not include any working days (excluding Tuesdays and holidays).');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee._id,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave request submitted successfully!');
        setFormData({
          leaveType: 'casual',
          startDate: '',
          endDate: '',
          reason: ''
        });
        setShowForm(false);
        fetchLeaveRequests(employee._id);
      } else {
        alert(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const workingDays = calculateWorkingDays();

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeNavbar employeeName={fullName} employeeCode={employee.employeeCode} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Leave Requests</h1>
            <p className="text-slate-600 mt-1">Apply for leave and track your requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{showForm ? 'Cancel' : 'New Leave Request'}</span>
          </button>
        </div>

        {/* Leave Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || workingDays === 0}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave Requests List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">My Leave Requests</h2>
          </div>
          
          {leaveRequests.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-slate-600">No leave requests yet</p>
              <p className="text-sm text-slate-500">Click "New Leave Request" to apply for leave</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {leaveRequests.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 capitalize">
                          {leave.leaveType} Leave
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(leave.status)}`}>
                          {leave.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          <span className="ml-2 font-semibold">({leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'})</span>
                        </p>
                        <p className="flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="wrap-break-word">{leave.reason}</span>
                        </p>
                        {leave.status === 'approved' && leave.hrRemarks && (
                          <p className="flex items-start p-2 bg-green-50 rounded border border-green-200">
                            <svg className="w-4 h-4 mr-2 mt-0.5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-700 wrap-break-word">{leave.hrRemarks}</span>
                          </p>
                        )}
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <p className="flex items-start p-2 bg-red-50 rounded border border-red-200">
                            <svg className="w-4 h-4 mr-2 mt-0.5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-red-700 wrap-break-word"><strong>Rejection Reason:</strong> {leave.rejectionReason}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-slate-500">Applied on</p>
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Holiday Calendar Info */}
        {holidays.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
