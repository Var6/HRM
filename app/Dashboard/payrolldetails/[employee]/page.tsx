'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Download, ChevronLeft, TrendingUp, Award,
  DollarSign, Percent, ArrowUpCircle, ArrowDownCircle,
  User, Receipt, Clock, CheckCircle, XCircle, Edit,
  Plus, Save, X, AlertTriangle, FileText, BarChart3,
  Target, Star, Briefcase, CreditCard, Send, CalendarDays
} from 'lucide-react';
import { downloadPayslip } from '@/lib/payslip-utils';
import type { EmployeeSalaryData } from '@/lib/payslip-utils';

interface PaymentHistory {
  _id: string;
  month: string;
  year: number;
  grossSalary: number;
  originalGrossSalary?: number;
  totalDeductions: number;
  netSalary: number;
  earnings: any;
  salarySnapshot?: any;
  deductions: any;
  lopDays?: number;
  lopAmount?: number;
  absent?: number;
  workingDays?: number;
  presentDays?: number;
  manualDeductions?: Array<{
    reason: string;
    amount: number;
    remarks: string;
    addedBy: string;
    addedAt: string;
  }>;
  totalManualDeductions?: number;
  salaryProcessed: boolean;
  salaryHold: boolean;
  processedDate: string;
  salaryHoldReason?: string;
}

interface PerformanceRecord {
  _id: string;
  date: string;
  rating: number;
  reviewer: string;
  comments: string;
  achievements: string[];
  improvementAreas: string[];
}

interface IncrementRecord {
  _id: string;
  date: string;
  type: 'hike' | 'increment' | 'bonus' | 'promotion';
  previousSalary: number;
  newSalary: number;
  percentage: number;
  reason: string;
  approvedBy: string;
  effectiveFrom: string;
}

interface EmployeeData {
  _id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  photograph: string;
  dateOfJoining: string;
  email: string;
  mobileNumber: string;
  salary: {
    earnings: any;
    deductions: any;
  };
  pfNo: string;
  uanNo: string;
  esiNo: string;
  bankAccountNo: string;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EmployeePayrollPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.employee as string;

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [incrementHistory, setIncrementHistory] = useState<IncrementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'performance' | 'increments'>('payments');
  
  // Modal states
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showManualDeductionModal, setShowManualDeductionModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  // Form states
  const [incrementForm, setIncrementForm] = useState({
    type: 'hike' as 'hike' | 'increment' | 'bonus' | 'promotion',
    percentage: '',
    reason: '',
    approvedBy: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const [manualDeductionForm, setManualDeductionForm] = useState({
    reason: '',
    amount: '',
    remarks: ''
  });

  const [performanceForm, setPerformanceForm] = useState({
    rating: 5,
    reviewer: '',
    comments: '',
    achievements: '',
    improvementAreas: ''
  });

  useEffect(() => {
    fetchEmployeeData();
    fetchPaymentHistory();
    fetchPerformanceRecords();
    fetchIncrementHistory();
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from API');
        return;
      }

      const data = JSON.parse(text);
      if (data.success && data.employee) {
        setEmployee(data.employee);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`/api/payroll/employee/${employeeId}`);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        setPaymentHistory([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from API');
        setPaymentHistory([]);
        return;
      }

      const data = JSON.parse(text);
      if (data.success && data.history) {
        setPaymentHistory(data.history);
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceRecords = async () => {
    try {
      const response = await fetch(`/api/performance/${employeeId}`);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        setPerformanceRecords([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from API');
        setPerformanceRecords([]);
        return;
      }

      const data = JSON.parse(text);
      if (data.success && data.records) {
        setPerformanceRecords(data.records);
      } else {
        setPerformanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      setPerformanceRecords([]);
    }
  };

  const fetchIncrementHistory = async () => {
    try {
      const response = await fetch(`/api/increments/${employeeId}`);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        setIncrementHistory([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response from API');
        setIncrementHistory([]);
        return;
      }

      const data = JSON.parse(text);
      if (data.success && data.increments) {
        setIncrementHistory(data.increments);
      } else {
        setIncrementHistory([]);
      }
    } catch (error) {
      console.error('Error fetching increments:', error);
      setIncrementHistory([]);
    }
  };

  const handleIncrementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    const currentGross: number = Object.values(employee.salary.earnings).reduce(
      (sum: number, val) => sum + Number(val || 0), 0
    );
    const percentageIncrease = parseFloat(incrementForm.percentage) / 100;
    const newGross = currentGross * (1 + percentageIncrease);

    try {
      const response = await fetch('/api/increments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          type: incrementForm.type,
          previousSalary: currentGross,
          newSalary: newGross,
          percentage: parseFloat(incrementForm.percentage),
          reason: incrementForm.reason,
          approvedBy: incrementForm.approvedBy,
          effectiveFrom: incrementForm.effectiveFrom
        })
      });

      if (response.ok) {
        setShowIncrementModal(false);
        setIncrementForm({
          type: 'hike',
          percentage: '',
          reason: '',
          approvedBy: '',
          effectiveFrom: new Date().toISOString().split('T')[0]
        });
        fetchIncrementHistory();
        fetchEmployeeData();
      }
    } catch (error) {
      console.error('Error adding increment:', error);
    }
  };

  const handlePerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          rating: performanceForm.rating,
          reviewer: performanceForm.reviewer,
          comments: performanceForm.comments,
          achievements: performanceForm.achievements.split('\n').filter(a => a.trim()),
          improvementAreas: performanceForm.improvementAreas.split('\n').filter(a => a.trim())
        })
      });

