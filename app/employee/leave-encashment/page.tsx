'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Banknote, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function LeaveEncashmentPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [encashments, setEncashments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Earned Leave',
    leaveDays: 0,
    perDayRate: 0,
    payrollMonth: '',
    notes: '',
  });

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      const emp = JSON.parse(employeeData);
      setEmployee(emp);
      fetchEncashments(emp._id);
    }
  }, []);

  const fetchEncashments = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/leave-encashments?employeeId=${employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setEncashments(data.data);
      }
    } catch (error) {
      console.error('Error fetching encashments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employee) return;

    try {
      const response = await fetch('/api/leave-encashments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee._id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave encashment request submitted successfully!');
        setShowForm(false);
        setFormData({
          leaveType: 'Earned Leave',
          leaveDays: 0,
          perDayRate: 0,
          payrollMonth: '',
          notes: '',
        });
        fetchEncashments(employee._id);
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      alert('Failed to submit request');
    }
  };

  const getTotalAmount = () => {
    return formData.leaveDays * formData.perDayRate;
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
            <h1 className="text-2xl font-bold text-gray-900">Leave Encashment</h1>
            <p className="text-gray-600">Convert your unused leaves into cash</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Encashment Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Privilege Leave">Privilege Leave</option>
                    <option value="Compensatory Leave">Compensatory Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
                  <input
                    type="number"
                    value={formData.leaveDays}
                    onChange={(e) => setFormData({ ...formData, leaveDays: parseFloat(e.target.value) })}
                    min="0.5"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Per Day Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.perDayRate}
                    onChange={(e) => setFormData({ ...formData, perDayRate: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Daily salary rate for calculation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Month</label>
                  <input
                    type="month"
                    value={formData.payrollMonth}
                    onChange={(e) => setFormData({ ...formData, payrollMonth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Encashment Amount</span>
                  <span className="text-2xl font-bold text-green-600">₹{getTotalAmount().toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {formData.leaveDays} days × ₹{formData.perDayRate.toFixed(2)} per day
                </p>
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

        {/* Encashment List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Encashment Requests</h2>
          <div className="space-y-4">
            {encashments.length > 0 ? (
              encashments.map((encashment) => (
                <div key={encashment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Banknote className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">{encashment.leaveType}</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {encashment.leaveDays} days
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-2">₹{encashment.encashmentAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Payroll Month: {new Date(encashment.payrollMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </p>
                      {encashment.notes && <p className="text-sm text-gray-500 mt-2">{encashment.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        encashment.status === 'Approved' || encashment.status === 'Paid'
                          ? 'bg-green-100 text-green-700'
                          : encashment.status === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {encashment.status === 'Approved' && <CheckCircle className="w-4 h-4" />}
                        {encashment.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                        {encashment.status === 'Pending' && <Clock className="w-4 h-4" />}
                        {encashment.status}
                      </span>
                      {encashment.approvedBy && (
                        <p className="text-xs text-gray-500 mt-1">by {encashment.approvedBy}</p>
                      )}
                      {encashment.paidDate && (
                        <p className="text-xs text-green-600 mt-1">
                          Paid on {new Date(encashment.paidDate).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                  {encashment.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700"><strong>Reason:</strong> {encashment.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No encashment requests found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
