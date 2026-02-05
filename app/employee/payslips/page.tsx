'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeNavbar from '@/components/employee/EmployeeNavbar';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { PayslipDocument } from '@/lib/PayslipDocuments';

interface PayrollRecord {
  _id: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  earnings: {
    basic: number;
    hra: number;
    conveyance: number;
    monthlyBonus: number;
    quarterlyBonus: number;
    specialAllowance: number;
  };
  deductionsBreakdown: {
    pf: number;
    esic: number;
    advance: number;
    loan: number;
    tds: number;
    lop: number;
  };
  salaryProcessed: boolean;
  salaryHold: boolean;
  salaryHoldReason?: string;
}

interface EmployeeData {
  _id: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  employeeName?: string;
  email?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  mobileNumber?: string;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayslipsPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData');
    if (!employeeData) {
      router.push('/employee/login');
      return;
    }

    const empData = JSON.parse(employeeData);
    
    const initializeData = async () => {
      setEmployee(empData);
      
      // Fetch full employee details from API to ensure we have all fields
      await fetchEmployeeDetails(empData._id);
      await fetchPayslips(empData._id);
      
      setLoading(false);
    };
    
    initializeData();
  }, [router]);

  const fetchEmployeeDetails = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Employee API response:', data);
        
        // Map the API response to ensure we have all name fields
        const mappedData = {
          ...data,
          employeeName: data.name || data.employeeName || '',
          firstName: data.name?.split(' ')[0] || data.firstName || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || data.lastName || ''
        };
        console.log('Mapped data with name:', mappedData.employeeName, 'first:', mappedData.firstName, 'last:', mappedData.lastName);
        // Update employee data with full details from API
        setEmployee(prev => prev ? { ...prev, ...mappedData } : mappedData);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const fetchPayslips = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/payroll?employeeId=${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        // The API returns payroll data with employeeId as an object, so we need to extract just the payslips
        const payslipsArray = data.data ? data.data.map((record: any) => ({
          _id: record._id,
          month: record.month,
          year: record.year,
          baseSalary: record.baseSalary,
          allowances: record.allowances,
          grossSalary: record.grossSalary,
          deductions: record.deductions,
          netSalary: record.netSalary,
          earnings: record.earnings,
          deductionsBreakdown: record.deductionsBreakdown,
          salaryProcessed: record.salaryProcessed,
          salaryHold: record.salaryHold,
          salaryHoldReason: record.salaryHoldReason
        })) : [];
        setPayslips(payslipsArray);
        return Promise.resolve();
      }
    } catch (error) {
      console.error('Error fetching payslips:', error);
      return Promise.resolve();
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

  const handleDownloadPayslip = async (payroll: PayrollRecord) => {
    try {
      // Prepare payslip data in the format needed by PayslipDocument
      const payslipData = {
        companyName: 'CSCC Society',
        companyAddress: 'Corporate Office',
        month: months[payroll.month],
        year: payroll.year.toString(),
        employeeId: employee?.employeeCode || '',
        employeeName: fullName || 'Employee',
        department: employee?.department || '',
        designation: employee?.designation || '',
        fatherName: '',
        dateOfJoining: employee?.joiningDate || '',
        panNumber: '',
        uanNumber: '',
        esiNumber: '',
        aadharNumber: '',
        presentDays: 0,
        payDays: 0,
        modeOfPay: 'Bank Transfer',
        accountNumber: '',
        earnings: payroll.earnings,
        deductions: payroll.deductionsBreakdown,
        totalEarnings: payroll.grossSalary,
        totalDeductions: payroll.deductions,
        netPay: payroll.netSalary,
        netPayInWords: '',
        remarks: payroll.salaryHoldReason || '',
        salaryProcessed: payroll.salaryProcessed,
        salaryHold: payroll.salaryHold,
      };

      // Generate PDF
      const blob = await pdf(<PayslipDocument data={payslipData} />).toBlob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${employee?.employeeCode}_${months[payroll.month]}_${payroll.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      alert('Error downloading payslip. Please try again.');
    }
  };

  if (loading || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Build full name from available fields - check 'name' field first (primary field in database)
  let fullName = 'Employee';
  if (employee?.name && employee.name.trim()) {
    fullName = employee.name;
  } else if (employee?.employeeName && employee.employeeName.trim()) {
    fullName = employee.employeeName;
  } else if (employee?.firstName || employee?.lastName) {
    fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  }
  
  console.log('Final fullName:', fullName, 'from employee:', employee?.name);

  const filteredPayslips = payslips.filter(p => p.year === selectedYear);
  const availableYears = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeNavbar employeeName={fullName || 'Employee'} employeeCode={employee.employeeCode} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Payslips</h1>
            <p className="text-slate-600 mt-2">{fullName || 'Employee'} | {employee.employeeCode}</p>
          </div>
          <Link href="/employee/dashboard">
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </div>
          </Link>
        </div>

        {/* Year Filter */}
        <div className="mb-6 flex gap-2">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Payslips Grid */}
        {filteredPayslips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayslips.map((payslip) => (
              <div
                key={payslip._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className={`px-6 py-4 ${payslip.salaryProcessed ? 'bg-green-50' : payslip.salaryHold ? 'bg-red-50' : 'bg-yellow-50'} border-b border-slate-200`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {months[payslip.month]}
                      </h3>
                      <p className="text-sm text-slate-600">{payslip.year}</p>
                    </div>
                    <div className="text-right">
                      {payslip.salaryProcessed && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          ✓ Processed
                        </span>
                      )}
                      {payslip.salaryHold && (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          ✕ On Hold
                        </span>
                      )}
                      {!payslip.salaryProcessed && !payslip.salaryHold && (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4">
                  {/* Salary Summary */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Gross Salary</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(payslip.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Deductions</span>
                      <span className="font-semibold text-red-600">{formatCurrency(payslip.deductions)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between">
                      <span className="text-slate-700 font-semibold">Net Salary</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(payslip.netSalary)}</span>
                    </div>
                  </div>

                  {/* Hold Reason (if any) */}
                  {payslip.salaryHold && payslip.salaryHoldReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-red-700 mb-1">Hold Reason:</p>
                      <p className="text-xs text-red-600">{payslip.salaryHoldReason}</p>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadPayslip(payslip)}
                    className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0 0V8m0 4l4-4m-4 4l-4-4M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                    </svg>
                    <span>Download HTML</span>
                  </button>
                </div>

                {/* Card Footer - Details */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center space-x-1">
                    <span>View Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Payslips Available</h3>
            <p className="text-slate-600">No payslips are available for {selectedYear}. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