      if (response.ok) {
        setShowPerformanceModal(false);
        setPerformanceForm({
          rating: 5,
          reviewer: '',
          comments: '',
          achievements: '',
          improvementAreas: ''
        });
        fetchPerformanceRecords();
      }
    } catch (error) {
      console.error('Error adding performance:', error);
    }
  };

  const handleAddManualDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) return;

    const selectedPayment = paymentHistory.find(p => p._id === selectedPaymentId);
    if (!selectedPayment) return;

    const newDeduction = {
      reason: manualDeductionForm.reason,
      amount: parseFloat(manualDeductionForm.amount),
      remarks: manualDeductionForm.remarks,
      addedBy: 'HR',
      addedAt: new Date()
    };

    const manualDeductions = [...(selectedPayment.manualDeductions || []), newDeduction];

    try {
      const response = await fetch('/api/payroll/manual-deductions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          month: selectedPayment.month,
          year: selectedPayment.year,
          manualDeductions
        })
      });

      if (response.ok) {
        setShowManualDeductionModal(false);
        setManualDeductionForm({ reason: '', amount: '', remarks: '' });
        fetchPaymentHistory();
      }
    } catch (error) {
      console.error('Error adding manual deduction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  const currentGross: number = Object.values(employee.salary.earnings).reduce(
    (sum: number, val) => sum + Number(val || 0), 0
  );
  const currentDeductions: number = Object.values(employee.salary.deductions).reduce(
    (sum: number, val) => sum + Number(val || 0), 0
  );
  const currentNet: number = currentGross - currentDeductions;

  const averageRating = performanceRecords.length > 0
    ? performanceRecords.reduce((sum, r) => sum + r.rating, 0) / performanceRecords.length
    : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/Dashboard/payroll')}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div className="flex items-center gap-4">
                {employee.photograph ? (
                  <img 
                    src={employee.photograph} 
                    alt={employee.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                    <User className="w-10 h-10 text-cyan-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">{employee.name}</h1>
                  <p className="text-slate-600">{employee.designation} • {employee.department}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span>{employee.employeeCode}</span>
                    <span>•</span>
                    <span>Joined: {formatDate(employee.dateOfJoining)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/Dashboard/recruitment/${employeeId}`)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Current Net Salary</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(currentNet)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Receipt className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Payments</p>
              <p className="text-3xl font-bold text-slate-900">{paymentHistory.length}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Avg Performance</p>
              <p className="text-3xl font-bold text-slate-900">{averageRating.toFixed(1)}/5</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Increments</p>
              <p className="text-3xl font-bold text-slate-900">{incrementHistory.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex gap-2">
              {[
                { id: 'payments', label: 'Payment History', icon: Receipt },
                { id: 'performance', label: 'Performance', icon: Star },
                { id: 'increments', label: 'Hikes & Increments', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
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

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {paymentHistory.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No payment history</h3>
                <p className="text-slate-600">No salary payments have been processed yet</p>
              </div>
            ) : (
              paymentHistory.map((payment) => (
                <div
                  key={payment._id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        payment.salaryHold
                          ? 'bg-linear-to-br from-red-50 to-rose-50'
                          : payment.salaryProcessed
                          ? 'bg-linear-to-br from-green-50 to-emerald-50'
                          : 'bg-linear-to-br from-amber-50 to-orange-50'
                      }`}>
                        {payment.salaryHold ? (
                          <XCircle className="w-8 h-8 text-red-600" />
                        ) : payment.salaryProcessed ? (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : (
                          <Clock className="w-8 h-8 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {payment.month} {payment.year}
                        </h3>
                        <p className="text-slate-600 mb-2">
                          {payment.salaryProcessed 
                            ? `Processed on ${formatDate(payment.processedDate)}`
                            : payment.salaryHold
                            ? `On Hold: ${payment.salaryHoldReason || 'No reason specified'}`
                            : 'Processing pending'
                          }
                        </p>
                        
                        {/* ✅ Attendance Summary */}
                        {(payment.workingDays || payment.presentDays) && (
                          <div className="flex items-center gap-3 text-sm mb-2">
                            <div className="flex items-center gap-1 text-slate-600">
                              <CalendarDays className="w-4 h-4" />
                              <span>Working Days: {payment.workingDays || 0}</span>
                            </div>
                            <span className="text-slate-400">•</span>
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Present: {payment.presentDays || 0}</span>
                            </div>
                            {payment.lopDays && payment.lopDays > 0 && (
                              <>
                                <span className="text-slate-400">•</span>
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span>LOP: {payment.lopDays} days</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {payment.salaryHold && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              ON HOLD
                            </span>
                          )}
                          {payment.salaryProcessed && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              PAID
                            </span>
                          )}
                          {!payment.salaryProcessed && !payment.salaryHold && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                              PENDING
                            </span>
                          )}
                          {payment.lopDays && payment.lopDays > 0 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              LOP APPLIED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {payment.salaryProcessed && (
                      <button
                        onClick={() => {
                          const salaryData: EmployeeSalaryData = {
                            employeeId: employee.employeeCode,
                            employeeName: employee.name,
                            department: employee.department,
                            designation: employee.designation,
                            photograph: employee.photograph,
                            fatherName: 'N/A',
                            salaryHold: payment.salaryHold,
                            dateOfJoining: employee.dateOfJoining,
                            panNumber: 'N/A',
                            uanNumber: employee.uanNo || 'N/A',
                            salaryProcessed: payment.salaryProcessed,
                            esiNumber: employee.esiNo || 'N/A',
                            aadharNumber: 'N/A',
                            presentDays: payment.presentDays || 30,
                            totalDaysInMonth: payment.workingDays || 31,
                            modeOfPay: employee.bankAccountNo ? 'Bank Transfer' : 'Cash',
                            accountNumber: employee.bankAccountNo || 'N/A',
                            basic: payment.earnings?.basic || 0,
                            hra: payment.earnings?.hra || 0,
                            conveyance: payment.earnings?.conveyance || 0,
                            specialAllowance: payment.earnings?.specialAllowance || 0,
                            monthlyBonus: payment.earnings?.monthlyBonus || 0,
                            quarterlyBonus: payment.earnings?.quarterlyBonus || 0,
                            pf: payment.deductions?.pf || 0,
                            esic: payment.deductions?.esic || 0,
                            advance: payment.deductions?.salaryAdvance || 0,
                            loan: payment.deductions?.loan || 0,
                            lop: payment.deductions?.lop || payment.lopAmount || 0,
                            tds: payment.deductions?.tds || 0,
                          };
                          downloadPayslip(salaryData, payment.month, String(payment.year));
                        }}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Payslip
                      </button>
                    )}
                  </div>

                  {/* ✅ LOP Warning if applicable */}
                  {payment.lopDays && payment.lopDays > 0 && (
                    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-1">Loss of Pay Applied</h4>
                          <p className="text-sm text-orange-700">
                            {payment.lopDays} days of LOP deducted from gross salary. 
                            Amount deducted: <span className="font-semibold">{formatCurrency(payment.lopAmount || 0)}</span>
                          </p>
                          {payment.originalGrossSalary && (
                            <p className="text-xs text-orange-600 mt-1">
                              Original Gross: {formatCurrency(payment.originalGrossSalary)} → 
                              Adjusted Gross: {formatCurrency(payment.grossSalary)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary Breakdown */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 mb-1 font-semibold">
                        {payment.lopDays && payment.lopDays > 0 ? 'ADJUSTED GROSS' : 'GROSS SALARY'}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(payment.grossSalary)}
                      </p>
                      {payment.originalGrossSalary && payment.lopDays && payment.lopDays > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Before LOP: {formatCurrency(payment.originalGrossSalary)}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-linear-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-700 mb-1 font-semibold">DEDUCTIONS</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(payment.totalDeductions)}
                      </p>
                      {payment.lopAmount && payment.lopAmount > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Includes LOP: {formatCurrency(payment.lopAmount)}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                      <p className="text-xs text-cyan-700 mb-1 font-semibold">NET SALARY</p>
                      <p className="text-2xl font-bold text-cyan-600">
                        {formatCurrency(payment.netSalary)}
                      </p>
                    </div>
                  </div>

                  {/* Salary Snapshot Section */}
                  {payment.salarySnapshot && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-2">Salary Structure at Time of Processing</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(payment.salarySnapshot).map(([key, val]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-blue-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-semibold text-blue-700">{formatCurrency(val || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Deductions Section */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">Additional Deductions</h4>
                      <button
                        onClick={() => {
                          setSelectedPaymentId(payment._id);
                          setShowManualDeductionModal(true);
                        }}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Deduction
                      </button>
                    </div>

                    {payment.manualDeductions && payment.manualDeductions.length > 0 ? (
                      <div className="space-y-2">
                        {payment.manualDeductions.map((deduction, idx) => (
                          <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-red-900">{deduction.reason}</p>
                                {deduction.remarks && (
                                  <p className="text-xs text-red-600 mt-1">{deduction.remarks}</p>
                                )}
                                <p className="text-xs text-red-500 mt-1">Added by: {deduction.addedBy}</p>
                              </div>
                              <p className="font-bold text-red-700">{formatCurrency(deduction.amount)}</p>
                            </div>
                          </div>
                        ))}
                        <p className="text-sm font-semibold text-slate-700 pt-2">
                          Total Additional Deductions: {formatCurrency(payment.totalManualDeductions || 0)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No additional deductions</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Performance Records</h2>
              <button
                onClick={() => setShowPerformanceModal(true)}
                className="px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Performance Review
              </button>
            </div>

            {performanceRecords.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Star className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No performance records</h3>
                <p className="text-slate-600">Add the first performance review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {performanceRecords.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:border-cyan-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            Performance Review
                          </h3>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= record.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600">
                          Reviewed by {record.reviewer} on {formatDate(record.date)}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-cyan-50 rounded-lg">
                        <p className="text-3xl font-bold text-cyan-600">{record.rating}/5</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Comments</h4>
                        <p className="text-slate-600">{record.comments}</p>
                      </div>

                      {record.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            Key Achievements
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {record.achievements.map((achievement, idx) => (
                              <li key={idx} className="text-slate-600">{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.improvementAreas.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5 text-amber-600" />
                            Areas for Improvement
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {record.improvementAreas.map((area, idx) => (
                              <li key={idx} className="text-slate-600">{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Increments Tab */}
        {activeTab === 'increments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Salary Hikes & Increments</h2>
              <button
                onClick={() => setShowIncrementModal(true)}
                className="px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Increment
              </button>
            </div>

            {incrementHistory.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No increment history</h3>
                <p className="text-slate-600">Add the first salary increment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incrementHistory.map((increment, index) => (
                  <div
                    key={increment._id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:border-cyan-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          increment.type === 'promotion'
                            ? 'bg-linear-to-br from-purple-50 to-pink-50'
                            : increment.type === 'bonus'
                            ? 'bg-linear-to-br from-amber-50 to-orange-50'
                            : 'bg-linear-to-br from-green-50 to-emerald-50'
                        }`}>
                          {increment.type === 'promotion' ? (
                            <Award className="w-8 h-8 text-purple-600" />
                          ) : increment.type === 'bonus' ? (
                            <DollarSign className="w-8 h-8 text-amber-600" />
                          ) : (
                            <TrendingUp className="w-8 h-8 text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-slate-900 capitalize">
                              {increment.type}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              increment.type === 'promotion'
                                ? 'bg-purple-100 text-purple-700'
                                : increment.type === 'bonus'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              +{increment.percentage}%
                            </span>
                          </div>
                          <p className="text-slate-600 mb-2">
                            Effective from {formatDate(increment.effectiveFrom)}
                          </p>
                          <p className="text-sm text-slate-500">
                            Approved by {increment.approvedBy} on {formatDate(increment.date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Previous Salary</p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(increment.previousSalary)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 mb-1">New Salary</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(increment.newSalary)}
                        </p>
                      </div>
                      <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                        <p className="text-xs text-cyan-700 mb-1">Increment Amount</p>
                        <p className="text-lg font-bold text-cyan-600">
                          {formatCurrency(increment.newSalary - increment.previousSalary)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-2">Reason</h4>
                      <p className="text-slate-600">{increment.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Increment Modal */}
        {showIncrementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Add Salary Increment</h2>
                  <button
                    onClick={() => setShowIncrementModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleIncrementSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Increment Type
                  </label>
                  <select
                    value={incrementForm.type}
                    onChange={(e) => setIncrementForm({ ...incrementForm, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="hike">Annual Hike</option>
                    <option value="increment">Performance Increment</option>
                    <option value="bonus">Bonus</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Percentage Increase
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={incrementForm.percentage}
                      onChange={(e) => setIncrementForm({ ...incrementForm, percentage: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., 10"
                      required
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  {incrementForm.percentage && (
                    <p className="text-sm text-slate-600 mt-2">
                      New salary: {formatCurrency(currentGross * (1 + parseFloat(incrementForm.percentage) / 100))}
                      <span className="text-green-600 ml-2">
                        (+{formatCurrency(currentGross * parseFloat(incrementForm.percentage) / 100)})
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={incrementForm.effectiveFrom}
                    onChange={(e) => setIncrementForm({ ...incrementForm, effectiveFrom: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={incrementForm.approvedBy}
                    onChange={(e) => setIncrementForm({ ...incrementForm, approvedBy: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Name of approver"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={incrementForm.reason}
                    onChange={(e) => setIncrementForm({ ...incrementForm, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    placeholder="Reason for this increment..."
                    required
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowIncrementModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Increment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Performance Modal */}
        {showPerformanceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Add Performance Review</h2>
                  <button
                    onClick={() => setShowPerformanceModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePerformanceSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Performance Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setPerformanceForm({ ...performanceForm, rating })}
                        className={`p-3 rounded-lg transition-all ${
                          performanceForm.rating >= rating
                            ? 'bg-amber-100 border-2 border-amber-500'
                            : 'bg-slate-100 border-2 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            performanceForm.rating >= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Selected: {performanceForm.rating}/5
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    value={performanceForm.reviewer}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, reviewer: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Name of reviewer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    value={performanceForm.comments}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, comments: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    placeholder="Overall performance comments..."
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Key Achievements (one per line)
                  </label>
                  <textarea
                    value={performanceForm.achievements}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, achievements: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    placeholder="Achievement 1&#10;Achievement 2&#10;Achievement 3"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Areas for Improvement (one per line)
                  </label>
                  <textarea
                    value={performanceForm.improvementAreas}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, improvementAreas: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    placeholder="Area 1&#10;Area 2&#10;Area 3"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPerformanceModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manual Deduction Modal */}
        {showManualDeductionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add Manual Deduction</h2>
                <button
                  onClick={() => {
                    setShowManualDeductionModal(false);
                    setSelectedPaymentId(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleAddManualDeduction} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Deduction
                  </label>
                  <input
                    type="text"
                    value={manualDeductionForm.reason}
                    onChange={(e) => setManualDeductionForm({ ...manualDeductionForm, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Damage to company property, Late fees"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount to Deduct (₹)
                  </label>
                  <input
                    type="number"
                    value={manualDeductionForm.amount}
                    onChange={(e) => setManualDeductionForm({ ...manualDeductionForm, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={manualDeductionForm.remarks}
                    onChange={(e) => setManualDeductionForm({ ...manualDeductionForm, remarks: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Additional details..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualDeductionModal(false);
                      setSelectedPaymentId(null);
                      setManualDeductionForm({ reason: '', amount: '', remarks: '' });
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Deduction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
