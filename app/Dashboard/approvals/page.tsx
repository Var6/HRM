'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Banknote, LogOut, CheckCircle, XCircle, Calendar, FileText, Users } from 'lucide-react';

type TabType = 'expenses' | 'encashments' | 'exits';

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [expenseClaims, setExpenseClaims] = useState<any[]>([]);
  const [encashments, setEncashments] = useState<any[]>([]);
  const [exitInterviews, setExitInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'expenses') {
        const response = await fetch('/api/expense-claims?status=Pending');
        const data = await response.json();
        if (data.success) setExpenseClaims(data.data);
      } else if (activeTab === 'encashments') {
        const response = await fetch('/api/leave-encashments?status=Pending');
        const data = await response.json();
        if (data.success) setEncashments(data.data);
      } else if (activeTab === 'exits') {
        const response = await fetch('/api/exit-interviews?status=Pending');
        const data = await response.json();
        if (data.success) setExitInterviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleExpenseAction = async (claimId: string, action: string) => {
    if (action === 'reject') {
      const reason = prompt('Enter rejection reason:');
      if (!reason) return;

      setLoading(true);
      try {
        const response = await fetch('/api/expense-claims', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimId, action, approvedBy: 'HR Admin', rejectionReason: reason }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Claim rejected');
          fetchData();
        }
      } catch (error) {
        alert('Failed to process request');
      } finally {
        setLoading(false);
      }
    } else if (action === 'approve') {
      if (!confirm('Approve this expense claim?')) return;

      setLoading(true);
      try {
        const response = await fetch('/api/expense-claims', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimId, action, approvedBy: 'HR Admin' }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Claim approved successfully!');
          fetchData();
        }
      } catch (error) {
        alert('Failed to approve claim');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEncashmentAction = async (requestId: string, action: string) => {
    if (action === 'reject') {
      const reason = prompt('Enter rejection reason:');
      if (!reason) return;

      setLoading(true);
      try {
        const response = await fetch('/api/leave-encashments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, action, approvedBy: 'HR Admin', rejectionReason: reason }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Request rejected');
          fetchData();
        }
      } catch (error) {
        alert('Failed to process request');
      } finally {
        setLoading(false);
      }
    } else if (action === 'approve') {
      if (!confirm('Approve this encashment request?')) return;

      setLoading(true);
      try {
        const response = await fetch('/api/leave-encashments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, action, approvedBy: 'HR Admin' }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Request approved successfully!');
          fetchData();
        }
      } catch (error) {
        alert('Failed to approve request');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Requests Approval</h1>
          <p className="text-gray-600">Review and approve employee requests</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'expenses'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              Expense Claims
            </button>
            <button
              onClick={() => setActiveTab('encashments')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'encashments'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Banknote className="w-5 h-5" />
              Leave Encashments
            </button>
            <button
              onClick={() => setActiveTab('exits')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'exits'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LogOut className="w-5 h-5" />
              Exit Interviews
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Expense Claims */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Pending Expense Claims</h2>
              {expenseClaims.length > 0 ? (
                expenseClaims.map((claim) => (
                  <div key={claim._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">{claim.employeeName}</p>
                        <p className="text-sm text-gray-600">{claim.employeeCode}</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">₹{claim.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Claim Date</p>
                        <p className="font-medium">{new Date(claim.claimDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {claim.expenses.map((exp: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{exp.expenseType}</p>
                            <p className="text-sm text-gray-600">{exp.description}</p>
                            <p className="text-xs text-gray-500">{new Date(exp.expenseDate).toLocaleDateString('en-IN')}</p>
                          </div>
                          <p className="font-semibold text-gray-900">₹{exp.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExpenseAction(claim._id, 'approve')}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleExpenseAction(claim._id, 'reject')}
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-12">No pending expense claims</p>
              )}
            </div>
          )}

          {/* Leave Encashments */}
          {activeTab === 'encashments' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Pending Leave Encashments</h2>
              {encashments.length > 0 ? (
                encashments.map((enc) => (
                  <div key={enc._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">{enc.employeeName}</p>
                        <p className="text-sm text-gray-600">{enc.employeeCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Encashment Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{enc.encashmentAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Leave Type</p>
                        <p className="font-medium">{enc.leaveType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Days</p>
                        <p className="font-medium">{enc.leaveDays} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Per Day Rate</p>
                        <p className="font-medium">₹{enc.perDayRate.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEncashmentAction(enc._id, 'approve')}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleEncashmentAction(enc._id, 'reject')}
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-12">No pending encashment requests</p>
              )}
            </div>
          )}

          {/* Exit Interviews */}
          {activeTab === 'exits' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Exit Interviews</h2>
              {exitInterviews.length > 0 ? (
                exitInterviews.map((exit) => (
                  <div key={exit._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">{exit.employeeName}</h3>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="text-gray-600">Code:</span> {exit.employeeCode}</p>
                          <p className="text-sm"><span className="text-gray-600">Resignation Date:</span> {new Date(exit.resignationDate).toLocaleDateString('en-IN')}</p>
                          <p className="text-sm"><span className="text-gray-600">Last Working Day:</span> {new Date(exit.lastWorkingDay).toLocaleDateString('en-IN')}</p>
                          <p className="text-sm"><span className="text-gray-600">Reason:</span> {exit.reasonForLeaving}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Ratings</h4>
                        <div className="space-y-1 text-sm">
                          <p>Overall Experience: {exit.overallExperience}/5 ⭐</p>
                          {exit.managerRating && <p>Manager: {exit.managerRating}/5 ⭐</p>}
                          {exit.wouldRecommend !== null && (
                            <p className={exit.wouldRecommend ? 'text-green-600' : 'text-red-600'}>
                              Would Recommend: {exit.wouldRecommend ? 'Yes' : 'No'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-12">No recent exit interviews</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
