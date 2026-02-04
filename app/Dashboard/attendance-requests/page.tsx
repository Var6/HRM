'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export default function AttendanceRequestsApprovalPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/attendance-requests?status=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Approve this attendance request?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/attendance-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'approve',
          approvedBy: 'HR Admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Request approved successfully!');
        fetchRequests();
      } else {
        alert(data.error || 'Failed to approve');
      }
    } catch (error) {
      alert('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch('/api/attendance-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'reject',
          approvedBy: 'HR Admin',
          rejectionReason: reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Request rejected');
        fetchRequests();
      } else {
        alert(data.error || 'Failed to reject');
      }
    } catch (error) {
      alert('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Requests Approval</h1>
          <p className="text-gray-600">Review and approve employee attendance requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex gap-4">
            {['Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{request.employeeName}</p>
                          <p className="text-sm text-gray-600">{request.employeeCode}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">
                            {new Date(request.attendanceDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Working Hours</p>
                          <p className="font-medium">{request.workingHours} hours</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-medium">
                            {new Date(request.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                      </div>
                    </div>

                    {request.approvalStatus === 'Pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={loading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {request.approvalStatus !== 'Pending' && (
                      <div>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                          request.approvalStatus === 'Approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {request.approvalStatus === 'Approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {request.approvalStatus}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">by {request.approvedBy}</p>
                        {request.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">{request.rejectionReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-12">No {filter.toLowerCase()} requests found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
