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
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
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
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          reviewedBy: 'HR' // You can replace this with actual HR user ID
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
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          reviewedBy: 'HR' // You can replace this with actual HR user ID
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
                            <h3 className="text-lg font-semibold text-slate-800">{leave.employeeName}</h3>
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
                                  HR Remarks {actionType === 'approve' && '(Optional)'}
                                </label>
                                <textarea
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  placeholder="Add any remarks..."
                                />
                              </div>

                              {actionType === 'reject' && (
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
                                    actionType === 'approve' 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
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
                                  setActionType('approve');
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
                                  setActionType('reject');
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
                            <h3 className="text-lg font-semibold text-slate-800">{request.employeeName}</h3>
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
                                  HR Remarks {actionType === 'approve' && '(Optional)'}
                                </label>
                                <textarea
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                  placeholder="Add any remarks..."
                                />
                              </div>

                              {actionType === 'reject' && (
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
                                    actionType === 'approve' 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
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
                                  setActionType('approve');
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
                                  setActionType('reject');
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
    billable: true
  },
  {
    id: 3,
    date: '2026-01-27',
    project: 'Mobile App Development',
    task: 'API Integration',
    startTime: '15:00',
    endTime: '18:00',
    hours: 3,
    breakTime: 0,
    description: 'Integrated payment gateway APIs',
    status: 'completed',
    billable: true
  },
  {
    id: 4,
    date: '2026-01-28',
    project: 'ERP Implementation',
    task: 'Database Design',
    startTime: '09:00',
    endTime: '13:00',
    hours: 4,
    breakTime: 0,
    description: 'Designed inventory management schema',
    status: 'completed',
    billable: true
  },
  {
    id: 5,
    date: '2026-01-28',
    project: 'Internal - HR System',
    task: 'Team Meeting',
    startTime: '14:00',
    endTime: '15:30',
    hours: 1.5,
    breakTime: 0,
    description: 'Sprint planning and retrospective',
    status: 'completed',
    billable: false
  },
];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimesheetManagement() {
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'monthly' | 'reports'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate daily stats
  const todayEntries = timeEntries.filter(entry => entry.date === selectedDate);
  const dailyStats = {
    totalHours: todayEntries.reduce((sum, entry) => sum + entry.hours, 0),
    billableHours: todayEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.hours, 0),
    nonBillableHours: todayEntries.filter(e => !e.billable).reduce((sum, entry) => sum + entry.hours, 0),
    overtimeHours: Math.max(0, todayEntries.reduce((sum, entry) => sum + entry.hours, 0) - 8),
  };

  // Calculate weekly stats
  const weeklyStats = {
    totalHours: 42.5,
    regularHours: 40,
    overtimeHours: 2.5,
    billableHours: 38,
    productivity: 89,
    tasksCompleted: 18
  };

  const handleAddEntry = () => {
    setShowAddEntry(true);
  };

  const handleStartTimer = (entryId: number) => {
    setActiveTimer(entryId);
  };

  const handleStopTimer = () => {
    setActiveTimer(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Timesheet Management</h1>
              <p className="text-slate-600">Track your work hours and manage timesheets</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={handleAddEntry}
                className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <Plus className="w-5 h-5" />
                Add Time Entry
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-cyan-600" />
                </div>
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                  This Week
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-slate-900">{weeklyStats.totalHours}</p>
              <p className="text-xs text-slate-500 mt-2">
                <span className="text-green-600">↑ 5%</span> from last week
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Billable
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Billable Hours</p>
              <p className="text-3xl font-bold text-slate-900">{weeklyStats.billableHours}</p>
              <p className="text-xs text-slate-500 mt-2">
                {((weeklyStats.billableHours / weeklyStats.totalHours) * 100).toFixed(0)}% of total
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Overtime
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Overtime Hours</p>
              <p className="text-3xl font-bold text-slate-900">{weeklyStats.overtimeHours}</p>
              <p className="text-xs text-slate-500 mt-2">Above 40 hrs/week</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  Performance
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Productivity</p>
              <p className="text-3xl font-bold text-slate-900">{weeklyStats.productivity}%</p>
              <p className="text-xs text-slate-500 mt-2">{weeklyStats.tasksCompleted} tasks completed</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex gap-2">
              {[
                { id: 'daily', label: 'Daily View', icon: Calendar },
                { id: 'weekly', label: 'Weekly View', icon: Activity },
                { id: 'monthly', label: 'Monthly Summary', icon: BarChart3 },
                { id: 'reports', label: 'Reports', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    selectedView === tab.id
                      ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
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

        {/* Daily View */}
        {selectedView === 'daily' && (
          <div className="space-y-6">
            {/* Date Selector & Daily Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                  <button 
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-all font-medium"
                  >
                    Today
                  </button>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total Hours</p>
                    <p className="text-2xl font-bold text-slate-900">{dailyStats.totalHours.toFixed(1)}</p>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Billable</p>
                    <p className="text-2xl font-bold text-green-600">{dailyStats.billableHours.toFixed(1)}</p>
                  </div>
                  {dailyStats.overtimeHours > 0 && (
                    <>
                      <div className="h-12 w-px bg-slate-200"></div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Overtime</p>
                        <p className="text-2xl font-bold text-amber-600">{dailyStats.overtimeHours.toFixed(1)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Daily Progress</span>
                  <span className="font-semibold text-slate-900">
                    {dailyStats.totalHours.toFixed(1)} / 8.0 hours
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      dailyStats.totalHours >= 8 
                        ? 'bg-linear-to-r from-green-500 to-emerald-600'
                        : 'bg-linear-to-r from-cyan-500 to-blue-600'
                    }`}
                    style={{ width: `${Math.min((dailyStats.totalHours / 8) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Time Entries */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Time Entries</h3>
              </div>

              <div className="divide-y divide-slate-200">
                {todayEntries.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No time entries for this day</p>
                    <button
                      onClick={handleAddEntry}
                      className="px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                    >
                      Add First Entry
                    </button>
                  </div>
                ) : (
                  todayEntries.map((entry) => (
                    <div key={entry.id} className="p-6 hover:bg-slate-50 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-slate-900">{entry.project}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              entry.billable 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {entry.billable ? 'Billable' : 'Non-billable'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              entry.status === 'completed' 
                                ? 'bg-blue-100 text-blue-700'
                                : entry.status === 'in-progress'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {entry.status === 'completed' ? 'Completed' : entry.status === 'in-progress' ? 'In Progress' : 'Paused'}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-2">{entry.task}</p>
                          <p className="text-sm text-slate-500 mb-3">{entry.description}</p>
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{entry.startTime} - {entry.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4" />
                              <span className="font-semibold">{entry.hours.toFixed(1)} hours</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeTimer === entry.id ? (
                            <button
                              onClick={handleStopTimer}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                            >
                              <StopCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartTimer(entry.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                            >
                              <PlayCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {todayEntries.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Entries</p>
                        <p className="text-xl font-bold text-slate-900">{todayEntries.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Duration</p>
                        <p className="text-xl font-bold text-slate-900">{dailyStats.totalHours.toFixed(1)} hrs</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Billable Time</p>
                        <p className="text-xl font-bold text-green-600">{dailyStats.billableHours.toFixed(1)} hrs</p>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg">
                      <Send className="w-5 h-5" />
                      Submit Timesheet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weekly View */}
        {selectedView === 'weekly' && (
          <div className="space-y-6">
            {/* Week Selector */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div>
                    <p className="text-sm text-slate-600">Current Week</p>
                    <p className="text-xl font-bold text-slate-900">Jan 27 - Feb 2, 2026</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-600 font-semibold mb-1">Status</p>
                    <p className="text-sm font-bold text-amber-700">Draft</p>
                  </div>
                  <button className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg">
                    <Send className="w-5 h-5" />
                    Submit Week
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Grid */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-[200px]">
                        Project / Task
                      </th>
                      {weekDays.map((day) => (
                        <th key={day} className="px-4 py-4 text-center text-sm font-semibold text-slate-700 min-w-[120px]">
                          <div>
                            <p className="mb-1">{day}</p>
                            <p className="text-xs font-normal text-slate-500">
                              Jan {27 + weekDays.indexOf(day)}
                            </p>
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-[100px]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mockProjects.slice(0, 5).map((project, idx) => {
                      const weekHours = [8, 7.5, 8, 6, 8, 0, 0];
                      const total = weekHours.reduce((a, b) => a + b, 0);
                      return (
                        <tr key={project.id} className="hover:bg-slate-50 transition-all">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{project.name}</p>
                              <p className="text-sm text-slate-500">{project.code} • {project.client}</p>
                            </div>
                          </td>
                          {weekHours.map((hours, dayIdx) => (
                            <td key={dayIdx} className="px-4 py-4 text-center">
                              {hours > 0 ? (
                                <div className="inline-block">
                                  <div className={`px-3 py-2 rounded-lg font-semibold ${
                                    hours >= 8 
                                      ? 'bg-green-100 text-green-700'
                                      : hours >= 4
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {hours}h
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-slate-900">{total}h</span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold">
                      <td className="px-6 py-4 text-slate-900">Daily Totals</td>
                      {[8, 7.5, 8, 6, 8, 0, 0].map((hours, idx) => (
                        <td key={idx} className="px-4 py-4 text-center text-slate-900">
                          {hours}h
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center text-cyan-600 text-lg">
                        {weeklyStats.totalHours}h
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-slate-600 mb-4">Hours Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Regular Hours</span>
                    <span className="font-bold text-slate-900">{weeklyStats.regularHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Overtime Hours</span>
                    <span className="font-bold text-amber-600">{weeklyStats.overtimeHours}h</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Total Hours</span>
                    <span className="font-bold text-cyan-600 text-lg">{weeklyStats.totalHours}h</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-slate-600 mb-4">Billable Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Billable Hours</span>
                    <span className="font-bold text-green-600">{weeklyStats.billableHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Non-billable Hours</span>
                    <span className="font-bold text-slate-600">{weeklyStats.totalHours - weeklyStats.billableHours}h</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Utilization</span>
                    <span className="font-bold text-green-600 text-lg">
                      {((weeklyStats.billableHours / weeklyStats.totalHours) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-cyan-900 mb-4">Weekly Target</h4>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-700">Progress</span>
                    <span className="text-sm font-semibold text-cyan-900">
                      {weeklyStats.totalHours} / 40h
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div 
                      className="bg-linear-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(weeklyStats.totalHours / 40) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-cyan-700">
                  {weeklyStats.totalHours >= 40 
                    ? '🎉 Weekly target achieved!' 
                    : `${(40 - weeklyStats.totalHours).toFixed(1)}h remaining to reach target`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Summary */}
        {selectedView === 'monthly' && (
          <div className="space-y-6">
            {/* Month Selector */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div>
                    <p className="text-sm text-slate-600">Viewing</p>
                    <p className="text-xl font-bold text-slate-900">January 2026</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Hours</p>
                    <p className="text-2xl font-bold text-slate-900">168.5</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="text-green-600">↑ 12%</span> from last month
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Billable</p>
                    <p className="text-2xl font-bold text-slate-900">152.0</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">90% utilization rate</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
                    <Zap className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Overtime</p>
                    <p className="text-2xl font-bold text-slate-900">8.5</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">2 weeks had overtime</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Avg/Week</p>
                    <p className="text-2xl font-bold text-slate-900">42.1</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Above target</div>
              </div>
            </div>

            {/* Project Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Project Time Distribution</h3>
              <div className="space-y-4">
                {mockProjects.map((project, idx) => {
                  const hours = [65, 48, 32, 18, 5.5][idx];
                  const percentage = ((hours / 168.5) * 100).toFixed(0);
                  return (
                    <div key={project.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{project.name}</p>
                          <p className="text-sm text-slate-500">{project.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{hours}h</p>
                          <p className="text-sm text-slate-500">{percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-linear-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Weekly Breakdown</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => {
                  const hours = [42.5, 40, 45, 41][idx];
                  const isOvertime = hours > 40;
                  return (
                    <div key={week} className={`p-4 rounded-lg border-2 ${
                      isOvertime 
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <p className="text-sm font-semibold text-slate-600 mb-2">{week}</p>
                      <p className={`text-3xl font-bold mb-1 ${
                        isOvertime ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {hours}h
                      </p>
                      <p className="text-xs text-slate-500">
                        {isOvertime ? `+${hours - 40}h overtime` : 'Within target'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reports View */}
        {selectedView === 'reports' && (
          <div className="space-y-6">
            {/* Report Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                    <FileText className="w-8 h-8 text-cyan-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Detailed Timesheet</h3>
                <p className="text-sm text-slate-600">Complete breakdown of all time entries with project details</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-green-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Billable Hours Report</h3>
                <p className="text-sm text-slate-600">Summary of billable vs non-billable hours by project</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-purple-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Productivity Analysis</h3>
                <p className="text-sm text-slate-600">Insights on productivity trends and patterns</p>
              </button>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Billable vs Non-Billable */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-cyan-600" />
                  Billable vs Non-Billable
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Billable Hours</span>
                      <span className="font-bold text-green-600">152h (90%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div className="bg-linear-to-r from-green-500 to-emerald-600 h-4 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Non-Billable Hours</span>
                      <span className="font-bold text-slate-600">16.5h (10%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div className="bg-linear-to-r from-slate-400 to-slate-500 h-4 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overtime Trend */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                  Overtime Trend
                </h3>
                <div className="space-y-3">
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => {
                    const overtime = [2.5, 0, 5, 1][idx];
                    return (
                      <div key={week} className="flex items-center gap-3">
                        <span className="w-16 text-sm font-medium text-slate-600">{week}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-linear-to-r from-amber-500 to-orange-600 h-3 rounded-full"
                            style={{ width: `${(overtime / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-sm font-bold text-amber-600">{overtime}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Projects */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Top Projects by Time</h3>
              <div className="space-y-4">
                {mockProjects.slice(0, 5).map((project, idx) => {
                  const hours = [65, 48, 32, 18, 5.5][idx];
                  const percentage = ((hours / 168.5) * 100).toFixed(0);
                  return (
                    <div key={project.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{project.name}</p>
                            <p className="text-sm text-slate-500">{project.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{hours}h</p>
                            <p className="text-sm text-slate-500">{percentage}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-linear-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">Add Time Entry</h3>
                  <button
                    onClick={() => setShowAddEntry(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    defaultValue={selectedDate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="">Select a project</option>
                    {mockProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Task</label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend Development"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you worked on..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700">Billable</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}