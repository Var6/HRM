'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeNavbar from '@/components/employee/EmployeeNavbar';

interface EmployeeData {
  _id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  mobileNumber: string;
}

interface DataChangeRequest {
  _id: string;
  requestType: string;
  fieldName: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedOn: string;
  hrRemarks?: string;
  rejectionReason?: string;
}

export default function EmployeeDataRequests() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [dataRequests, setDataRequests] = useState<DataChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    requestType: 'contact',
    fieldName: '',
    currentValue: '',
    requestedValue: '',
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

    fetchDataRequests(parsedEmployee._id);
  }, []);

  const fetchDataRequests = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/data-change-requests?employeeId=${employeeId}`);
      const data = await response.json();

      if (data.success) {
        setDataRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching data change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/data-change-requests', {
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
        alert('Data change request submitted successfully!');
        setFormData({
          requestType: 'contact',
          fieldName: '',
          currentValue: '',
          requestedValue: '',
          reason: ''
        });
        setShowForm(false);
        fetchDataRequests(employee._id);
      } else {
        alert(data.message || 'Failed to submit data change request');
      }
    } catch (error) {
      console.error('Error submitting data change request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!employee) return;

    const confirmed = confirm('Are you sure you want to delete this request? This action cannot be undone.');
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/data-change-requests?id=${requestId}&employeeId=${employee._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Data change request deleted successfully!');
        fetchDataRequests(employee._id);
      } else {
        alert(data.message || 'Failed to delete data change request');
      }
    } catch (error) {
      console.error('Error deleting data change request:', error);
      alert('An error occurred. Please try again.');
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

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'contact':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'bank':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'emergency':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
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

  const fullName = employee.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeNavbar employeeName={fullName} employeeCode={employee.employeeCode} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Data Change Requests</h1>
            <p className="text-slate-600 mt-1">Request changes to your profile information</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{showForm ? 'Cancel' : 'New Request'}</span>
          </button>
        </div>

        {/* Data Change Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Request Data Change</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Request Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="personal">Personal Information</option>
                    <option value="contact">Contact Information</option>
                    <option value="emergency">Emergency Contact</option>
                    <option value="bank">Bank Details</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fieldName}
                    onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Mobile Number, Address, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Current value in the system"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Requested Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.requestedValue}
                    onChange={(e) => setFormData({ ...formData, requestedValue: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="New value you want"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Change <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Please explain why this change is needed..."
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
                  disabled={submitting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Change Requests List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">My Data Change Requests</h2>
          </div>
          
          {dataRequests.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="mt-4 text-slate-600">No data change requests yet</p>
              <p className="text-sm text-slate-500">Click "New Request" to submit a data change request</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {dataRequests.map((request) => (
                <div key={request._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          {getRequestTypeIcon(request.requestType)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 capitalize">
                            {request.requestType.replace('-', ' ')} - {request.fieldName}
                          </h3>
                          <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-13 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Current Value</p>
                            <p className="text-sm text-slate-800 wrap-break-word">{request.currentValue}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Requested Value</p>
                            <p className="text-sm text-slate-800 font-semibold wrap-break-word">{request.requestedValue}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Reason</p>
                          <p className="text-sm text-slate-700 wrap-break-word">{request.reason}</p>
                        </div>

                        {request.status === 'approved' && request.hrRemarks && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs font-medium text-green-700 mb-1">HR Remarks</p>
                            <p className="text-sm text-green-800 wrap-break-word">{request.hrRemarks}</p>
                          </div>
                        )}

                        {request.status === 'rejected' && request.rejectionReason && (
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-800 wrap-break-word">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-xs text-slate-500">Requested on</p>
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(request.requestedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(request._id)}
                          className="mt-3 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors flex items-center justify-center w-full"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Information
          </h3>
          <ul className="space-y-1 text-sm text-purple-800">
            <li>• All data change requests require HR approval</li>
            <li>• Ensure the information you provide is accurate</li>
            <li>• Supporting documents may be required for certain changes</li>
            <li>• Contact HR at <span className="font-semibold">hr@citizencooperative.in</span> for urgent requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
