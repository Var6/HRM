'use client';
import React, { useState } from 'react';
import { 
  Calendar, Users, TrendingUp, Clock, Plus, Download, Upload,
  Filter, Search, ChevronLeft, ChevronRight, Check, X, Coffee,
  Briefcase, Home, AlertCircle, CheckCircle, XCircle, Edit,
  Trash2, Eye, FileText, BarChart3, PieChart, Activity,
  User, MapPin, Phone, Mail, ChevronDown, ChevronUp, Save,
  DollarSign, CreditCard, Wallet, ArrowUpCircle, ArrowDownCircle,
  Calculator, Send, Ban, Lock, Unlock, Building2, Receipt,
  IndianRupee, Percent, TrendingDown, Award, Bell, Settings,
  AlertTriangle
} from 'lucide-react';
import { PayslipButton } from '@/lib/PayslipGenerator';
import { downloadPayslip } from '@/lib/payslip-utils';

// Types
import { SalaryStructure, PayrollRecord } from '@/types/types';
import type { EmployeeSalaryData } from '@/lib/payslip-utils';

const convertToEmployeeSalaryData = (emp: any): EmployeeSalaryData => {
  return {
    employeeId: emp.employeeCode || emp._id,
    employeeName: emp.name,
    department: emp.department,
    designation: emp.designation,
    fatherName: emp.fatherName || "N/A",
    dateOfJoining: emp.joinDate || "2020-01-01",
    panNumber: emp.pan || "N/A",
    uanNumber: emp.uan || "N/A",
    esiNumber: emp.esi || "N/A",
    aadharNumber: emp.aadhar || "N/A",
    presentDays: emp.presentDays || 30,
    totalDaysInMonth: 31,
    modeOfPay: emp.bankAccount ? "Bank Transfer" : "Cash",
    accountNumber: emp.bankAccount || "N/A",

    basic: emp.earnings?.basic || 0,
    hra: emp.earnings?.hra || 0,
    conveyance: emp.earnings?.conveyance || 0,
    specialAllowance: emp.earnings?.specialAllowance || 0,
    monthlyBonus: emp.earnings?.monthlyBonus || 0,
    quarterlyBonus: emp.earnings?.quarterlyBonus || 0,

    pf: emp.deductions?.pf || 0,
    esic: emp.deductions?.esic || 0,
    advance: emp.deductions?.advance || 0,
    loan: emp.deductions?.loan || 0,
    lop: emp.deductions?.lop || 0,
    tds: emp.deductions?.tds || 0,
  };
};

// Mock Data
const mockSalaryData: SalaryStructure[] = [
  {
    employeeId: 1,
    employeeName: 'ALAKA KUMARI',
    employeeCode: 'EMP001',
    designation: 'Dy. Manager-HR',
    department: 'HR',
    branch: 'Corporate Office',
    earnings: {
      basic: 35000,
      hra: 14000,
      conveyance: 2400,
      monthlyBonus: 3000,
      quarterlyBonus: 0,
      specialAllowance: 5600
    },
    deductions: {
      pf: 4200,
      esic: 525,
      lop: 0,
      salaryAdvance: 0,
      loan: 2000,
      tds: 1500
    },
    grossSalary: 60000,
    totalDeductions: 8225,
    netSalary: 51775,
    bankAccount: '1234567890',
    pfNumber: 'PF/PAT/123456',
    uanNumber: '100123456789',
    esiNumber: 'ESI/123456789'
  },
  {
    employeeId: 2,
    employeeName: 'SANTOSH KUMAR',
    employeeCode: 'EMP002',
    designation: 'Asst. Accountant',
    department: 'Finance',
    branch: 'Corporate Office',
    earnings: {
      basic: 28000,
      hra: 11200,
      conveyance: 2400,
      monthlyBonus: 2500,
      quarterlyBonus: 0,
      specialAllowance: 4400
    },
    deductions: {
      pf: 3360,
      esic: 420,
      lop: 0,
      salaryAdvance: 1000,
      loan: 0,
      tds: 800
    },
    grossSalary: 48500,
    totalDeductions: 5580,
    netSalary: 42920,
    bankAccount: '9876543210',
    pfNumber: 'PF/PAT/123457',
    uanNumber: '100123456790',
    esiNumber: 'ESI/123456790'
  },
  {
    employeeId: 3,
    employeeName: 'SANKET PRASAD SINHA',
    employeeCode: 'EMP003',
    designation: 'Asst. Branch Incharge',
    department: 'Operations',
    branch: 'Patna Branch',
    earnings: {
      basic: 32000,
      hra: 12800,
      conveyance: 2400,
      monthlyBonus: 2800,
      quarterlyBonus: 0,
      specialAllowance: 5000
    },
    deductions: {
      pf: 3840,
      esic: 480,
      lop: 0,
      salaryAdvance: 0,
      loan: 1500,
      tds: 1000
    },
    grossSalary: 55000,
    totalDeductions: 6820,
    netSalary: 48180,
    bankAccount: '5555666677',
    pfNumber: 'PF/PAT/123458',
    uanNumber: '100123456791',
    esiNumber: 'ESI/123456791'
  },
  {
    employeeId: 4,
    employeeName: 'KRITI KAMINI',
    employeeCode: 'EMP004',
    designation: 'Office Assistant',
    department: 'Admin',
    branch: 'Corporate Office',
    earnings: {
      basic: 18000,
      hra: 7200,
      conveyance: 2400,
      monthlyBonus: 1500,
      quarterlyBonus: 0,
      specialAllowance: 2900
    },
    deductions: {
      pf: 2160,
      esic: 270,
      lop: 0,
      salaryAdvance: 500,
      loan: 0,
      tds: 0
    },
    grossSalary: 32000,
    totalDeductions: 2930,
    netSalary: 29070,
    bankAccount: '1111222233',
    pfNumber: 'PF/PAT/123459',
    uanNumber: '100123456792',
    esiNumber: 'ESI/123456792'
  }
];

