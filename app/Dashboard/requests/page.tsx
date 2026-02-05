'use client';

import { useEffect, useState } from 'react';

interface LeaveRequest {
  _id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  hrRemarks?: string;
  rejectionReason?: string;
  employeeId: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
  };
}

interface DataChangeRequest {
  _id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  requestType: string;
  fieldName: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedOn: string;
  hrRemarks?: string;
  rejectionReason?: string;
  employeeId: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
  };
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'leave' | 'data'>('leave');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [dataRequests, setDataRequests] = useState<DataChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const getEmployeeName = (data: LeaveRequest | DataChangeRequest): string => {
    if (data.employeeName && data.employeeName.trim()) {
      return data.employeeName;
    }
    if (data.employeeId?.firstName && data.employeeId?.lastName) {
      return `${data.employeeId.firstName} ${data.employeeId.lastName}`;
    }
    return 'Unknown Employee';
  };
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [leaveRes, dataRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/data-change-requests')
      ]);

      const leaveData = await leaveRes.json();
      const dataData = await dataRes.json();

      if (leaveData.success) {
        setLeaveRequests(leaveData.data);
      }

      if (dataData.success) {
        setDataRequests(dataData.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          hrRemarks: remarks,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Leave request ${status} successfully!`);
        setSelectedRequest(null);
        setActionType(null);
        setRemarks('');
        setRejectionReason('');
        fetchRequests();
      } else {
        alert(data.message || `Failed to ${status} leave request`);
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDataChangeAction = async (requestId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/data-change-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          hrRemarks: remarks,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Data change request ${status} successfully!`);
        setSelectedRequest(null);
        setActionType(null);
        setRemarks('');
        setRejectionReason('');
        fetchRequests();
      } else {
        alert(data.message || `Failed to ${status} data change request`);
      }
    } catch (error) {
      console.error('Error updating data change request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const filteredLeaveRequests = leaveRequests.filter(req => 
    filter === 'all' ? true : req.status === filter
  );

  const filteredDataRequests = dataRequests.filter(req => 
    filter === 'all' ? true : req.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Employee Requests</h1>
          <p className="text-slate-600 mt-1">Manage leave and data change requests from employees</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Leaves</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {leaveRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Data Changes</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {dataRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Approved This Month</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {leaveRequests.filter(r => r.status === 'approved').length + dataRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rejected This Month</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {leaveRequests.filter(r => r.status === 'rejected').length + dataRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 mb-6">
          <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('leave')}
                className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                  activeTab === 'leave'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Leave Requests ({leaveRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                  activeTab === 'data'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Data Change Requests ({dataRequests.length})
              </button>
            </div>

            <div className="flex space-x-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                    filter === status
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Leave Requests Tab */}
          {activeTab === 'leave' && (
            <div className="p-6">
              {filteredLeaveRequests.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-slate-600">No leave requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeaveRequests.map((leave) => (
                    <div key={leave._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-800">{getEmployeeName(leave)}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(leave.status)}`}>
                              {leave.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Employee Code</p>
                              <p className="font-semibold text-slate-800">{leave.employeeCode}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Department</p>
                              <p className="font-semibold text-slate-800">{leave.department}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Leave Type</p>
                              <p className="font-semibold text-slate-800 capitalize">{leave.leaveType}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Duration</p>
                              <p className="font-semibold text-slate-800">{leave.numberOfDays} day(s)</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 mb-1">Period</p>
                            <p className="text-slate-800">
                              {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Applied On</p>
                            <p className="text-slate-800">
                              {new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-slate-500 mb-1 text-sm">Reason</p>
                          <p className="text-slate-800 p-3 bg-slate-50 rounded-lg">{leave.reason}</p>
                        </div>

                        {leave.status === 'approved' && leave.hrRemarks && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-700 mb-1">HR Remarks</p>
                            <p className="text-sm text-green-800">{leave.hrRemarks}</p>
                          </div>
                        )}

                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-800">{leave.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {leave.status === 'pending' && (
                        <>
                          {selectedRequest === leave._id ? (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  HR Remarks {actionType === 'approved' && '(Optional)'}
                                </label>
                                <textarea
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  placeholder="Add any remarks..."
                                />
                              </div>

                              {actionType === 'rejected' && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                  </label>
                                  <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    placeholder="Please provide a reason for rejection..."
                                    required
                                  />
                                </div>
                              )}

                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleLeaveAction(leave._id, actionType!)}
                                  disabled={processing}
                                  className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                                    actionType === 'approved' 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {processing ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setActionType(null);
                                    setRemarks('');
                                    setRejectionReason('');
                                  }}
                                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedRequest(leave._id);
                                  setActionType('approved');
                                }}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(leave._id);
                                  setActionType('rejected');
                                }}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Change Requests Tab */}
          {activeTab === 'data' && (
            <div className="p-6">
              {filteredDataRequests.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="mt-4 text-slate-600">No data change requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDataRequests.map((request) => (
                    <div key={request._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-800">{getEmployeeName(request)}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(request.status)}`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Employee Code</p>
                              <p className="font-semibold text-slate-800">{request.employeeCode}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Department</p>
                              <p className="font-semibold text-slate-800">{request.department}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Request Type</p>
                              <p className="font-semibold text-slate-800 capitalize">{request.requestType}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Field</p>
                              <p className="font-semibold text-slate-800">{request.fieldName}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Current Value</p>
                            <p className="text-slate-800 wrap-break-word">{request.currentValue}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Requested Value</p>
                            <p className="text-slate-800 font-semibold wrap-break-word">{request.requestedValue}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-slate-500 mb-1 text-sm">Reason</p>
                          <p className="text-slate-800 p-3 bg-slate-50 rounded-lg">{request.reason}</p>
                        </div>

                        <div className="mt-4 text-sm text-slate-600">
                          <p>Requested on: {new Date(request.requestedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        {request.status === 'approved' && request.hrRemarks && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-700 mb-1">HR Remarks</p>
                            <p className="text-sm text-green-800">{request.hrRemarks}</p>
                          </div>
                        )}

                        {request.status === 'rejected' && request.rejectionReason && (
                          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-800">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {request.status === 'pending' && (
                        <>
                          {selectedRequest === request._id ? (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  HR Remarks {actionType === 'approved' && '(Optional)'}
                                </label>
                                <textarea
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                  placeholder="Add any remarks..."
                                />
                              </div>

                              {actionType === 'rejected' && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                  </label>
                                  <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    placeholder="Please provide a reason for rejection..."
                                    required
                                  />
                                </div>
                              )}

                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleDataChangeAction(request._id, actionType!)}
                                  disabled={processing}
                                  className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                                    actionType === 'approved' 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {processing ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setActionType(null);
                                    setRemarks('');
                                    setRejectionReason('');
                                  }}
                                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request._id);
                                  setActionType('approved');
                                }}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request._id);
                                  setActionType('rejected');
                                }}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
