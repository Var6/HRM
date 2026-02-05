'use client';
import React, { useEffect, useState } from 'react';
import { 
  Calendar, Users, TrendingUp, Clock, Plus, Download, Upload,
  Filter, Search, ChevronLeft, ChevronRight, Check, X, Coffee,
  Briefcase, Home, AlertCircle, CheckCircle, XCircle, Edit,
  Trash2, Eye, FileText, BarChart3, PieChart, Activity,
  User, MapPin, Phone, Mail, ChevronDown, ChevronUp, Save,
  DollarSign, CreditCard, Wallet, ArrowUpCircle, ArrowDownCircle,
  Calculator, Send, Ban, Lock, Unlock, Building2, Receipt,
  IndianRupee, Percent, TrendingDown, Award, Bell, Settings,
  AlertTriangle, FileJson,
  Edit2Icon
} from 'lucide-react';
import { PayslipButton } from '@/lib/PayslipGenerator';
import { downloadPayslip } from '@/lib/payslip-utils';
import { 
  exportPayrollToExcel, 
  exportSalaryRegister,
  exportPayslipToExcel,
  generatePayslipHTML 
} from '@/lib/payroll-export-helpers';
import { calculateLOP, calculateLOPAmount, getDaysInMonth } from '@/lib/attendance-utils';

// Types
import { SalaryStructure, PayrollRecord } from '@/types/types';
import { useRouter } from 'next/navigation';
import type { EmployeeSalaryData } from '@/lib/payslip-utils';

const convertToEmployeeSalaryData = (emp: SalaryStructure, month?: number, year?: number): EmployeeSalaryData => {
  const totalDays = month !== undefined && year !== undefined ? getDaysInMonth(month, year) : 31;
  return {
    employeeId: String(emp.employeeCode || emp.employeeId),
    employeeName: emp.employeeName,
    department: emp.department,
    designation: emp.designation,
    photograph: emp.photograph,
    fatherName: emp.fatherName || "N/A",
    salaryHold: emp.salaryHold || false,
    dateOfJoining: emp.dateOfJoining || "2020-01-01",
    panNumber: emp.panNumber || "N/A",
    uanNumber: emp.uanNumber || "N/A",
    salaryProcessed: emp.salaryProcessed || false,
    esiNumber: emp.esiNumber || "N/A",
    aadharNumber: emp.aadharNumber || "N/A",
    presentDays: emp.presentDays || 30,
    totalDaysInMonth: totalDays,
    modeOfPay: emp.bankAccount && emp.bankAccount !== "N/A" ? "Bank Transfer" : "Cash",
    accountNumber: emp.bankAccount || "N/A",

    basic: emp.earnings?.basic || 0,
    hra: emp.earnings?.hra || 0,
    conveyance: emp.earnings?.conveyance || 0,
    specialAllowance: emp.earnings?.specialAllowance || 0,
    monthlyBonus: emp.earnings?.monthlyBonus || 0,
    quarterlyBonus: emp.earnings?.quarterlyBonus || 0,

    pf: emp.deductions?.pf || 0,
    esic: emp.deductions?.esic || 0,
    advance: emp.deductions?.advance || emp.deductions?.salaryAdvance || 0,
    loan: emp.deductions?.loan || 0,
    lop: emp.deductions?.lop || emp.lopAmount || 0,
    tds: emp.deductions?.tds || 0,
  };
};


// Add useEffect to fetch data


