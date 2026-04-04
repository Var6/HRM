'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Users, Download, ChevronLeft, ChevronRight, ChevronDown,
  Eye, Edit, CheckCircle, XCircle, Clock, Send,
  ArrowUpCircle, ArrowDownCircle, User, Receipt,
  CreditCard, Building2, AlertTriangle, DollarSign,
  Search, Filter, Trash2, Lock, Unlock, Save,
  FileText, Mail, X, Ban, FileJson
} from 'lucide-react';
import { SalaryStructure, PayrollStatus } from '@/types/types';
import type { EmployeeSalaryData } from '@/lib/payslip-utils';
import { downloadPayslip, downloadBulkPayslips } from '@/lib/payslip-utils';
import { exportPayslipToExcel } from '@/lib/payroll-export-helpers';
import { getDaysInMonth } from '@/lib/attendance-utils';
import ApprovalModal from '@/components/payslip/ApprovalModal';
import Link from 'next/link';

const convertToEmployeeSalaryData = (emp: SalaryStructure): EmployeeSalaryData => {
  return {
    employeeId: String(emp.employeeCode || emp.employeeId),
    employeeName: emp.employeeName || 'N/A',
    department: emp.department || 'N/A',
    designation: emp.designation || 'N/A',
    photograph: emp.photograph || '',
    fatherName: emp.fatherName || "N/A",
    salaryHold: emp.salaryHold || false,
    dateOfJoining: emp.dateOfJoining || "2020-01-01",
    panNumber: emp.panNumber || "N/A",
    uanNumber: emp.uanNumber || "N/A",
    salaryProcessed: emp.salaryProcessed || false,
    esiNumber: emp.esiNumber || "N/A",
    aadharNumber: emp.aadharNumber || "N/A",
    presentDays: emp.presentDays || 30,
    totalDaysInMonth: 31,
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

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [salaryData, setSalaryData] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<PayrollStatus>('draft');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [holdEmployeeCode, setHoldEmployeeCode] = useState<string | null>(null);
  const [processingBulk, setProcessingBulk] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [employeesForApproval, setEmployeesForApproval] = useState<any[]>([]);
  const [payslipDropdown, setPayslipDropdown] = useState<string | null>(null);

  const [monthName, year] = slug ? slug.split('-') : ['january', '2026'];
  const monthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  const currentMonth = monthIndex !== -1 ? monthIndex : 0;
  const currentYear = parseInt(year) || new Date().getFullYear();

  useEffect(() => {
    fetchPayrollData();
  }, [slug]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/payroll?month=${months[currentMonth]}&year=${currentYear}`
      );
      const data = await response.json();
      console.log('Payroll [slug] API response:', data);
      if (data.success && Array.isArray(data.data)) {
        const flattenedData = data.data.map((record: any) => {
          const emp = record.employeeId || {};
          const baseSalary = record.baseSalary || 0;
          const allowances = record.allowances || 0;
          const grossSalary = record.grossSalary ?? (baseSalary + allowances);
          const earnings = record.earnings || {};
          const deductionsBreakdown = record.deductionsBreakdown || {};

          return {
            _id: record._id,
            employeeId: emp._id || record._id,
            employeeCode: emp.employeeCode || '',
            employeeName: emp.employeeName || '',
            designation: emp.designation || '',
            department: emp.department || '',
            branch: emp.branch || 'Corporate Office',
            photograph: emp.photograph || null,
            dateOfJoining: emp.dateOfJoining || '',
            fatherName: emp.fatherName || 'N/A',
            panNumber: emp.panNumber || 'N/A',
            uanNumber: emp.uan || '',
            esiNumber: emp.esiNumber || '',
            aadharNumber: emp.aadharNumber || 'N/A',
            presentDays: record.presentDays ?? 0,
            totalDaysInMonth: record.totalDaysInMonth ?? getDaysInMonth(currentMonth, currentYear),
            workingDays: record.workingDays ?? 0,
            absentDays: record.absentDays ?? ((record.workingDays ?? 0) - (record.presentDays ?? 0)),
            bankAccount: record.bankAccount || emp.accountNumber || '',
            accountNumber: emp.accountNumber || '',
            baseSalary: baseSalary,
            allowances: allowances,
            grossSalary: grossSalary,
            netSalary: record.netSalary || 0,
            totalDeductions: record.totalDeductions || record.deductions || 0,
            earnings: {
              basic: earnings.basic ?? baseSalary,
              hra: earnings.hra ?? emp.hra ?? 0,
              conveyance: earnings.conveyance ?? emp.conveyance ?? 0,
              monthlyBonus: earnings.monthlyBonus ?? 0,
              quarterlyBonus: earnings.quarterlyBonus ?? 0,
              specialAllowance: earnings.specialAllowance ?? 0
            },
            deductions: {
              pf: deductionsBreakdown.pf ?? emp.pf ?? 0,
              esic: deductionsBreakdown.esic ?? emp.esic ?? 0,
              advance: deductionsBreakdown.advance ?? 0,
              loan: deductionsBreakdown.loan ?? 0,
              tds: deductionsBreakdown.tds ?? 0,
              lop: deductionsBreakdown.lop ?? 0,
              salaryAdvance: deductionsBreakdown.advance ?? 0
            },
            salaryProcessed: record.salaryProcessed ?? false,
            salaryHold: record.salaryHold ?? false,
            salaryHoldReason: record.salaryHoldReason ?? '',
            month: record.month,
            year: record.year,
            createdAt: record.createdAt
          };
        });
        setSalaryData(flattenedData);
        setPayrollStatus(data.status || 'draft');
      } else {
        console.error('Invalid response format:', data);
        setSalaryData([]);
      }
    } catch (error) {
      console.error('Error fetching payroll:', error);
      setSalaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (employeeCode: string, newStatus: boolean) => {
    try {
      const response = await fetch('/api/payroll/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode,
          month: months[currentMonth],
          year: currentYear,
          salaryProcessed: newStatus
        })
      });

      if (response.ok) {
        setSalaryData(prev =>
          prev.map(emp =>
            emp.employeeCode === employeeCode
              ? { ...emp, salaryProcessed: newStatus }
              : emp
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSalaryHold = async (employeeCode: string, hold: boolean, reason?: string) => {
    try {
      const response = await fetch('/api/payroll/hold-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode,
          month: months[currentMonth],
          year: currentYear,
          salaryHold: hold,
          salaryHoldReason: reason
        })
      });

      if (response.ok) {
        setSalaryData(prev =>
          prev.map(emp =>
            emp.employeeCode === employeeCode
              ? { ...emp, salaryHold: hold, salaryHoldReason: reason }
              : emp
          )
        );
        setShowHoldModal(false);
        setHoldReason('');
        setHoldEmployeeCode(null);
      }
    } catch (error) {
      console.error('Error holding salary:', error);
    }
  };

  const handleBulkProcess = async () => {
    if (selectedEmployees.size === 0) return;
    
    // Get employees for approval modal
    const employeesToApprove = filteredEmployees.filter(emp =>
      selectedEmployees.has(emp.employeeCode)
    );

    const approvalEmployees = employeesToApprove.map(emp => {
      const totalDays = getDaysInMonth(currentMonth, currentYear);
      const workingDays = emp.workingDays || 0;
      const presentDays = emp.presentDays || 0;
      const absentDays = emp.absentDays != null
        ? Number(emp.absentDays)
        : (workingDays - presentDays);
      
      console.log(`[HandleBulkProcess] ${emp.employeeCode}:`);
      console.log(`  URL Month/Year: ${currentMonth}/${currentYear}`);
      console.log(`  Calculated Total Days: ${totalDays}`);
      console.log(`  Record Total Days In Month: ${emp.totalDaysInMonth}`);
      console.log(`  Using Total Days: ${emp.totalDaysInMonth ?? totalDays}`);
      console.log(`  Working Days: ${workingDays}, Present: ${presentDays}, Absent: ${absentDays}`);
      
      return {
        employeeCode: emp.employeeCode,
        employeeName: emp.employeeName,
        designation: emp.designation,
        department: emp.department,
        grossSalary: emp.grossSalary,
        presentDays: presentDays,
        totalDaysInMonth: emp.totalDaysInMonth ?? totalDays,
        workingDays: workingDays,
        absentDays: absentDays,
        currentDeductions: {
          pf: emp.deductions?.pf || 0,
          esic: emp.deductions?.esic || 0,
          advance: emp.deductions?.advance || emp.deductions?.salaryAdvance || 0,
          loan: emp.deductions?.loan || 0,
          tds: emp.deductions?.tds || 0,
          lop: emp.deductions?.lop || emp.lopAmount || 0,
        },
      };
    });

    setEmployeesForApproval(approvalEmployees);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (approvalData: any[]) => {
    try {
      setProcessingBulk(true);
      
      const response = await fetch('/api/payroll/approve-with-lop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvals: approvalData,
          month: months[currentMonth],
          year: currentYear,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update salary data with approved employees
        setSalaryData(prev =>
          prev.map(emp => {
            const approved = approvalData.find(a => a.employeeCode === emp.employeeCode);
            if (approved) {
              return {
                ...emp,
                salaryProcessed: true,
                salaryHold: false,
                approvalDate: result.approvalDate,
                approvalTime: result.approvalTime,
                deductions: {
                  ...emp.deductions,
                  pf: approved.adjustedPF,
                  esic: approved.adjustedESIC,
                  advance: approved.adjustedAdvance,
                  loan: approved.adjustedLoan,
                  tds: approved.adjustedTDS,
                  lop: approved.adjustedLOP,
                },
                netSalary: approved.adjustedLOP ? 
                  emp.grossSalary - (approved.adjustedPF + approved.adjustedESIC + approved.adjustedAdvance + approved.adjustedLoan + approved.adjustedTDS + approved.adjustedLOP) :
                  emp.netSalary,
              };
            }
            return emp;
          })
        );

        setSelectedEmployees(new Set());
        setShowApprovalModal(false);
        setEmployeesForApproval([]);
      } else {
        console.error('Approval failed:', result.message);
      }
    } catch (error) {
      console.error('Error submitting approvals:', error);
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleSingleApproval = (employeeCode: string) => {
    const employee = filteredEmployees.find(emp => emp.employeeCode === employeeCode);
    if (!employee) return;

    const approvalEmployee = {
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      designation: employee.designation,
      department: employee.department,
      grossSalary: employee.grossSalary,
      presentDays: employee.presentDays || 0,
      totalDaysInMonth: employee.totalDaysInMonth || getDaysInMonth(currentMonth, currentYear),
      workingDays: employee.workingDays || 0,
      absentDays: employee.absentDays || 0,
      currentDeductions: {
        pf: employee.deductions?.pf || 0,
        esic: employee.deductions?.esic || 0,
        advance: employee.deductions?.advance || employee.deductions?.salaryAdvance || 0,
        loan: employee.deductions?.loan || 0,
        tds: employee.deductions?.tds || 0,
        lop: employee.deductions?.lop || employee.lopAmount || 0,
      },
    };

    setEmployeesForApproval([approvalEmployee]);
    setShowApprovalModal(true);
  };;

  const handleBulkDownload = () => {
    const employees = filteredEmployees
      .filter(emp => selectedEmployees.has(emp.employeeCode))
      .map(convertToEmployeeSalaryData);
    downloadBulkPayslips(employees, months[currentMonth], String(currentYear));
    setSelectedEmployees(new Set());
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.employeeCode)));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    } else {
      newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    }

    router.push(`/Dashboard/payroll/${months[newMonth].toLowerCase()}-${newYear}`);
  };

  const handleViewDetails = (employeeId: string) => {
    // Navigate to employee detail page with month and year context
    router.push(`/Dashboard/payrolldetails/${employeeId}`);
    console.log('Viewing details for employee ID:', employeeId);
  };

  const filteredEmployees = (salaryData || []).filter(emp => {
    const matchesSearch = 
      emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'processed' && emp.salaryProcessed) ||
      (filterStatus === 'pending' && !emp.salaryProcessed && !emp.salaryHold) ||
      (filterStatus === 'hold' && emp.salaryHold);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    totalEmployees: (salaryData || []).length,
    totalPayroll: (salaryData || []).reduce((sum, emp) => sum + (emp.netSalary || 0), 0),
    totalProcessed: (salaryData || []).filter(emp => emp.salaryProcessed).length,
    totalOnHold: (salaryData || []).filter(emp => emp.salaryHold).length,
    totalDeductions: (salaryData || []).reduce((sum, emp) => sum + (emp.totalDeductions || 0), 0),
    averageSalary: (salaryData || []).length > 0 
      ? (salaryData || []).reduce((sum, emp) => sum + (emp.netSalary || 0), 0) / (salaryData || []).length 
      : 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const departments = Array.from(
    new Set((salaryData || []).map(emp => emp.department).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/Dashboard/payroll')}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Payroll - {months[currentMonth]} {currentYear}
                </h1>
                <p className="text-slate-600">
                  Manage and process salary for {stats.totalEmployees} employees
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  {months[currentMonth]} {currentYear}
                </p>
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
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
                  Total
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Processed
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Salaries Processed</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalProcessed}/{stats.totalEmployees}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-red-50 to-rose-50 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  On Hold
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Salaries On Hold</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalOnHold}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalPayroll)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept, idx) => (
                  <option key={`${dept}-${idx}`} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="processed">Processed</option>
                <option value="pending">Pending</option>
                <option value="hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {selectedEmployees.size === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                </button>
                <p className="text-sm text-slate-600">
                  {selectedEmployees.size > 0 ? (
                    <>
                      <span className="font-semibold">{selectedEmployees.size}</span> selected
                    </>
                  ) : (
                    <>Showing {filteredEmployees.length} of {stats.totalEmployees} employees</>
                  )}
                </p>
              </div>
              
              {selectedEmployees.size > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBulkProcess}
                    disabled={processingBulk}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Process Selected ({selectedEmployees.size})
                  </button>
                  <button
                    onClick={handleBulkDownload}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.employeeCode}
              className={`bg-white rounded-xl border-2 transition-all ${
                selectedEmployees.has(employee.employeeCode)
                  ? 'border-cyan-500 shadow-lg'
                  : 'border-slate-200 hover:border-cyan-300 hover:shadow-lg'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee.employeeCode)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedEmployees);
                          if (e.target.checked) {
                            newSelected.add(employee.employeeCode);
                          } else {
                            newSelected.delete(employee.employeeCode);
                          }
                          setSelectedEmployees(newSelected);
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Photo */}
                    {employee.photograph ? (
                      <img 
                        src={employee.photograph} 
                        alt={employee.employeeName}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                        <User className="w-8 h-8 text-cyan-600" />
                      </div>
                    )}
                    
                    {/* Info */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {employee.employeeName}
                      </h3>
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/Dashboard/recruitment/${employee.employeeId}`)}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                      title="Edit Employee"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                   
                      onClick={() => handleViewDetails(String(employee.employeeId))}
                      className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all flex items-center gap-2"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {employee.salaryProcessed && (
                      <div className="relative">
                        <button
                          onClick={() => setPayslipDropdown(payslipDropdown === employee.employeeCode ? null : employee.employeeCode)}
                          className="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                          title="Download Payslip"
                        >
                          <Receipt className="w-4 h-4" />
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {payslipDropdown === employee.employeeCode && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                            <button
                              onClick={() => {
                                downloadPayslip(
                                  convertToEmployeeSalaryData(employee),
                                  months[currentMonth],
                                  String(currentYear)
                                );
                                setPayslipDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-cyan-50 flex items-center gap-2 text-cyan-600 font-medium border-b border-slate-100 first:rounded-t-lg"
                            >
                              <FileText className="w-4 h-4" />
                              Download as PDF
                            </button>
                            <button
                              onClick={() => {
                                exportPayslipToExcel(
                                  convertToEmployeeSalaryData(employee),
                                  months[currentMonth],
                                  String(currentYear)
                                );
                                setPayslipDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-2 text-green-600 font-medium last:rounded-b-lg"
                            >
                              <FileJson className="w-4 h-4" />
                              Download as Excel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 mb-1 font-semibold">GROSS SALARY</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(employee.grossSalary)}
                    </p>
                  </div>
                  <div className="p-4 bg-linear-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-700 mb-1 font-semibold">DEDUCTIONS</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(employee.totalDeductions)}
                    </p>
                  </div>
                  <div className="p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                    <p className="text-xs text-cyan-700 mb-1 font-semibold">NET SALARY</p>
                    <p className="text-2xl font-bold text-cyan-600">
                      {formatCurrency(employee.netSalary)}
                    </p>
                  </div>
                  <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1 font-semibold">BANK A/C</p>
                    <p className="text-lg font-bold text-slate-900">{employee.bankAccount}</p>
                  </div>

                  {/* Status Control */}
                  <div className="p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    {employee.salaryHold ? (
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full block text-center">
                          ON HOLD
                        </span>
                        <button
                          onClick={() => handleSalaryHold(employee.employeeCode, false)}
                          className="w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center justify-center gap-1"
                        >
                          <Unlock className="w-3 h-3" />
                          Release
                        </button>
                      </div>
                    ) : employee.salaryProcessed ? (
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full block text-center">
                          PROCESSED
                        </span>
                        <button
                          onClick={() => handleStatusChange(employee.employeeCode, false)}
                          className="w-full px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 flex items-center justify-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          Revert
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full block text-center">
                          PENDING
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSingleApproval(employee.employeeCode)}
                            className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center justify-center gap-1"
                            title="Mark as Processed"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setHoldEmployeeCode(employee.employeeCode);
                              setShowHoldModal(true);
                            }}
                            className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center justify-center gap-1"
                            title="Put on Hold"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No employees found</h3>
              <p className="text-slate-600">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>

        {/* Hold Modal */}
        {showHoldModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Hold Salary</h2>
                  <button
                    onClick={() => {
                      setShowHoldModal(false);
                      setHoldReason('');
                      setHoldEmployeeCode(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for holding salary
                </label>
                <textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={4}
                  placeholder="Enter reason for holding the salary..."
                  required
                ></textarea>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowHoldModal(false);
                      setHoldReason('');
                      setHoldEmployeeCode(null);
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (holdEmployeeCode && holdReason.trim()) {
                        handleSalaryHold(holdEmployeeCode, true, holdReason);
                      }
                    }}
                    disabled={!holdReason.trim()}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-5 h-5" />
                    Hold Salary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        <ApprovalModal
          employees={employeesForApproval}
          month={months[currentMonth]}
          year={currentYear}
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setEmployeesForApproval([]);
          }}
          onApprove={handleApprovalSubmit}
        />
      </div>
    </div>
  );
}