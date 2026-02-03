'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, User, DollarSign, Calendar, Building2,
  CreditCard, Download, Receipt, Save, Edit
} from 'lucide-react';
import { SalaryStructure } from '@/types/types';
import type { EmployeeSalaryData } from '@/lib/payslip-utils';
import { downloadPayslip } from '@/lib/payslip-utils';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EmployeePayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const employeeId = params?.employee as string;

  const [salaryData, setSalaryData] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monthName, year] = slug ? slug.split('-') : ['january', '2026'];
  const monthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  const currentMonth = monthIndex !== -1 ? monthIndex : 0;
  const currentYear = parseInt(year) || new Date().getFullYear();

  useEffect(() => {
    fetchEmployeePayroll();
  }, [employeeId, slug]);

  const fetchEmployeePayroll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/payroll/employee?employeeId=${employeeId}&month=${months[currentMonth]}&year=${currentYear}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee payroll data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSalaryData(data.data);
      } else {
        setError(data.message || 'Failed to load payroll data');
      }
    } catch (error) {
      console.error('Error fetching employee payroll:', error);
      setError('Failed to load employee payroll data');
    } finally {
      setLoading(false);
    }
  };

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
      advance: emp.deductions?.salaryAdvance || 0,
      loan: emp.deductions?.loan || 0,
      lop: emp.deductions?.lop || 0,
      tds: emp.deductions?.tds || 0,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee payroll...</p>
        </div>
      </div>
    );
  }

  if (error || !salaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 mb-4">{error || 'Employee payroll data not found'}</p>
          <button
            onClick={() => router.push(`/Dashboard/payroll/${slug}`)}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all"
          >
            Back to Payroll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/Dashboard/payroll/${slug}`)}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Payroll Details
                </h1>
                <p className="text-slate-600">
                  {months[currentMonth]} {currentYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/Dashboard/recruitment/${salaryData.employeeId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Employee
              </button>
              {salaryData.salaryProcessed && (
                <button
                  onClick={() => downloadPayslip(convertToEmployeeSalaryData(salaryData), months[currentMonth], String(currentYear))}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Payslip
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            {salaryData.photograph ? (
              <img 
                src={salaryData.photograph} 
                alt={salaryData.employeeName}
                className="w-32 h-32 rounded-xl object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                <User className="w-16 h-16 text-cyan-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {salaryData.employeeName}
              </h2>
              <p className="text-xl text-slate-600 mb-4">{salaryData.designation}</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-5 h-5" />
                  <span>{salaryData.department}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-5 h-5" />
                  <span>{salaryData.employeeCode}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CreditCard className="w-5 h-5" />
                  <span>{salaryData.bankAccount || 'N/A'}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                {salaryData.salaryHold ? (
                  <span className="px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                    ON HOLD {salaryData.salaryHoldReason ? `- ${salaryData.salaryHoldReason}` : ''}
                  </span>
                ) : salaryData.salaryProcessed ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    PROCESSED
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Gross Salary</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(salaryData.grossSalary)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-red-50 to-rose-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(salaryData.totalDeductions)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Net Salary</p>
            <p className="text-3xl font-bold text-cyan-600">{formatCurrency(salaryData.netSalary)}</p>
          </div>
        </div>

        {/* Earnings Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Basic Salary</span>
              <span className="text-slate-900 font-bold">{formatCurrency(salaryData.earnings?.basic || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">House Rent Allowance (HRA)</span>
              <span className="text-slate-900 font-bold">{formatCurrency(salaryData.earnings?.hra || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Conveyance</span>
              <span className="text-slate-900 font-bold">{formatCurrency(salaryData.earnings?.conveyance || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Special Allowance</span>
              <span className="text-slate-900 font-bold">{formatCurrency(salaryData.earnings?.specialAllowance || 0)}</span>
            </div>
            {salaryData.earnings?.monthlyBonus > 0 && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">Monthly Bonus</span>
                <span className="text-slate-900 font-bold">{formatCurrency(salaryData.earnings.monthlyBonus)}</span>
              </div>
            )}
            {salaryData.earnings?.quarterlyBonus > 0 && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">Quarterly Bonus</span>
                <span className="text-slate-900 font-bold">{formatCurrency(salaryData.earnings.quarterlyBonus)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deductions Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Deductions Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-slate-700 font-medium">Provident Fund (PF)</span>
              <span className="text-red-600 font-bold">{formatCurrency(salaryData.deductions?.pf || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-slate-700 font-medium">ESIC</span>
              <span className="text-red-600 font-bold">{formatCurrency(salaryData.deductions?.esic || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-slate-700 font-medium">Tax Deducted at Source (TDS)</span>
              <span className="text-red-600 font-bold">{formatCurrency(salaryData.deductions?.tds || 0)}</span>
            </div>
            {(salaryData.deductions?.salaryAdvance || 0) > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="text-slate-700 font-medium">Salary Advance</span>
                <span className="text-red-600 font-bold">{formatCurrency(salaryData.deductions?.salaryAdvance || 0)}</span>
              </div>
            )}
            {(salaryData.deductions?.loan || 0) > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="text-slate-700 font-medium">Loan Deduction</span>
                <span className="text-red-600 font-bold">{formatCurrency(salaryData.deductions?.loan || 0)}</span>
              </div>
            )}
            {salaryData.deductions?.lop > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="text-slate-700 font-medium">Loss of Pay (LOP)</span>
                <span className="text-red-600 font-bold">{formatCurrency(salaryData.deductions.lop)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}