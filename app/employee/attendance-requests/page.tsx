'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AttendanceRequestsPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    attendanceDate: '',
    status: 'Present',
    reason: '',
    supportingDocument: '',
    workingHours: 8,
  });

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      const emp = JSON.parse(employeeData);
      setEmployee(emp);
      fetchRequests(emp._id);
    }
  }, []);

  const fetchRequests = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/attendance-requests?employeeId=${employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employee) return;

    try {
      const response = await fetch('/api/attendance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee._id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Attendance request submitted successfully!');
        setShowForm(false);
        setFormData({
          attendanceDate: '',
          status: 'Present',
          reason: '',
          supportingDocument: '',
          workingHours: 8,
        });
        fetchRequests(employee._id);
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      alert('Failed to submit request');
    }
  };

  if (!employee) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Requests</h1>
            <p className="text-gray-600">Request attendance marking for past dates</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>

        {/* Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Attendance Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.attendanceDate}
                    onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Present">Present</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                  <input
                    type="number"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: parseFloat(e.target.value) })}
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why attendance marking is needed..."
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h2>
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {new Date(request.attendanceDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{request.reason}</p>
                      <p className="text-xs text-gray-500">Working Hours: {request.workingHours} hours</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        request.approvalStatus === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : request.approvalStatus === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.approvalStatus === 'Approved' && <CheckCircle className="w-4 h-4" />}
                        {request.approvalStatus === 'Rejected' && <XCircle className="w-4 h-4" />}
                        {request.approvalStatus === 'Pending' && <Clock className="w-4 h-4" />}
                        {request.approvalStatus}
                      </span>
                      {request.approvedBy && (
                        <p className="text-xs text-gray-500 mt-1">by {request.approvedBy}</p>
                      )}
                      {request.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2 max-w-xs">{request.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No attendance requests found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
