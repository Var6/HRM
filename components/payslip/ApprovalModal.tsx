'use client';

import React, { useEffect, useState } from 'react';
import {
  X, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import type { SalaryStructure } from '@/types/types';

interface ApprovalEmployee {
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  grossSalary: number;
  presentDays: number;
  totalDaysInMonth: number;
  currentDeductions: {
    pf: number;
    esic: number;
    advance: number;
    loan: number;
    tds: number;
    lop: number;
  };
}

interface ApprovalModalProps {
  employees: ApprovalEmployee[];
  month: string;
  year: number;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalData: any[]) => Promise<void>;
}

export default function ApprovalModal({
  employees,
  month,
  year,
  isOpen,
  onClose,
  onApprove,
}: ApprovalModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setApprovalData(
        employees.map(emp => ({
          employeeCode: emp.employeeCode,
          lopDays: calculateLOPDays(emp.presentDays, emp.totalDaysInMonth),
          adjustedPF: emp.currentDeductions.pf,
          adjustedESIC: emp.currentDeductions.esic,
          adjustedAdvance: emp.currentDeductions.advance,
          adjustedLoan: emp.currentDeductions.loan,
          adjustedTDS: emp.currentDeductions.tds,
          adjustedLOP: calculateLOPDays(emp.presentDays, emp.totalDaysInMonth) * (emp.grossSalary / emp.totalDaysInMonth),
          approvalDate: new Date().toISOString().split('T')[0],
          approvalTime: new Date().toTimeString().split(' ')[0],
          approvedBy: 'HR Admin',
          comments: ''
        }))
      );
    }
  }, [isOpen, employees]);

  const calculateLOPDays = (presentDays: number, totalDays: number): number => {
    return Math.max(0, totalDays - presentDays);
  };

  const calculateNetSalary = (empIndex: number): number => {
    const emp = employees[empIndex];
    const data = approvalData[empIndex];
    if (!data || !emp) return 0;

    const dailyRate = emp.grossSalary / emp.totalDaysInMonth;
    const lopDeduction = data.lopDays * dailyRate;

    return (
      emp.grossSalary -
      (data.adjustedPF +
        data.adjustedESIC +
        data.adjustedAdvance +
        data.adjustedLoan +
        data.adjustedTDS +
        lopDeduction)
    );
  };

  const handleLOPChange = (index: number, lopDays: number) => {
    const emp = employees[index];
    if (!emp) return;
    
    const newData = [...approvalData];
    const dailyRate = emp.grossSalary / emp.totalDaysInMonth;
    newData[index] = {
      ...newData[index],
      lopDays: Math.max(0, Math.min(lopDays, emp.totalDaysInMonth)),
      adjustedLOP: Math.max(0, Math.min(lopDays, emp.totalDaysInMonth)) * dailyRate,
    };
    setApprovalData(newData);
  };

  const handleDeductionChange = (
    index: number,
    field: 'adjustedPF' | 'adjustedESIC' | 'adjustedAdvance' | 'adjustedLoan' | 'adjustedTDS',
    value: number
  ) => {
    const newData = [...approvalData];
    newData[index] = {
      ...newData[index],
      [field]: Math.max(0, value),
    };
    setApprovalData(newData);
  };

  const handleCommentsChange = (index: number, comments: string) => {
    const newData = [...approvalData];
    newData[index] = {
      ...newData[index],
      comments,
    };
    setApprovalData(newData);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(approvalData);
      onClose();
    } catch (error) {
      console.error('Error approving salaries:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || employees.length === 0) return null;

  const currentEmployee = employees[currentIndex];
  const currentData = approvalData[currentIndex];
  
  // Safety check: return null if current employee or data is not available
  if (!currentEmployee || !currentData) return null;
  
  const netSalary = calculateNetSalary(currentIndex);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-slate-200 bg-white rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Salary Approval
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {month} {year} • Employee {currentIndex + 1} of {employees.length}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Employee Name</p>
                <p className="text-xl font-bold text-slate-900">
                  {currentEmployee.employeeName}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Employee Code</p>
                <p className="text-xl font-bold text-slate-900">
                  {currentEmployee.employeeCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Department</p>
                <p className="text-lg font-semibold text-slate-900">
                  {currentEmployee.department}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Designation</p>
                <p className="text-lg font-semibold text-slate-900">
                  {currentEmployee.designation}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance & LOP */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              Attendance & LOP Calculation
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Days in Month
                </label>
                <div className="text-3xl font-bold text-purple-600">
                  {currentEmployee.totalDaysInMonth}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Present Days
                </label>
                <div className="text-3xl font-bold text-green-600">
                  {currentEmployee.presentDays}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  LOP Days
                </label>
                <input
                  type="number"
                  min="0"
                  max={currentEmployee.totalDaysInMonth}
                  value={currentData?.lopDays || 0}
                  onChange={(e) =>
                    handleLOPChange(currentIndex, parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold text-red-600"
                />
              </div>
            </div>
          </div>

          {/* Salary Details */}
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Salary Calculation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-slate-700 font-medium">Gross Salary</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{currentEmployee.grossSalary.toFixed(2)}
                </span>
              </div>
              <div className="space-y-3 py-3 border-b border-green-200">
                <p className="text-sm font-semibold text-slate-600 mb-3">Deductions</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">PF</label>
                    <input
                      type="number"
                      min="0"
                      value={currentData?.adjustedPF || 0}
                      onChange={(e) =>
                        handleDeductionChange(
                          currentIndex,
                          'adjustedPF',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">ESIC</label>
                    <input
                      type="number"
                      min="0"
                      value={currentData?.adjustedESIC || 0}
                      onChange={(e) =>
                        handleDeductionChange(
                          currentIndex,
                          'adjustedESIC',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Advance</label>
                    <input
                      type="number"
                      min="0"
                      value={currentData?.adjustedAdvance || 0}
                      onChange={(e) =>
                        handleDeductionChange(
                          currentIndex,
                          'adjustedAdvance',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Loan</label>
                    <input
                      type="number"
                      min="0"
                      value={currentData?.adjustedLoan || 0}
                      onChange={(e) =>
                        handleDeductionChange(
                          currentIndex,
                          'adjustedLoan',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">TDS</label>
                    <input
                      type="number"
                      min="0"
                      value={currentData?.adjustedTDS || 0}
                      onChange={(e) =>
                        handleDeductionChange(
                          currentIndex,
                          'adjustedTDS',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">LOP Deduction</label>
                    <div className="px-3 py-2 bg-red-50 border border-red-300 rounded-lg font-semibold text-red-600">
                      ₹{(currentData?.adjustedLOP || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-lg font-bold text-slate-900">Net Salary</span>
                <span className="text-2xl font-bold text-cyan-600">
                  ₹{netSalary.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Approval Comments (Optional)
            </label>
            <textarea
              value={currentData?.comments || ''}
              onChange={(e) => handleCommentsChange(currentIndex, e.target.value)}
              placeholder="Add any notes or comments about this approval..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
            />
          </div>

          {/* Approval Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span>Approval Date:</span>
              <span className="font-semibold">{currentData?.approvalDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Approval Time:</span>
              <span className="font-semibold">{currentData?.approvalTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved By:</span>
              <span className="font-semibold">{currentData?.approvedBy}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-white rounded-b-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              {currentIndex + 1} / {employees.length}
            </span>
            {employees.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentIndex(Math.max(0, currentIndex - 1))
                  }
                  disabled={currentIndex === 0 || isProcessing}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex(
                      Math.min(employees.length - 1, currentIndex + 1)
                    )
                  }
                  disabled={currentIndex === employees.length - 1 || isProcessing}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Approve All ({employees.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
