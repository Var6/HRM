'use client';
import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Filter, Search, ChevronDown,
  Building2, Users, IndianRupee, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Percent, CreditCard,
  AlertTriangle, CheckCircle, Eye, Printer, Mail,
  ArrowUpCircle, ArrowDownCircle, DollarSign, Receipt,
  Clock, Award, Settings, RefreshCw, FileSpreadsheet,
  Table, ChevronRight, X, ChevronLeft
} from 'lucide-react';

// Types
interface ReportFilter {
  month: string;
  year: number;
  department?: string;
  branch?: string;
  reportType: string;
}

interface MonthlyData {
  month: string;
  year: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employeeCount: number;
}

// Mock Data
const mockMonthlyTrends: MonthlyData[] = [
  { month: 'January', year: 2026, totalGross: 195500, totalNet: 171945, totalDeductions: 23555, employeeCount: 4 },
  { month: 'December', year: 2025, totalGross: 195500, totalNet: 171945, totalDeductions: 23555, employeeCount: 4 },
  { month: 'November', year: 2025, totalGross: 195500, totalNet: 171945, totalDeductions: 23555, employeeCount: 4 },
  { month: 'October', year: 2025, totalGross: 193000, totalNet: 170100, totalDeductions: 22900, employeeCount: 4 },
  { month: 'September', year: 2025, totalGross: 193000, totalNet: 170100, totalDeductions: 22900, employeeCount: 4 },
  { month: 'August', year: 2025, totalGross: 190000, totalNet: 167500, totalDeductions: 22500, employeeCount: 4 }
];

const mockDepartmentData = [
  { department: 'HR', employees: 1, totalSalary: 60000, avgSalary: 60000, totalPF: 4200, totalESIC: 525 },
  { department: 'Finance', employees: 1, totalSalary: 48500, avgSalary: 48500, totalPF: 3360, totalESIC: 420 },
  { department: 'Operations', employees: 1, totalSalary: 55000, avgSalary: 55000, totalPF: 3840, totalESIC: 480 },
  { department: 'Admin', employees: 1, totalSalary: 32000, avgSalary: 32000, totalPF: 2160, totalESIC: 270 }
];

const mockPFESICData = [
  { employeeName: 'ALAKA KUMARI', employeeCode: 'EMP001', uan: '100123456789', pfNumber: 'PF/PAT/123456', basic: 35000, pf: 4200, eps: 1250, epf: 2950, esiNumber: 'ESI/123456789', esic: 525 },
  { employeeName: 'SANTOSH KUMAR', employeeCode: 'EMP002', uan: '100123456790', pfNumber: 'PF/PAT/123457', basic: 28000, pf: 3360, eps: 1000, epf: 2360, esiNumber: 'ESI/123456790', esic: 420 },
  { employeeName: 'SANKET PRASAD SINHA', employeeCode: 'EMP003', uan: '100123456791', pfNumber: 'PF/PAT/123458', basic: 32000, pf: 3840, eps: 1150, epf: 2690, esiNumber: 'ESI/123456791', esic: 480 },
  { employeeName: 'KRITI KAMINI', employeeCode: 'EMP004', uan: '100123456792', pfNumber: 'PF/PAT/123459', basic: 18000, pf: 2160, eps: 650, epf: 1510, esiNumber: 'ESI/123456792', esic: 270 }
];

const mockBankTransferData = [
  { employeeName: 'ALAKA KUMARI', employeeCode: 'EMP001', accountNumber: '1234567890', ifsc: 'SBIN0001234', bankName: 'State Bank of India', netSalary: 51775 },
  { employeeName: 'SANTOSH KUMAR', employeeCode: 'EMP002', accountNumber: '9876543210', ifsc: 'HDFC0001234', bankName: 'HDFC Bank', netSalary: 42920 },
  { employeeName: 'SANKET PRASAD SINHA', employeeCode: 'EMP003', accountNumber: '5555666677', ifsc: 'ICIC0001234', bankName: 'ICICI Bank', netSalary: 48180 },
  { employeeName: 'KRITI KAMINI', employeeCode: 'EMP004', accountNumber: '1111222233', ifsc: 'AXIS0001234', bankName: 'Axis Bank', netSalary: 29070 }
];

