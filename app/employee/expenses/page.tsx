'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ExpenseClaimsPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState([{ expenseType: 'Travel', amount: 0, expenseDate: '', description: '', receipt: '' }]);
  const [claimDate, setClaimDate] = useState('');

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      const emp = JSON.parse(employeeData);
      setEmployee(emp);
      fetchClaims(emp._id);
    }
  }, []);

  const fetchClaims = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/expense-claims?employeeId=${employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setClaims(data.data);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const addExpense = () => {
    setExpenses([...expenses, { expenseType: 'Travel', amount: 0, expenseDate: '', description: '', receipt: '' }]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: string, value: any) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employee) return;

    try {
      const response = await fetch('/api/expense-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee._id,
          claimDate,
          expenses,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Expense claim submitted successfully!');
        setShowForm(false);
        setExpenses([{ expenseType: 'Travel', amount: 0, expenseDate: '', description: '', receipt: '' }]);
        setClaimDate('');
        fetchClaims(employee._id);
      } else {
        alert(data.error || 'Failed to submit claim');
      }
    } catch (error) {
      alert('Failed to submit claim');
    }
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount as any) || 0), 0);
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
            <h1 className="text-2xl font-bold text-gray-900">Expense Claims</h1>
            <p className="text-gray-600">Submit and track your expense reimbursements</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ New Claim'}
          </button>
        </div>

        {/* Claim Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Expense Claim</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claim Date</label>
                <input
                  type="date"
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Expenses</h3>
                  <button
                    type="button"
                    onClick={addExpense}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                </div>

                <div className="space-y-4">
                  {expenses.map((expense, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <select
                            value={expense.expenseType}
                            onChange={(e) => updateExpense(index, 'expenseType', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="Travel">Travel</option>
                            <option value="Food">Food</option>
                            <option value="Accommodation">Accommodation</option>
                            <option value="Medical">Medical</option>
                            <option value="Communication">Communication</option>
                            <option value="Office Supplies">Office Supplies</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                          <input
                            type="number"
                            value={expense.amount}
                            onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            value={expense.expenseDate}
                            onChange={(e) => updateExpense(index, 'expenseDate', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="flex items-end">
                          {expenses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExpense(index)}
                              className="text-red-600 hover:text-red-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={expense.description}
                          onChange={(e) => updateExpense(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe the expense..."
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">₹{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Submit Claim
              </button>
            </form>
          </div>
        )}

        {/* Claims List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Claims</h2>
          <div className="space-y-4">
            {claims.length > 0 ? (
              claims.map((claim) => (
                <div key={claim._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(claim.claimDate).toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">₹{claim.totalAmount.toFixed(2)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      claim.approvalStatus === 'Approved' || claim.approvalStatus === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : claim.approvalStatus === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {claim.approvalStatus === 'Approved' && <CheckCircle className="w-4 h-4" />}
                      {claim.approvalStatus === 'Rejected' && <XCircle className="w-4 h-4" />}
                      {claim.approvalStatus === 'Pending' && <Clock className="w-4 h-4" />}
                      {claim.approvalStatus === 'Paid' ? 'Paid' : claim.approvalStatus}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {claim.expenses.map((exp: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">{exp.expenseType} - {exp.description}</span>
                        <span className="font-medium">₹{exp.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {claim.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {claim.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No expense claims found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
