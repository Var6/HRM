'use client';
import React, { useState, useEffect } from 'react';
import { Users, Search, Star } from 'lucide-react';

export default function ExitInterviewPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    resignationDate: '',
    lastWorkingDay: '',
    noticePeriod: 30,
    reasonForLeaving: 'Better Opportunity',
    detailedReason: '',
    overallExperience: 5,
    managerRating: 5,
    workEnvironmentRating: 5,
    learningOpportunitiesRating: 5,
    compensationRating: 5,
    wouldRecommend: true,
    suggestions: '',
    feedback: '',
    conductedBy: 'HR Manager',
    finalSettlement: {
      pendingSalary: 0,
      leaveEncashment: 0,
      bonus: 0,
      deductions: 0,
      totalAmount: 0,
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data.filter((emp: any) => emp.status === 'Active'));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    try {
      const totalAmount =
        formData.finalSettlement.pendingSalary +
        formData.finalSettlement.leaveEncashment +
        formData.finalSettlement.bonus -
        formData.finalSettlement.deductions;

      const response = await fetch('/api/exit-interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          ...formData,
          finalSettlement: {
            ...formData.finalSettlement,
            totalAmount,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Exit interview completed successfully!');
        setSelectedEmployee(null);
        fetchEmployees();
        // Reset form
        setFormData({
          resignationDate: '',
          lastWorkingDay: '',
          noticePeriod: 30,
          reasonForLeaving: 'Better Opportunity',
          detailedReason: '',
          overallExperience: 5,
          managerRating: 5,
          workEnvironmentRating: 5,
          learningOpportunitiesRating: 5,
          compensationRating: 5,
          wouldRecommend: true,
          suggestions: '',
          feedback: '',
          conductedBy: 'HR Manager',
          finalSettlement: {
            pendingSalary: 0,
            leaveEncashment: 0,
            bonus: 0,
            deductions: 0,
            totalAmount: 0,
          },
        });
      } else {
        alert(data.error || 'Failed to submit exit interview');
      }
    } catch (error) {
      alert('Failed to submit exit interview');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exit Interview</h1>
          <p className="text-gray-600">Conduct exit interview for departing employees</p>
        </div>

        {/* Employee Selection */}
        {!selectedEmployee && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or employee code..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp._id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="text-left border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <p className="font-semibold text-gray-900">{emp.name}</p>
                  <p className="text-sm text-gray-600">{emp.employeeCode}</p>
                  <p className="text-sm text-gray-500">{emp.designation}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exit Interview Form */}
        {selectedEmployee && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-gray-600">{selectedEmployee.employeeCode} • {selectedEmployee.designation}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change Employee
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Separation Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resignation Date</label>
                    <input
                      type="date"
                      value={formData.resignationDate}
                      onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Working Day</label>
                    <input
                      type="date"
                      value={formData.lastWorkingDay}
                      onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (Days)</label>
                    <input
                      type="number"
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reason for Leaving */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Leaving</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Reason</label>
                    <select
                      value={formData.reasonForLeaving}
                      onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Better Opportunity">Better Opportunity</option>
                      <option value="Higher Salary">Higher Salary</option>
                      <option value="Career Growth">Career Growth</option>
                      <option value="Work-Life Balance">Work-Life Balance</option>
                      <option value="Relocation">Relocation</option>
                      <option value="Health Issues">Health Issues</option>
                      <option value="Family Reasons">Family Reasons</option>
                      <option value="Further Studies">Further Studies</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Explanation</label>
                    <textarea
                      value={formData.detailedReason}
                      onChange={(e) => setFormData({ ...formData, detailedReason: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide more details..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Ratings</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'overallExperience', label: 'Overall Experience' },
                    { key: 'managerRating', label: 'Manager/Supervisor' },
                    { key: 'workEnvironmentRating', label: 'Work Environment' },
                    { key: 'learningOpportunitiesRating', label: 'Learning Opportunities' },
                    { key: 'compensationRating', label: 'Compensation & Benefits' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="flex items-center gap-1 min-w-[80px]">
                          {(formData as any)[key]} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.wouldRecommend}
                    onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Would recommend this organization to others</span>
                </label>
              </div>

              {/* Feedback */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions for Improvement</label>
                  <textarea
                    value={formData.suggestions}
                    onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="What could we do better?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Feedback</label>
                  <textarea
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any other comments..."
                  />
                </div>
              </div>

              {/* Final Settlement */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Settlement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pending Salary (₹)</label>
                    <input
                      type="number"
                      value={formData.finalSettlement.pendingSalary}
                      onChange={(e) => setFormData({
                        ...formData,
                        finalSettlement: { ...formData.finalSettlement, pendingSalary: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Encashment (₹)</label>
                    <input
                      type="number"
                      value={formData.finalSettlement.leaveEncashment}
                      onChange={(e) => setFormData({
                        ...formData,
                        finalSettlement: { ...formData.finalSettlement, leaveEncashment: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bonus/Incentives (₹)</label>
                    <input
                      type="number"
                      value={formData.finalSettlement.bonus}
                      onChange={(e) => setFormData({
                        ...formData,
                        finalSettlement: { ...formData.finalSettlement, bonus: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deductions (₹)</label>
                    <input
                      type="number"
                      value={formData.finalSettlement.deductions}
                      onChange={(e) => setFormData({
                        ...formData,
                        finalSettlement: { ...formData.finalSettlement, deductions: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Settlement Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{(
                        formData.finalSettlement.pendingSalary +
                        formData.finalSettlement.leaveEncashment +
                        formData.finalSettlement.bonus -
                        formData.finalSettlement.deductions
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-lg"
              >
                Complete Exit Interview
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