const mockLoanAdvanceData = [
  { employeeName: 'ALAKA KUMARI', employeeCode: 'EMP001', loanAmount: 50000, loanType: 'Personal Loan', monthlyDeduction: 2000, outstanding: 30000, status: 'Active' },
  { employeeName: 'SANTOSH KUMAR', employeeCode: 'EMP002', loanAmount: 0, loanType: '-', monthlyDeduction: 0, outstanding: 0, status: 'None' },
  { employeeName: 'SANKET PRASAD SINHA', employeeCode: 'EMP003', loanAmount: 30000, loanType: 'Emergency Loan', monthlyDeduction: 1500, outstanding: 18000, status: 'Active' },
  { employeeName: 'KRITI KAMINI', employeeCode: 'EMP004', loanAmount: 0, loanType: '-', monthlyDeduction: 0, outstanding: 0, status: 'None' }
];

const mockAdvanceData = [
  { employeeName: 'SANTOSH KUMAR', employeeCode: 'EMP002', advanceAmount: 5000, advanceDate: '2026-01-05', deductionAmount: 1000, remainingBalance: 4000 },
  { employeeName: 'KRITI KAMINI', employeeCode: 'EMP004', advanceAmount: 2000, advanceDate: '2026-01-10', deductionAmount: 500, remainingBalance: 1500 }
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollReports() {
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [filters, setFilters] = useState<ReportFilter>({
    month: 'January',
    year: 2026,
    reportType: 'monthly'
  });
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = (reportType: string, format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting ${reportType} as ${format}`);
    // Add export logic here
  };

  return (
    <div className="min-h-screen bg-linear-to-br  from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Payroll Reports & Analytics</h1>
              <p className="text-slate-600">Comprehensive insights and detailed reports for payroll management</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25">
                <Download className="w-5 h-5" />
                Export All
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Report Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
                  <select 
                    value={filters.month}
                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <select 
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="">All Departments</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="">All Branches</option>
                    <option value="corporate">Corporate Office</option>
                    <option value="patna">Patna Branch</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                  Reset
                </button>
                <button className="px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all">
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(171945)}</p>
              <p className="text-xs text-green-600 mt-2">+2.5% from last month</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <CheckCircle className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Active Employees</p>
              <p className="text-3xl font-bold text-slate-900">4</p>
              <p className="text-xs text-slate-500 mt-2">No change</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg">
                  <ArrowDownCircle className="w-6 h-6 text-amber-600" />
                </div>
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(23555)}</p>
              <p className="text-xs text-slate-500 mt-2">12% of gross salary</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Avg Salary</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(42986)}</p>
              <p className="text-xs text-slate-500 mt-2">Per employee</p>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'monthly-register', label: 'Monthly Register', icon: FileText },
                { id: 'pf-esic', label: 'PF & ESIC', icon: Building2 },
                { id: 'bank-transfer', label: 'Bank Transfer', icon: CreditCard },
                { id: 'department', label: 'Department', icon: BarChart3 },
                { id: 'loans', label: 'Loans & Advances', icon: AlertTriangle },
                { id: 'trends', label: 'Trends', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    selectedReport === tab.id
                      ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
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
                      <span className="font-medium text-slate-700">HRA (40%)</span>
                      <span className="font-bold text-slate-900">23%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Conveyance</span>
                      <span className="font-bold text-slate-900">5%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-purple-500 to-pink-600 h-3 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Allowances & Bonus</span>
                      <span className="font-bold text-slate-900">14%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-amber-500 to-orange-600 h-3 rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ArrowDownCircle className="w-6 h-6 text-red-600" />
                  Deduction Breakdown
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Provident Fund (PF)</span>
                      <span className="font-bold text-slate-900">57%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-red-500 to-rose-600 h-3 rounded-full" style={{ width: '57%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">ESIC</span>
                      <span className="font-bold text-slate-900">7%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-orange-500 to-amber-600 h-3 rounded-full" style={{ width: '7%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Loans</span>
                      <span className="font-bold text-slate-900">15%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-purple-500 to-pink-600 h-3 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">TDS & Advances</span>
                      <span className="font-bold text-slate-900">21%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-slate-500 to-slate-600 h-3 rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Reports Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Monthly Salary Register',
                  description: 'Complete breakdown of all salary components',
                  icon: FileText,
                  color: 'cyan',
                  action: () => setSelectedReport('monthly-register')
                },
                { 
                  title: 'PF & ESIC Report',
                  description: 'Statutory compliance and contribution details',
                  icon: Building2,
                  color: 'green',
                  action: () => setSelectedReport('pf-esic')
                },
                { 
                  title: 'Bank Transfer Sheet',
                  description: 'Ready-to-use bank payment format',
                  icon: CreditCard,
                  color: 'purple',
                  action: () => setSelectedReport('bank-transfer')
                },
                { 
                  title: 'Department Analysis',
                  description: 'Salary distribution by department',
                  icon: BarChart3,
                  color: 'amber',
                  action: () => setSelectedReport('department')
                },
                { 
                  title: 'Loan & Advance Report',
                  description: 'Outstanding loans and salary advances',
                  icon: AlertTriangle,
                  color: 'red',
                  action: () => setSelectedReport('loans')
                },
                { 
                  title: 'Payroll Trends',
                  description: 'Historical payroll analytics',
                  icon: TrendingUp,
                  color: 'blue',
                  action: () => setSelectedReport('trends')
                }
              ].map((report, idx) => (
                <button
                  key={idx}
                  onClick={report.action}
                  className="bg-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 shadow-sm p-6 text-left transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-linear-to-br from-${report.color}-50 to-${report.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                      <report.icon className={`w-8 h-8 text-${report.color}-600`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-slate-600">{report.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Register Tab */}
        {selectedReport === 'monthly-register' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-linear-to-r from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Monthly Salary Register</h2>
                  <p className="text-slate-600">Complete salary breakdown for {filters.month} {filters.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleExport('monthly-register', 'pdf')}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button 
                    onClick={() => handleExport('monthly-register', 'excel')}
                    className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                  <button 
                    onClick={() => handleExport('monthly-register', 'csv')}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2"
                  >
                    <Table className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Emp Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Designation</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Basic</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">HRA</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Conveyance</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Bonus</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Special</th>
                    <th className="px-4 py-3 text-right font-semibold text-green-700 bg-green-50">Gross</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">PF</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">ESIC</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">TDS</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Loan</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Advance</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-700 bg-red-50">Total Ded.</th>
                    <th className="px-4 py-3 text-right font-semibold text-cyan-700 bg-cyan-50">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">EMP001</td>
                    <td className="px-4 py-3 font-medium text-slate-900">ALAKA KUMARI</td>
                    <td className="px-4 py-3 text-slate-600">Dy. Manager-HR</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹35,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹14,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,400</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹3,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹5,600</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600 bg-green-50">₹60,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹4,200</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹525</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹0</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 bg-red-50">₹8,225</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">₹51,775</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">EMP002</td>
                    <td className="px-4 py-3 font-medium text-slate-900">SANTOSH KUMAR</td>
                    <td className="px-4 py-3 text-slate-600">Asst. Accountant</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹28,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹11,200</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,400</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹4,400</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600 bg-green-50">₹48,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹3,360</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹420</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹800</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹0</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,000</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 bg-red-50">₹5,580</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">₹42,920</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">EMP003</td>
                    <td className="px-4 py-3 font-medium text-slate-900">SANKET PRASAD SINHA</td>
                    <td className="px-4 py-3 text-slate-600">Asst. Branch Incharge</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹32,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹12,800</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,400</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,800</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹5,000</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600 bg-green-50">₹55,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹3,840</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹480</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹0</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 bg-red-50">₹6,820</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">₹48,180</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">EMP004</td>
                    <td className="px-4 py-3 font-medium text-slate-900">KRITI KAMINI</td>
                    <td className="px-4 py-3 text-slate-600">Office Assistant</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹18,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹7,200</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,400</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,900</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600 bg-green-50">₹32,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹2,160</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹270</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹0</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹0</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹500</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 bg-red-50">₹2,930</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">₹29,070</td>
                  </tr>
                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                    <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,13,000</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹45,200</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹9,600</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹9,800</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹17,900</td>
                    <td className="px-4 py-3 text-right text-green-700 bg-green-100 text-base">₹1,95,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹13,560</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,695</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹3,300</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹3,500</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹1,500</td>
                    <td className="px-4 py-3 text-right text-red-700 bg-red-100 text-base">₹23,555</td>
                    <td className="px-4 py-3 text-right text-cyan-700 bg-cyan-100 text-lg">₹1,71,945</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PF & ESIC Report Tab */}
        {selectedReport === 'pf-esic' && (
          <div className="space-y-6">
            {/* PF Report */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-linear-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Provident Fund (PF) Report</h2>
                    <p className="text-slate-600">{filters.month} {filters.year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">UAN Number</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">PF Number</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Basic Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Employee PF (12%)</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">EPS (8.33%)</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">EPF (3.67%)</th>
                      <th className="px-4 py-3 text-right font-semibold text-green-700 bg-green-50">Total PF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPFESICData.map((emp, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{emp.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.uan}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.pfNumber}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.basic)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.pf)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.eps)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.epf)}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600 bg-green-50">{formatCurrency(emp.pf * 2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-right">₹1,13,000</td>
                      <td className="px-4 py-3 text-right">₹13,560</td>
                      <td className="px-4 py-3 text-right">₹4,050</td>
                      <td className="px-4 py-3 text-right">₹9,510</td>
                      <td className="px-4 py-3 text-right text-green-700 bg-green-100 text-base">₹27,120</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ESIC Report */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-linear-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Employee State Insurance (ESIC) Report</h2>
                    <p className="text-slate-600">{filters.month} {filters.year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">ESI Number</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Gross Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Employee Share (0.75%)</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Employer Share (3.25%)</th>
                      <th className="px-4 py-3 text-right font-semibold text-cyan-700 bg-cyan-50">Total ESIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPFESICData.map((emp, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{emp.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.esiNumber}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.basic * 1.7)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.esic)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(Math.round(emp.esic * 4.33))}</td>
                        <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(emp.esic + Math.round(emp.esic * 4.33))}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-right">₹1,695</td>
                      <td className="px-4 py-3 text-right">₹7,339</td>
                      <td className="px-4 py-3 text-right text-cyan-700 bg-cyan-100 text-base">₹9,034</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Sheet Tab */}
        {selectedReport === 'bank-transfer' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-linear-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Bank Transfer Sheet</h2>
                  <p className="text-slate-600">Salary disbursement for {filters.month} {filters.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    NEFT Format
                  </button>
                  <button className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Total Transfer Amount: {formatCurrency(171945)}</p>
                    <p className="text-sm text-slate-600">4 employees • Ready for processing</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">S.No</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Code</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Bank Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Account Number</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">IFSC Code</th>
                      <th className="px-4 py-3 text-right font-semibold text-cyan-700 bg-cyan-50">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBankTransferData.map((emp, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{emp.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.employeeCode}</td>
                        <td className="px-4 py-3 text-slate-900">{emp.bankName}</td>
                        <td className="px-4 py-3 text-slate-900 font-mono">{emp.accountNumber}</td>
                        <td className="px-4 py-3 text-slate-900 font-mono">{emp.ifsc}</td>
                        <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(emp.netSalary)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3" colSpan={6}>TOTAL AMOUNT TO BE TRANSFERRED</td>
                      <td className="px-4 py-3 text-right text-cyan-700 bg-cyan-100 text-base">₹1,71,945</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Department Analysis Tab */}
        {selectedReport === 'department' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Department-wise Salary Analysis</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Department</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Employees</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Total PF</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Total ESIC</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDepartmentData.map((dept, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{dept.department}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{dept.employees}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.totalSalary)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.avgSalary)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.totalPF)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.totalESIC)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{((dept.totalSalary / 195500) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Department Distribution</h3>
              <div className="space-y-4">
                {mockDepartmentData.map((dept, idx) => {
                  const percentage = ((dept.totalSalary / 195500) * 100).toFixed(0);
                  const colors = ['from-cyan-500 to-blue-600', 'from-green-500 to-emerald-600', 'from-purple-500 to-pink-600', 'from-amber-500 to-orange-600'];
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{dept.department}</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{formatCurrency(dept.totalSalary)}</span>
                          <span className="text-sm text-slate-500 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-4">
                        <div 
                          className={`bg-linear-to-r ${colors[idx]} h-4 rounded-full flex items-center justify-end pr-2`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-semibold">{dept.employees} emp</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Loans & Advances Tab */}
        {selectedReport === 'loans' && (
          <div className="space-y-6">
            {/* Loans Report */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-linear-to-r from-red-50 to-rose-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Employee Loans Report</h2>
                    <p className="text-slate-600">Outstanding loan details</p>
                  </div>
                  <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Code</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Loan Type</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Original Amount</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Monthly Deduction</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Outstanding</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLoanAdvanceData.filter(emp => emp.status === 'Active').map((emp, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{emp.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.employeeCode}</td>
                        <td className="px-4 py-3 text-slate-900">{emp.loanType}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.loanAmount)}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(emp.monthlyDeduction)}</td>
                        <td className="px-4 py-3 text-right font-bold text-amber-600">{formatCurrency(emp.outstanding)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-right">₹80,000</td>
                      <td className="px-4 py-3 text-right text-red-700">₹3,500</td>
                      <td className="px-4 py-3 text-right text-amber-700">₹48,000</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Salary Advances Report */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-linear-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Salary Advances Report</h2>
                    <p className="text-slate-600">Current month deductions</p>
                  </div>
                  <button className="px-4 py-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Code</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Advance Date</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Advance Amount</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">This Month Deduction</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAdvanceData.map((emp, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{emp.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.employeeCode}</td>
                        <td className="px-4 py-3 text-slate-900">{emp.advanceDate}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp.advanceAmount)}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(emp.deductionAmount)}</td>
                        <td className="px-4 py-3 text-right font-bold text-amber-600">{formatCurrency(emp.remainingBalance)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-right">₹7,000</td>
                      <td className="px-4 py-3 text-right text-red-700">₹1,500</td>
                      <td className="px-4 py-3 text-right text-amber-700">₹5,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {selectedReport === 'trends' && (
          <div className="space-y-6">
            {/* Monthly Trends Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-linear-to-r from-blue-50 to-cyan-50">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">6-Month Payroll Trends</h2>
                <p className="text-slate-600">Historical payroll data and analysis</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Month</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Employees</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Gross Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Deductions</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Net Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMonthlyTrends.map((data, idx) => {
                      const prevMonth = mockMonthlyTrends[idx + 1];
                      const change = prevMonth ? ((data.totalNet - prevMonth.totalNet) / prevMonth.totalNet * 100) : 0;
                      return (
                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{data.month} {data.year}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{data.employeeCount}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(data.totalGross)}</td>
                          <td className="px-4 py-3 text-right text-red-600">{formatCurrency(data.totalDeductions)}</td>
                          <td className="px-4 py-3 text-right font-bold text-cyan-600">{formatCurrency(data.totalNet)}</td>
                          <td className="px-4 py-3 text-right">
                            {change !== 0 && (
                              <span className={`flex items-center justify-end gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(change).toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Trends */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Payroll Growth</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {mockMonthlyTrends.reverse().map((data, idx) => {
                    const maxValue = Math.max(...mockMonthlyTrends.map(d => d.totalNet));
                    const height = (data.totalNet / maxValue) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg transition-all hover:from-cyan-600 hover:to-blue-700 cursor-pointer"
                            style={{ height: `${height * 2}px` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 font-medium text-center">{data.month.substring(0, 3)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-800">Average Monthly Payroll</span>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">₹1,71,508</p>
                    <p className="text-xs text-green-700 mt-1">Last 6 months</p>
                  </div>

                  <div className="p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-cyan-800">Stable Headcount</span>
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">4</p>
                    <p className="text-xs text-cyan-700 mt-1">No change in 6 months</p>
                  </div>

                  <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-amber-800">Deduction Rate</span>
                      <Percent className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600">12.05%</p>
                    <p className="text-xs text-amber-700 mt-1">Of gross salary</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}