const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollManagement() {
  const router = useRouter();

  const [salaryData, setSalaryData] = useState<SalaryStructure[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'salary-structure' | 'process' | 'payslips' | 'reports'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [salaryRegisterReport, setSalaryRegisterReport] = useState<any>(null);
  const [pfEsicReport, setPFEsicReport] = useState<any>(null);
  const [deptAnalysisReport, setDeptAnalysisReport] = useState<any>(null);
  const [bankTransferReport, setBankTransferReport] = useState<any>(null);
  const [tdsReport, setTdsReport] = useState<any>(null);
  const [loanAdvanceReport, setLoanAdvanceReport] = useState<any>(null);
  const [downloadDropdown, setDownloadDropdown] = useState<string | null>(null);
  const currentMonth = selectedMonth;
  const currentYear = selectedYear;




const fetchPayrollData = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `/api/payroll?month=${months[selectedMonth]}&year=${selectedYear}`
    );
    
    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      setSalaryData([]);
      return;
    }

    const text = await response.text();
    if (!text) {
      console.error('Empty response from API');
      setSalaryData([]);
      return;
    }

    const data = JSON.parse(text);
    console.log('Payroll API response:', data);
    
    if (data.success && data.data && Array.isArray(data.data)) {
      // Flatten the nested structure from API into format expected by the page
      const flattenedData = data.data.map((record: any) => {
        const emp = record.employeeId || {};
        
        return {
          _id: record._id,
          employeeCode: emp.employeeCode || '',
          employeeName: emp.employeeName || '',
          designation: emp.designation || '',
          department: emp.department || '',
          branch: emp.branch || 'Corporate Office',
          photograph: emp.photograph || null,
          baseSalary: Number(record.baseSalary || 0),
          allowances: Number(record.allowances || 0),
          grossSalary: Number(record.grossSalary || 0),
          deductions: Number(record.deductions || 0),
          netSalary: Number(record.netSalary || 0),
          totalDeductions: Number(record.deductions || 0),
          hra: Number(emp.hra || 0),
          conveyance: Number(emp.conveyance || 0),
          pf: Number(emp.pf || 0),
          esic: Number(emp.esic || 0),
          uan: emp.uan || '',
          pfNumber: emp.pfNumber || '',
          esiNumber: emp.esiNumber || '',
          accountNumber: emp.accountNumber || '',
          ifsc: emp.ifsc || '',
          bankName: emp.bankName || '',
          month: record.month,
          year: record.year,
          createdAt: record.createdAt
        };
      });
      console.log('Flattened data:', flattenedData);
      setSalaryData(flattenedData);
    } else {
      console.error('Invalid response format - no data array:', data);
      setSalaryData([]);
    }
  } catch (error) {
    console.error('Error fetching payroll:', error);
    setSalaryData([]);
  } finally {
    setLoading(false);
  }
};

const fetchPayrollHistory = async () => {
  try {
    const response = await fetch('/api/payroll/history');
    
    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      setPayrollHistory([]);
      return;
    }

    const text = await response.text();
    if (!text) {
      console.error('Empty response from API');
      setPayrollHistory([]);
      return;
    }

    const data = JSON.parse(text);
    if (data.success && data.history) {
      setPayrollHistory(data.history);
    } else {
      console.error('Invalid response format:', data);
      setPayrollHistory([]);
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    setPayrollHistory([]);
  }
};


const filteredEmployees = salaryData.filter(emp =>
  emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
);


 // Calculate statistics