const mockPayrollHistory: PayrollRecord[] = [
  {
    id: 1,
    month: 'January',
    year: 2026,
    processedDate: '2026-01-28',
    totalEmployees: 4,
    totalGrossSalary: 195500,
    totalDeductions: 23555,
    totalNetSalary: 171945,
    status: 'processing',
  },
  {
    id: 2,
    month: 'December',
    year: 2025,
    processedDate: '2025-12-28',
    totalEmployees: 4,
    totalGrossSalary: 195500,
    totalDeductions: 23555,
    totalNetSalary: 171945,
    status: 'paid',
    approvedBy: 'Sanjay Mishra',
    paidDate: '2025-12-30'
  },
  {
    id: 3,
    month: 'November',
    year: 2025,
    processedDate: '2025-11-28',
    totalEmployees: 4,
    totalGrossSalary: 195500,
    totalDeductions: 23555,
    totalNetSalary: 171945,
    status: 'paid',
    approvedBy: 'Sanjay Mishra',
    paidDate: '2025-11-30'
  }
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollManagement() {
  const [selectedView, setSelectedView] = useState<'overview' | 'salary-structure' | 'process' | 'payslips' | 'reports'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const filteredEmployees = mockSalaryData.filter(emp =>
    emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    totalEmployees: mockSalaryData.length,
    totalPayroll: mockSalaryData.reduce((sum, emp) => sum + emp.netSalary, 0),
    averageSalary: mockSalaryData.reduce((sum, emp) => sum + emp.netSalary, 0) / mockSalaryData.length,
    totalDeductions: mockSalaryData.reduce((sum, emp) => sum + emp.totalDeductions, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Payroll Management</h1>
              <p className="text-slate-600">Process salaries, generate payslips, and manage employee compensation</p>
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
                onClick={() => setShowProcessModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <Calculator className="w-5 h-5" />
                Process Payroll
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  This Month
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalPayroll)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Average Salary</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.averageSalary)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <ArrowDownCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalDeductions)}</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'salary-structure', label: 'Salary Structure', icon: Building2 },
                { id: 'process', label: 'Process Payroll', icon: Calculator },
                { id: 'payslips', label: 'Payslips', icon: Receipt },
                { id: 'reports', label: 'Reports', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    selectedView === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
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

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees by name, code, or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Employee Salary Cards */}
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                          <User className="w-8 h-8 text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{employee.employeeName}</h3>
                          <p className="text-slate-600 mb-1">{employee.designation}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{employee.employeeCode}</span>
                            <span>•</span>
                            <span>{employee.department}</span>
                            <span>•</span>
                            <span>{employee.branch}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPayslipModal(true)}
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                        >
                          <Receipt className="w-4 h-4" />
                          Payslip
                        </button>
                        <button
                          onClick={() => setSelectedEmployee(selectedEmployee === employee.employeeId ? null : employee.employeeId)}
                          className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-all flex items-center gap-2"
                        >
                          {selectedEmployee === employee.employeeId ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Details
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 mb-1 font-semibold">GROSS SALARY</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(employee.grossSalary)}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 mb-1 font-semibold">DEDUCTIONS</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(employee.totalDeductions)}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                        <p className="text-xs text-cyan-700 mb-1 font-semibold">NET SALARY</p>
                        <p className="text-2xl font-bold text-cyan-600">{formatCurrency(employee.netSalary)}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-600 mb-1 font-semibold">BANK A/C</p>
                        <p className="text-lg font-bold text-slate-900">{employee.bankAccount}</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedEmployee === employee.employeeId && (
                      <div className="pt-6 mt-6 border-t border-slate-200">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Earnings */}
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <ArrowUpCircle className="w-5 h-5 text-green-600" />
                              Earnings Breakdown
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Basic Salary</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings.basic)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">HRA (40%)</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings.hra)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Conveyance</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings.conveyance)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Monthly Bonus</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings.monthlyBonus)}</span>
                              </div>
                              {employee.earnings.quarterlyBonus > 0 && (
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                  <span className="text-slate-700">Quarterly Bonus</span>
                                  <span className="font-bold text-amber-600">{formatCurrency(employee.earnings.quarterlyBonus)}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Special Allowance</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings.specialAllowance)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border-2 border-green-300 mt-2">
                                <span className="font-semibold text-green-800">Total Earnings</span>
                                <span className="font-bold text-green-700 text-lg">{formatCurrency(employee.grossSalary)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Deductions */}
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <ArrowDownCircle className="w-5 h-5 text-red-600" />
                              Deductions Breakdown
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <span className="text-slate-700 block">PF (12%)</span>
                                  <span className="text-xs text-slate-500">{employee.pfNumber}</span>
                                </div>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.deductions.pf)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <span className="text-slate-700 block">ESIC</span>
                                  <span className="text-xs text-slate-500">{employee.esiNumber}</span>
                                </div>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.deductions.esic)}</span>
                              </div>
                              {employee.deductions.lop > 0 && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                  <span className="text-slate-700">LOP (Loss of Pay)</span>
                                  <span className="font-bold text-red-600">{formatCurrency(employee.deductions.lop)}</span>
                                </div>
                              )}
                              {employee.deductions.salaryAdvance > 0 && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-slate-700">Salary Advance</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(employee.deductions.salaryAdvance)}</span>
                                </div>
                              )}
                              {employee.deductions.loan > 0 && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-slate-700">Loan Deduction</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(employee.deductions.loan)}</span>
                                </div>
                              )}
                              {employee.deductions.tds > 0 && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-slate-700">TDS</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(employee.deductions.tds)}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg border-2 border-red-300 mt-2">
                                <span className="font-semibold text-red-800">Total Deductions</span>
                                <span className="font-bold text-red-700 text-lg">{formatCurrency(employee.totalDeductions)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Statutory Details */}
                        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Statutory Information</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">PF Number</p>
                              <p className="text-sm font-bold text-slate-900">{employee.pfNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">UAN Number</p>
                              <p className="text-sm font-bold text-slate-900">{employee.uanNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">ESI Number</p>
                              <p className="text-sm font-bold text-slate-900">{employee.esiNumber}</p>
                            </div>
                          </div>
                        </div>

                        {/* Net Salary */}
                        <div className="mt-6 p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-cyan-100 mb-1">NET SALARY (Take Home)</p>
                              <p className="text-4xl font-bold">{formatCurrency(employee.netSalary)}</p>
                            </div>
                            <CreditCard className="w-16 h-16 text-white opacity-20" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salary Structure Tab */}
        {selectedView === 'salary-structure' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Employee Salary Structure</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Basic</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">HRA</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Conveyance</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Bonus</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700">Special</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700 bg-green-50">Gross</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700 bg-red-50">Deductions</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-slate-700 bg-cyan-50">Net</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSalaryData.map((employee) => (
                    <tr key={employee.employeeId} className="border-b border-slate-200 hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{employee.employeeName}</p>
                          <p className="text-xs text-slate-500">{employee.employeeCode} • {employee.designation}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings.basic)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings.hra)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings.conveyance)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings.monthlyBonus)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings.specialAllowance)}</td>
                      <td className="px-4 py-4 text-right font-bold text-green-600 bg-green-50">{formatCurrency(employee.grossSalary)}</td>
                      <td className="px-4 py-4 text-right font-bold text-red-600 bg-red-50">{formatCurrency(employee.totalDeductions)}</td>
                      <td className="px-4 py-4 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(employee.netSalary)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td className="px-6 py-4 text-slate-900">TOTALS</td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.earnings.basic, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.earnings.hra, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.earnings.conveyance, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.earnings.monthlyBonus, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.earnings.specialAllowance, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-green-700 bg-green-100">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.grossSalary, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-red-700 bg-red-100">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.totalDeductions, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-cyan-700 bg-cyan-100 text-lg">
                      {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.netSalary, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Process Payroll Tab */}
        {selectedView === 'process' && (
          <div className="space-y-6">
            {/* Month Selector */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div>
                    <p className="text-sm text-slate-600">Processing Payroll For</p>
                    <p className="text-xl font-bold text-slate-900">{months[selectedMonth]} {selectedYear}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-600 font-semibold mb-1">Status</p>
                    <p className="text-sm font-bold text-amber-700">Processing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-green-800 mb-4">Total Gross Salary</h4>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.grossSalary, 0))}
                </p>
                <p className="text-sm text-green-700">{mockSalaryData.length} employees</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-red-800 mb-4">Total Deductions</h4>
                <p className="text-4xl font-bold text-red-600 mb-2">
                  {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.totalDeductions, 0))}
                </p>
                <p className="text-sm text-red-700">PF, ESIC, Loans, Advances</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-cyan-800 mb-4">Total Net Payable</h4>
                <p className="text-4xl font-bold text-cyan-600 mb-2">
                  {formatCurrency(mockSalaryData.reduce((sum, emp) => sum + emp.netSalary, 0))}
                </p>
                <p className="text-sm text-cyan-700">Ready for disbursement</p>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payroll Processing Steps</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Attendance Verified</h4>
                    <p className="text-sm text-slate-600">All employee attendance records have been verified and LOP calculated</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Salary Components Calculated</h4>
                    <p className="text-sm text-slate-600">All earnings and deductions have been computed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Awaiting Approval</h4>
                    <p className="text-sm text-slate-600">Payroll ready for management approval</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Generate Payslips</h4>
                    <p className="text-sm text-slate-600">Create and distribute payslips to all employees</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Process Bank Transfer</h4>
                    <p className="text-sm text-slate-600">Initiate salary disbursement to employee bank accounts</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium">
                  Save as Draft
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg">
                  <Send className="w-5 h-5" />
                  Submit for Approval
                </button>
              </div>
            </div>

            {/* Payroll History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payroll History</h3>
              <div className="space-y-3">
                {mockPayrollHistory.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        record.status === 'paid' 
                          ? 'bg-green-100'
                          : record.status === 'approved'
                          ? 'bg-blue-100'
                          : 'bg-amber-100'
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                          record.status === 'paid'
                            ? 'text-green-600'
                            : record.status === 'approved'
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{record.month} {record.year}</p>
                        <p className="text-sm text-slate-500">{record.totalEmployees} employees • {formatCurrency(record.totalNetSalary)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'approved'
                            ? 'bg-blue-100 text-blue-700'
                            : record.status === 'processing'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                      <button className="p-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payslips Tab */}
        {selectedView === 'payslips' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Generate Payslips</h3>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option>January 2026</option>
                    <option>December 2025</option>
                    <option>November 2025</option>
                  </select>
                  <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg">
                    <Download className="w-5 h-5" />
                    Download All
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {mockSalaryData.map((employee) => (
                  <div key={employee.employeeId} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg hover:border-cyan-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{employee.employeeName}</p>
                        <p className="text-sm text-slate-500">{employee.employeeCode} • {employee.designation}</p>
                      </div>
                      <button
  onClick={() =>
    downloadPayslip(
      convertToEmployeeSalaryData(employee),
      "January",
      "2026"
    )
  }
  className="px-3 py-1 bg-green-600 text-white rounded-md"
>
  Download Payslip
</button>


                      <Receipt className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-600">Net Salary</span>
                      <span className="font-bold text-cyan-600">{formatCurrency(employee.netSalary)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-4 py-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-all flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {selectedView === 'reports' && (
          <div className="space-y-6">
            {/* Report Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                    <FileText className="w-8 h-8 text-cyan-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Monthly Salary Register</h3>
                <p className="text-sm text-slate-600">Complete salary breakdown for all employees</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-green-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">PF & ESIC Report</h3>
                <p className="text-sm text-slate-600">Statutory compliance report for PF and ESI</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-purple-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Department-wise Analysis</h3>
                <p className="text-sm text-slate-600">Salary distribution by department</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-amber-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-amber-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Bank Transfer Sheet</h3>
                <p className="text-sm text-slate-600">Format for bank salary disbursement</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <Percent className="w-8 h-8 text-blue-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">TDS Report</h3>
                <p className="text-sm text-slate-600">Tax deducted at source summary</p>
              </button>

              <button className="bg-white rounded-xl border-2 border-slate-200 hover:border-red-300 shadow-sm p-6 text-left transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Loan & Advance Report</h3>
                <p className="text-sm text-slate-600">Outstanding loans and advances</p>
              </button>
            </div>

            {/* Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-cyan-600" />
                  Salary Component Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Basic Salary</span>
                      <span className="font-bold text-slate-900">58%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">HRA</span>
                      <span className="font-bold text-slate-900">23%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Allowances & Bonus</span>
                      <span className="font-bold text-slate-900">19%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full" style={{ width: '19%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  Department-wise Payroll
                </h3>
                <div className="space-y-4">
                  {['HR', 'Finance', 'Operations', 'Admin'].map((dept, idx) => {
                    const amounts = [60000, 48500, 55000, 32000];
                    const percentage = ((amounts[idx] / 195500) * 100).toFixed(0);
                    return (
                      <div key={dept}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">{dept}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(amounts[idx])}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}