const stats = {
  totalEmployees: salaryData.length,
  totalPayroll: salaryData.reduce((sum, emp) => sum + (Number(emp.netSalary) || 0), 0),
  averageSalary: salaryData.length > 0 
    ? salaryData.reduce((sum, emp) => sum + (Number(emp.netSalary) || 0), 0) / salaryData.length 
    : 0, // ✅ Prevent division by zero
  totalDeductions: salaryData.reduce((sum, emp) => sum + (Number(emp.deductions) || 0), 0)
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch all reports
  const fetchReports = async () => {
    try {
      setReportLoading(true);
      const reportEndpoints = [
        { name: 'salary-register', setter: setSalaryRegisterReport },
        { name: 'pf-esic', setter: setPFEsicReport },
        { name: 'department-analysis', setter: setDeptAnalysisReport },
        { name: 'bank-transfer', setter: setBankTransferReport },
        { name: 'tds', setter: setTdsReport },
        { name: 'loan-advance', setter: setLoanAdvanceReport },
      ];

      await Promise.all(
        reportEndpoints.map(async (endpoint) => {
          try {
            const response = await fetch(
              `/api/payroll/reports/${endpoint.name}?month=${months[selectedMonth]}&year=${selectedYear}`
            );
            if (response.ok) {
              const data = await response.json();
              endpoint.setter(data);
            }
          } catch (error) {
            console.error(`Error fetching ${endpoint.name}:`, error);
          }
        })
      );
    } finally {
      setReportLoading(false);
    }
  };

      useEffect(() => {
  fetchPayrollData();
  fetchPayrollHistory();
   // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedMonth, selectedYear]);

  return (
    
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading payroll data...</p>
            </div>
          </div>
        ) : ( <>
   
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
                onClick={() => router.push(`/Dashboard/payroll/${months[currentMonth].toLowerCase()}-${currentYear}`)}
                className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
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
                <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
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
                <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
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
                <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Average Salary</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.averageSalary)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
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
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                <div
                  key={employee.employeeCode
}
                  className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                         {employee.photograph ? ( // ✅ Fixed from employeephotograph
  <img 
    src={employee.photograph} 
    alt={employee.employeeName}
    className="w-16 h-16 rounded-xl object-cover"
  />
) : (
  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
    <User className="w-8 h-8 text-cyan-600" />
  </div>
)}
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
                          onClick={() => router.push(`/Dashboard/payrolldetails/${employee._id}`)}
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                        >
                          <Edit2Icon className="w-4 h-4" />
                         Manage
                        </button>
                        <button
                          onClick={() => setSelectedEmployee(selectedEmployee === employee.employeeCode
 ? null : employee.employeeCode
)}
                          className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-all flex items-center gap-2"
                        >
                          {selectedEmployee === employee.employeeCode
 ? (
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
                      </div>

                    {/* Quick Stats */}
                    <div className="grid md:grid-cols-5 gap-4">
                      <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 mb-1 font-semibold">GROSS SALARY</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(employee.grossSalary)}</p>
                      </div>
                      <div className="p-4 bg-linear-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 mb-1 font-semibold">DEDUCTIONS</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(employee.totalDeductions)}</p>
                      </div>
                      <div className="p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                        <p className="text-xs text-cyan-700 mb-1 font-semibold">NET SALARY</p>
                        <p className="text-2xl font-bold text-cyan-600">{formatCurrency(employee.netSalary)}</p>
                      </div>
                      <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-600 mb-1 font-semibold">BANK A/C</p>
                        <p className="text-lg font-bold text-slate-900">{employee.bankAccount}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 flex items-center justify-center">
                        {employee.salaryHold ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            ON HOLD
                          </span>
                        ) : employee.salaryProcessed ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            PROCESSED
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>                   

                    {/* Expanded Details */}
                    {selectedEmployee === employee.employeeCode
 && (
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
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings?.basic ?? 0)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">HRA (40%)</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings?.hra ?? 0)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Conveyance</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings?.conveyance ?? 0)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Monthly Bonus</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings?.monthlyBonus ?? 0)}</span>
                              </div>
                              {(employee.earnings?.quarterlyBonus ?? 0) > 0 && (
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                  <span className="text-slate-700">Quarterly Bonus</span>
                                  <span className="font-bold text-amber-600">{formatCurrency(employee.earnings?.quarterlyBonus ?? 0)}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Special Allowance</span>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.earnings?.specialAllowance ?? 0)}</span>
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
                                <span className="font-bold text-slate-900">{formatCurrency(employee.deductions?.pf ?? 0)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <span className="text-slate-700 block">ESIC</span>
                                  <span className="text-xs text-slate-500">{employee.esiNumber}</span>
                                </div>
                                <span className="font-bold text-slate-900">{formatCurrency(employee.deductions?.esic ?? 0)}</span>
                              </div>
                              {(employee.deductions?.lop ?? 0) > 0 && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                  <span className="text-slate-700">LOP (Loss of Pay)</span>
                                  <span className="font-bold text-red-600">{formatCurrency((employee.deductions?.lop ?? 0))}</span>
                                </div>
                              )}
                              {(employee.deductions?.salaryAdvance ?? 0) > 0 && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-slate-700">Salary Advance</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(employee.deductions?.salaryAdvance ?? 0)}</span>
                                </div>
                              )}
                              {(employee.deductions?.loan ?? 0) > 0 && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-slate-700">Loan Deduction</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(employee.deductions?.loan ?? 0)}</span>
                                </div>
                              )}
                              {(employee.deductions?.tds ?? 0) > 0 && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-slate-700">TDS</span>
                                  <span className="font-bold text-slate-900">{formatCurrency(employee.deductions?.tds ?? 0)}</span>
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
                        <div className="mt-6 p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
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
                        <div className="mt-6 p-6 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl text-white">
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
              ))
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Employees Found</h3>
                  <p className="text-slate-600 mb-4">
                    {salaryData.length === 0 
                      ? 'No employees available for payroll. Please add employees first.' 
                      : 'No employees match your search criteria.'}
                  </p>
                  {salaryData.length === 0 && (
                    <button
                      onClick={() => router.push('/Dashboard/recruitment')}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all"
                    >
                      Add Employees
                    </button>
                  )}
                </div>
              )}
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
                  {salaryData.map((employee) => (
                    <tr key={employee.employeeCode
} className="border-b border-slate-200 hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{employee.employeeName}</p>
                          <p className="text-xs text-slate-500">{employee.employeeCode} • {employee.designation}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings?.basic ?? 0)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings?.hra ?? 0)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings?.conveyance ?? 0)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings?.monthlyBonus ?? 0)}</td>
                      <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(employee.earnings?.specialAllowance ?? 0)}</td>
                      <td className="px-4 py-4 text-right font-bold text-green-600 bg-green-50">{formatCurrency(employee.grossSalary)}</td>
                      <td className="px-4 py-4 text-right font-bold text-red-600 bg-red-50">{formatCurrency(employee.totalDeductions)}</td>
                      <td className="px-4 py-4 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(employee.netSalary)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          onClick={()=>router.push(`/Dashboard/recruitment/${employee._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                          onClick={()=>router.push(`/Dashboard/payrolldetails/${employee._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td className="px-6 py-4 text-slate-900">TOTALS</td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.earnings?.basic ?? 0), 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + emp.earnings.hra, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + emp.earnings.conveyance, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + emp.earnings.monthlyBonus, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-900">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + emp.earnings.specialAllowance, 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-green-700 bg-green-100">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.grossSalary ?? 0), 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-red-700 bg-red-100">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.totalDeductions ?? 0), 0))}
                    </td>
                    <td className="px-4 py-4 text-right text-cyan-700 bg-cyan-100 text-lg">
                      {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.netSalary ?? 0), 0))}
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
                  <button 
                    onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div>
                    <p className="text-sm text-slate-600">Processing Payroll For</p>
                    <p className="text-xl font-bold text-slate-900">{months[selectedMonth]} {selectedYear}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
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
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-green-800 mb-4">Total Gross Salary</h4>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.grossSalary ?? 0), 0))}
                </p>
                <p className="text-sm text-green-700">{salaryData.length} employees</p>
              </div>

              <div className="bg-linear-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-red-800 mb-4">Total Deductions</h4>
                <p className="text-4xl font-bold text-red-600 mb-2">
                  {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.totalDeductions ?? 0), 0))}
                </p>
                <p className="text-sm text-red-700">PF, ESIC, Loans, Advances, LOP</p>
              </div>

              <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-cyan-800 mb-4">Total Net Payable</h4>
                <p className="text-4xl font-bold text-cyan-600 mb-2">
                  {formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.netSalary ?? 0), 0))}
                </p>
                <p className="text-sm text-cyan-700">Ready for disbursement</p>
              </div>
            </div>

            {/* Process Steps with Validation */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payroll Processing Steps</h3>
              <div className="space-y-4">
                {/* Step 1: Attendance Verification */}
                <div className="flex items-start gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">✓ Attendance Verified</h4>
                    <p className="text-sm text-slate-600">Employee attendance records verified and LOP calculated</p>
                    <p className="text-xs text-green-700 mt-2">
                      {salaryData.filter(e => e.deductions?.lop > 0).length} employees with LOP deductions
                    </p>
                  </div>
                </div>

                {/* Step 2: Salary Components Calculated */}
                <div className="flex items-start gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">✓ Salary Components Calculated</h4>
                    <p className="text-sm text-slate-600">All earnings and deductions computed for {months[selectedMonth]} {selectedYear}</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="text-sm">
                        <p className="text-xs text-slate-500">Gross:</p>
                        <p className="font-semibold text-green-700">{formatCurrency(salaryData.reduce((sum, emp) => sum + emp.grossSalary, 0))}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-slate-500">LOP Deduction:</p>
                        <p className="font-semibold text-red-700">{formatCurrency(salaryData.reduce((sum, emp) => sum + (emp.deductions?.lop || 0), 0))}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-slate-500">Other Deductions:</p>
                        <p className="font-semibold text-red-700">{formatCurrency(salaryData.reduce((sum, emp) => sum + ((emp.totalDeductions || 0) - (emp.deductions?.lop || 0)), 0))}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Awaiting Approval */}
                <div className="flex items-start gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Awaiting Approval</h4>
                    <p className="text-sm text-slate-600">Payroll is ready for management approval. Review the breakdowns above before submitting.</p>
                  </div>
                </div>

                {/* Step 4: Generate Payslips (pending) */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg opacity-60">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Generate Payslips (After Approval)</h4>
                    <p className="text-sm text-slate-600">Create and distribute payslips to all employees after approval</p>
                  </div>
                </div>

                {/* Step 5: Bank Transfer (pending) */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg opacity-60">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Process Bank Transfer (After Approval)</h4>
                    <p className="text-sm text-slate-600">Initiate salary disbursement to employee bank accounts</p>
                  </div>
                </div>
              </div>

              {/* Detailed Payroll Breakdown */}
              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">Payroll Summary by Employee</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left px-4 py-2 font-semibold text-slate-700">Employee</th>
                        <th className="text-right px-4 py-2 font-semibold text-slate-700">Gross</th>
                        <th className="text-right px-4 py-2 font-semibold text-slate-700">LOP</th>
                        <th className="text-right px-4 py-2 font-semibold text-slate-700">PF/ESIC</th>
                        <th className="text-right px-4 py-2 font-semibold text-slate-700">TDS</th>
                        <th className="text-right px-4 py-2 font-semibold text-slate-700">Total Ded.</th>
                        <th className="text-right px-4 py-2 font-semibold text-slate-700 bg-cyan-100">Net Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryData.slice(0, 5).map((emp, idx) => (
                        <tr key={emp.employeeCode} className="border-b border-slate-200 hover:bg-white">
                          <td className="px-4 py-2 font-medium text-slate-900">
                            <div>
                              <p>{emp.employeeName}</p>
                              <p className="text-xs text-slate-500">{emp.employeeCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right text-slate-900">{formatCurrency(emp.grossSalary)}</td>
                          <td className="px-4 py-2 text-right text-red-600">{formatCurrency(emp.deductions?.lop || 0)}</td>
                          <td className="px-4 py-2 text-right text-red-600">{formatCurrency((emp.deductions?.pf || 0) + (emp.deductions?.esic || 0))}</td>
                          <td className="px-4 py-2 text-right text-red-600">{formatCurrency(emp.deductions?.tds || 0)}</td>
                          <td className="px-4 py-2 text-right font-semibold text-red-700">{formatCurrency(emp.totalDeductions)}</td>
                          <td className="px-4 py-2 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(emp.netSalary)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-200 font-bold">
                        <td className="px-4 py-2 text-slate-900">TOTALS</td>
                        <td className="px-4 py-2 text-right text-slate-900">{formatCurrency(salaryData.reduce((sum, e) => sum + e.grossSalary, 0))}</td>
                        <td className="px-4 py-2 text-right text-red-700">{formatCurrency(salaryData.reduce((sum, e) => sum + (e.deductions?.lop || 0), 0))}</td>
                        <td className="px-4 py-2 text-right text-red-700">{formatCurrency(salaryData.reduce((sum, e) => sum + ((e.deductions?.pf || 0) + (e.deductions?.esic || 0)), 0))}</td>
                        <td className="px-4 py-2 text-right text-red-700">{formatCurrency(salaryData.reduce((sum, e) => sum + (e.deductions?.tds || 0), 0))}</td>
                        <td className="px-4 py-2 text-right text-red-700">{formatCurrency(salaryData.reduce((sum, e) => sum + e.totalDeductions, 0))}</td>
                        <td className="px-4 py-2 text-right text-cyan-700 bg-cyan-100">{formatCurrency(salaryData.reduce((sum, e) => sum + e.netSalary, 0))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium">
                  Save as Draft
                </button>
                <button 
                  onClick={() => {
                    // Validation check
                    if (salaryData.length === 0) {
                      alert('No salary data to process');
                      return;
                    }
                    
                    // Check if LOP is calculated
                    const hasLOP = salaryData.some(e => (e.deductions?.lop || 0) > 0);
                    const allProcessed = salaryData.every(e => e.salaryProcessed !== false);
                    
                    if (allProcessed && hasLOP) {
                      alert('✓ Payroll approved successfully!\n\n' + 
                        'Total Employees: ' + salaryData.length + '\n' +
                        'Gross Salary: ' + formatCurrency(salaryData.reduce((sum, e) => sum + e.grossSalary, 0)) + '\n' +
                        'LOP Deduction: ' + formatCurrency(salaryData.reduce((sum, e) => sum + (e.deductions?.lop || 0), 0)) + '\n' +
                        'Net Salary: ' + formatCurrency(salaryData.reduce((sum, e) => sum + e.netSalary, 0)));
                    } else {
                      alert('⚠ Cannot approve payroll:\n- All salary components must be calculated\n- Attendance verification required');
                    }
                  }}
                  className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Submit for Approval
                </button>
              </div>
            </div>

            {/* Payroll History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payroll History</h3>
              <div className="space-y-3">
                {payrollHistory.map((record) => (
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
                         {(record.status || 'DRAFT').toUpperCase()}
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
            {/* Payslips Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Payslips Management</h3>
                  <p className="text-slate-600 mt-1">Download, view, and email payslips to employees</p>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {months.map((month, idx) => (
                      <option key={month} value={idx}>{month}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {[2025, 2026].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <button 
                    onClick={fetchReports}
                    disabled={reportLoading}
                    className="px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <BarChart3 className="w-5 h-5" />
                    {reportLoading ? 'Loading Reports...' : 'View Reports'}
                  </button>
                </div>
              </div>

              {/* Payslips Grid */}
              <div className="space-y-4">
                {salaryData.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No payslip data available for the selected month</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {salaryData.map((employee) => (
                      <div 
                        key={employee.employeeCode}
                        className="bg-linear-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all p-5"
                      >
                        {/* Employee Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-lg">{employee.employeeName}</p>
                            <p className="text-sm text-slate-500">{employee.employeeCode}</p>
                            <p className="text-xs text-slate-400 mt-1">{employee.designation}</p>
                          </div>
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Receipt className="w-6 h-6 text-cyan-600" />
                          </div>
                        </div>

                        {/* Salary Info */}
                        <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Gross Salary</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(employee.grossSalary)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Deductions</span>
                            <span className="font-semibold text-red-600">{formatCurrency(employee.totalDeductions)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-sm font-semibold text-slate-700">Net Salary</span>
                            <span className="font-bold text-cyan-600 text-lg">{formatCurrency(employee.netSalary)}</span>
                          </div>
                        </div>

                        {/* Action Buttons - View, Download & Email */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => router.push(`/Dashboard/employees/${employee.employeeId}`)}
                            className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm flex items-center justify-center gap-1"
                            title="View employee details"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setDownloadDropdown(downloadDropdown === employee.employeeCode ? null : employee.employeeCode)}
                              className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-medium text-sm flex items-center justify-center gap-1"
                              title="Download payslip"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            {downloadDropdown === employee.employeeCode && (
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                                <button
                                  onClick={() => {
                                    downloadPayslip(
                                      convertToEmployeeSalaryData(employee),
                                      months[selectedMonth],
                                      String(selectedYear)
                                    );
                                    setDownloadDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-cyan-50 flex items-center gap-2 text-cyan-600 font-medium border-b border-slate-100 first:rounded-t-lg"
                                >
                                  <FileText className="w-4 h-4" />
                                  PDF
                                </button>
                                <button
                                  onClick={() => {
                                    exportPayslipToExcel(
                                      convertToEmployeeSalaryData(employee),
                                      months[selectedMonth],
                                      String(selectedYear)
                                    );
                                    setDownloadDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-2 text-green-600 font-medium last:rounded-b-lg"
                                >
                                  <FileJson className="w-4 h-4" />
                                  Excel
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const empData = convertToEmployeeSalaryData(employee);
                              fetch('/api/payroll/send-payslip', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  employee: empData,
                                  month: months[selectedMonth],
                                  year: selectedYear,
                                  employeeEmail: `${employee.employeeCode}@company.com`
                                })
                              }).then(res => res.json()).then(data => {
                                if (data.success) {
                                  alert(`Payslip sent to ${employee.employeeName}`);
                                } else {
                                  alert('Failed to send payslip');
                                }
                              });
                            }}
                            className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium text-sm flex items-center justify-center gap-1"
                            title="Send via email"
                          >
                            <Send className="w-4 h-4" />
                            Email
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 mb-1">Total Payslips</p>
                <p className="text-3xl font-bold text-slate-900">{salaryData.length}</p>
                <p className="text-xs text-slate-500 mt-2">for {months[selectedMonth]} {selectedYear}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 mb-1">Total Gross</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(salaryData.reduce((sum, e) => sum + e.grossSalary, 0))}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(salaryData.reduce((sum, e) => sum + e.totalDeductions, 0))}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 mb-1">Total Net Salary</p>
                <p className="text-3xl font-bold text-cyan-600">{formatCurrency(salaryData.reduce((sum, e) => sum + e.netSalary, 0))}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {selectedView === 'reports' && (
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Payroll Reports</h3>
                  <p className="text-slate-600 mt-1">Comprehensive payroll analytics and compliance reports</p>
                </div>
                <button 
                  onClick={fetchReports}
                  disabled={reportLoading}
                  className="px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <BarChart3 className="w-5 h-5" />
                  {reportLoading ? 'Refreshing...' : 'Refresh Reports'}
                </button>
              </div>
            </div>

            {/* Salary Register Report */}
            {salaryRegisterReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <FileText className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Monthly Salary Register</h4>
                    <p className="text-sm text-slate-600">{salaryRegisterReport.month} {salaryRegisterReport.year}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-slate-700 font-semibold">Employee</th>
                        <th className="px-4 py-2 text-right text-slate-700 font-semibold">Gross</th>
                        <th className="px-4 py-2 text-right text-slate-700 font-semibold">PF</th>
                        <th className="px-4 py-2 text-right text-slate-700 font-semibold">ESIC</th>
                        <th className="px-4 py-2 text-right text-slate-700 font-semibold">Deductions</th>
                        <th className="px-4 py-2 text-right text-slate-700 font-semibold">Net Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryRegisterReport.data?.slice(0, 5).map((emp: any, idx: number) => (
                        <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-900">{emp.employeeName}</td>
                          <td className="px-4 py-2 text-right text-slate-900">{formatCurrency(emp.grossSalary)}</td>
                          <td className="px-4 py-2 text-right text-slate-900">{formatCurrency(emp.pf)}</td>
                          <td className="px-4 py-2 text-right text-slate-900">{formatCurrency(emp.esic)}</td>
                          <td className="px-4 py-2 text-right text-red-600">{formatCurrency(emp.totalDeductions)}</td>
                          <td className="px-4 py-2 text-right font-semibold text-cyan-600">{formatCurrency(emp.netSalary)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {salaryRegisterReport.data && salaryRegisterReport.data.length > 5 && (
                  <p className="text-sm text-slate-600 mt-4">Showing 5 of {salaryRegisterReport.data.length} employees</p>
                )}
              </div>
            )}

            {/* PF & ESIC Report */}
            {pfEsicReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">PF & ESIC Compliance Report</h4>
                    <p className="text-sm text-slate-600">{pfEsicReport.month} {pfEsicReport.year}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total PF Contribution</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(pfEsicReport.summary?.totalPF || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total ESIC Contribution</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(pfEsicReport.summary?.totalESIC || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Employees Covered</p>
                    <p className="text-2xl font-bold text-slate-900">{pfEsicReport.summary?.count || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Department Analysis Report */}
            {deptAnalysisReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Department-wise Analysis</h4>
                    <p className="text-sm text-slate-600">{deptAnalysisReport.month} {deptAnalysisReport.year}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {deptAnalysisReport.data?.slice(0, 4).map((dept: any, idx: number) => (
                    <div key={idx} className="bg-linear-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                      <h5 className="font-semibold text-slate-900 mb-3">{dept.department}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Employees</span>
                          <span className="font-semibold">{dept.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Gross Salary</span>
                          <span className="font-semibold">{formatCurrency(dept.totalGross)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Net Payroll</span>
                          <span className="font-semibold text-cyan-600">{formatCurrency(dept.totalNet)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bank Transfer Report */}
            {bankTransferReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Bank Transfer Sheet</h4>
                    <p className="text-sm text-slate-600">Records ready for bank disbursement</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Records</p>
                    <p className="text-2xl font-bold text-slate-900">{bankTransferReport.summary?.totalRecords || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-cyan-600">{formatCurrency(bankTransferReport.summary?.totalAmount || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TDS Report */}
            {tdsReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Percent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">TDS Report</h4>
                    <p className="text-sm text-slate-600">Tax deducted at source summary</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Taxable Income</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(tdsReport.summary?.totalTaxableIncome || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total TDS Deducted</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(tdsReport.summary?.totalTax || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Employees with TDS</p>
                    <p className="text-2xl font-bold text-slate-900">{tdsReport.data?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loan & Advance Report */}
            {loanAdvanceReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Loan & Advance Report</h4>
                    <p className="text-sm text-slate-600">Outstanding loans and salary advances</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Advances</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(loanAdvanceReport.summary?.totalAdvances || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Loans</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(loanAdvanceReport.summary?.totalLoans || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(loanAdvanceReport.summary?.totalOutstanding || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Employees with Liability</p>
                    <p className="text-2xl font-bold text-slate-900">{loanAdvanceReport.summary?.employeesWithAdvance || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {!reportLoading && !salaryRegisterReport && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Click "Refresh Reports" to load payroll reports</p>
                <button 
                  onClick={fetchReports}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all"
                >
                  Load Reports
                </button>
              </div>
            )}
          </div>
        )}

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
                  <div className="bg-linear-to-r from-cyan-500 to-blue-600 h-3 rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">HRA</span>
                  <span className="font-bold text-slate-900">23%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-linear-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">Allowances & Bonus</span>
                  <span className="font-bold text-slate-900">19%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-linear-to-r from-purple-500 to-pink-600 h-3 rounded-full" style={{ width: '19%' }}></div>
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
                        className="bg-linear-to-r from-cyan-500 to-blue-600 h-3 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}