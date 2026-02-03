'use client';
import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Filter, Search, ChevronDown,
  Building2, Users, IndianRupee, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Percent, CreditCard,
  AlertTriangle, CheckCircle, Eye, Printer, Mail,
  ArrowUpCircle, ArrowDownCircle, DollarSign, Receipt,
  Clock, Award, Settings, RefreshCw, FileSpreadsheet,
  Table, ChevronRight, X, ChevronLeft, Loader
} from 'lucide-react';

interface Employee {
  _id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  branch: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  allowances: number;
  pf: number;
  esic: number;
  uan: string;
  pfNumber: string;
  esiNumber: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

interface PayrollRecord {
  _id: string;
  employeeId: Employee;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  createdAt: string;
}

interface MonthlyStats {
  month: string;
  year: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employeeCount: number;
}

export default function PayrollReports() {
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyStats[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPayroll: 0,
    activeEmployees: 0,
    totalDeductions: 0,
    avgSalary: 0
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees
        const empRes = await fetch('/api/employees');
        const empData = await empRes.json();
        setEmployees(empData.data || []);

        // Fetch payroll records
        const payRes = await fetch(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`);
        const payData = await payRes.json();
        const records = payData.data || [];
        setPayrollRecords(records);

        // Calculate stats
        if (records.length > 0) {
          const totalGross = records.reduce((sum: number, r: PayrollRecord) => sum + (r.baseSalary + r.allowances), 0);
          const totalNet = records.reduce((sum: number, r: PayrollRecord) => sum + r.netSalary, 0);
          const totalDed = records.reduce((sum: number, r: PayrollRecord) => sum + r.deductions, 0);
          
          setStats({
            totalPayroll: totalNet,
            activeEmployees: records.length,
            totalDeductions: totalDed,
            avgSalary: Math.round(totalGross / records.length)
          });
        }

        // Calculate department-wise stats
        const deptMap: any = {};
        records.forEach((record: PayrollRecord) => {
          const dept = record.employeeId?.department || 'Unknown';
          if (!deptMap[dept]) {
            deptMap[dept] = { department: dept, employees: 0, totalSalary: 0, totalPF: 0, totalESIC: 0 };
          }
          deptMap[dept].employees += 1;
          deptMap[dept].totalSalary += record.baseSalary + record.allowances;
          deptMap[dept].totalPF += record.employeeId?.pf || 0;
          deptMap[dept].totalESIC += record.employeeId?.esic || 0;
        });

        const deptStats = Object.values(deptMap).map((dept: any) => ({
          ...dept,
          avgSalary: Math.round(dept.totalSalary / dept.employees)
        }));
        setDepartmentStats(deptStats);

        // Fetch monthly trends (last 6 months)
        const trends: MonthlyStats[] = [];
        for (let i = 0; i < 6; i++) {
          const m = (selectedMonth - i + 12) % 12;
          const y = selectedMonth - i < 0 ? selectedYear - 1 : selectedYear;
          
          const trendRes = await fetch(`/api/payroll?month=${m}&year=${y}`);
          const trendData = await trendRes.json();
          const trendRecords = trendData.data || [];
          
          const totalGross = trendRecords.reduce((sum: number, r: PayrollRecord) => sum + (r.baseSalary + r.allowances), 0);
          const totalNet = trendRecords.reduce((sum: number, r: PayrollRecord) => sum + r.netSalary, 0);
          const totalDed = trendRecords.reduce((sum: number, r: PayrollRecord) => sum + r.deductions, 0);
          
          trends.push({
            month: months[m],
            year: y,
            totalGross,
            totalNet,
            totalDeductions: totalDed,
            employeeCount: trendRecords.length
          });
        }
        setMonthlyTrends(trends.reverse());

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-9 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-cyan-600 animate-spin" />
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            background: white;
            padding: 20px;
            margin: 0;
            page-break-inside: avoid;
          }
          .print-section {
            page-break-inside: avoid;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .print-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .print-meta {
            font-size: 12px;
            color: #666;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 no-print">
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
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mb-6 no-print">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Report Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {months.map((month, idx) => (
                      <option key={month} value={idx}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-6 no-print">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalPayroll)}</p>
              <p className="text-xs text-green-600 mt-2">Net salary</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <CheckCircle className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Active Employees</p>
              <p className="text-3xl font-bold text-slate-900">{stats.activeEmployees}</p>
              <p className="text-xs text-slate-500 mt-2">This month</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <ArrowDownCircle className="w-6 h-6 text-amber-600" />
                </div>
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalDeductions)}</p>
              <p className="text-xs text-slate-500 mt-2">All types</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Avg Salary</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.avgSalary)}</p>
              <p className="text-xs text-slate-500 mt-2">Per employee</p>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm no-print">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'monthly-register', label: 'Monthly Register', icon: FileText },
                { id: 'pf-esic', label: 'PF & ESIC', icon: Building2 },
                { id: 'bank-transfer', label: 'Bank Transfer', icon: CreditCard },
                { id: 'department', label: 'Department', icon: BarChart3 },
                { id: 'loans', label: 'Loans', icon: AlertTriangle },
                { id: 'trends', label: 'Trends', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    selectedReport === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
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
          <div className="space-y-6 print-container">
            <div className="print-header print-only" style={{ display: 'none' }}>
              <div className="print-title">Payroll Reports & Analytics Overview</div>
              <div className="print-meta">{months[selectedMonth]} {selectedYear}</div>
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
                    <div className={`p-3 rounded-lg group-hover:scale-110 transition-transform ${
                      report.color === 'cyan' ? 'bg-gradient-to-br from-cyan-50 to-cyan-100' :
                      report.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100' :
                      report.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
                      report.color === 'amber' ? 'bg-gradient-to-br from-amber-50 to-amber-100' :
                      'bg-gradient-to-br from-blue-50 to-blue-100'
                    }`}>
                      <report.icon className={`w-8 h-8 ${
                        report.color === 'cyan' ? 'text-cyan-600' :
                        report.color === 'green' ? 'text-green-600' :
                        report.color === 'purple' ? 'text-purple-600' :
                        report.color === 'amber' ? 'text-amber-600' :
                        'text-blue-600'
                      }`} />
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
          <div className="print-container">
            <div className="print-header print-only" style={{ display: 'none' }}>
              <div className="print-title">Monthly Salary Register</div>
              <div className="print-meta">{months[selectedMonth]} {selectedYear}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Monthly Salary Register</h2>
                  <p className="text-slate-600">Complete salary breakdown for {months[selectedMonth]} {selectedYear}</p>
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
                    <th className="px-4 py-3 text-right font-semibold text-green-700 bg-green-50">Gross</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">PF</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">ESIC</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-700 bg-red-50">Total Ded.</th>
                    <th className="px-4 py-3 text-right font-semibold text-cyan-700 bg-cyan-50">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((record, idx) => {
                    const emp = record.employeeId;
                    const gross = record.baseSalary + record.allowances;
                    return (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{emp?.employeeCode}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{emp?.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp?.designation}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(record.baseSalary)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp?.hra || 0)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp?.conveyance || 0)}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600 bg-green-50">{formatCurrency(gross)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp?.pf || 0)}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(emp?.esic || 0)}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-600 bg-red-50">{formatCurrency(record.deductions)}</td>
                        <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(record.netSalary)}</td>
                      </tr>
                    );
                  })}
                  {payrollRecords.length > 0 && (
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(payrollRecords.reduce((s, r) => s + r.baseSalary, 0))}</td>
                      <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(payrollRecords.reduce((s, r) => s + (r.employeeId?.hra || 0), 0))}</td>
                      <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(payrollRecords.reduce((s, r) => s + (r.employeeId?.conveyance || 0), 0))}</td>
                      <td className="px-4 py-3 text-right text-green-700 bg-green-100 text-base">{formatCurrency(payrollRecords.reduce((s, r) => s + (r.baseSalary + r.allowances), 0))}</td>
                      <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(payrollRecords.reduce((s, r) => s + (r.employeeId?.pf || 0), 0))}</td>
                      <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(payrollRecords.reduce((s, r) => s + (r.employeeId?.esic || 0), 0))}</td>
                      <td className="px-4 py-3 text-right text-red-700 bg-red-100 text-base">{formatCurrency(payrollRecords.reduce((s, r) => s + r.deductions, 0))}</td>
                      <td className="px-4 py-3 text-right text-cyan-700 bg-cyan-100 text-lg">{formatCurrency(payrollRecords.reduce((s, r) => s + r.netSalary, 0))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}

        {/* PF & ESIC Report Tab */}
        {selectedReport === 'pf-esic' && (
          <div className="space-y-6 print-container">
            <div className="print-header print-only" style={{ display: 'none' }}>
              <div className="print-title">PF & ESIC Report</div>
              <div className="print-meta">{months[selectedMonth]} {selectedYear}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">PF & ESIC Report</h2>
                <p className="text-slate-600">{months[selectedMonth]} {selectedYear}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">UAN</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">PF Number</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">ESI Number</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">PF Amount</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">ESIC Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRecords.map((record, idx) => {
                      const emp = record.employeeId;
                      return (
                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{emp?.employeeName}</td>
                          <td className="px-4 py-3 text-slate-600">{emp?.uan || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{emp?.pfNumber || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{emp?.esiNumber || '-'}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(emp?.pf || 0)}</td>
                          <td className="px-4 py-3 text-right font-bold text-cyan-600">{formatCurrency(emp?.esic || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Tab */}
        {selectedReport === 'bank-transfer' && (
          <div className="print-container">
            <div className="print-header print-only" style={{ display: 'none' }}>
              <div className="print-title">Bank Transfer Sheet</div>
              <div className="print-meta">Salary Disbursement - {months[selectedMonth]} {selectedYear}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Bank Transfer Sheet</h2>
                  <p className="text-slate-600">Salary disbursement for {months[selectedMonth]} {selectedYear}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Total Transfer Amount: {formatCurrency(payrollRecords.reduce((s, r) => s + r.netSalary, 0))}</p>
                    <p className="text-sm text-slate-600">{payrollRecords.length} employees • Ready for processing</p>
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
                    {payrollRecords.map((record, idx) => {
                      const emp = record.employeeId;
                      return (
                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{emp?.employeeName}</td>
                          <td className="px-4 py-3 text-slate-600">{emp?.employeeCode}</td>
                          <td className="px-4 py-3 text-slate-900">{emp?.bankName || '-'}</td>
                          <td className="px-4 py-3 text-slate-900 font-mono">{emp?.accountNumber || '-'}</td>
                          <td className="px-4 py-3 text-slate-900 font-mono">{emp?.ifsc || '-'}</td>
                          <td className="px-4 py-3 text-right font-bold text-cyan-600 bg-cyan-50">{formatCurrency(record.netSalary)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Department Analysis Tab */}
        {selectedReport === 'department' && (
          <div className="space-y-6 print-container">
            <div className="print-header print-only" style={{ display: 'none' }}>
              <div className="print-title">Department-wise Salary Analysis</div>
              <div className="print-meta">{months[selectedMonth]} {selectedYear}</div>
            </div>
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
                    {departmentStats.map((dept, idx) => {
                      const totalGross = payrollRecords.reduce((s, r) => s + (r.baseSalary + r.allowances), 0);
                      return (
                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{dept.department}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{dept.employees}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.totalSalary)}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.avgSalary)}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.totalPF)}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(dept.totalESIC)}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{totalGross > 0 ? ((dept.totalSalary / totalGross) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visual Chart */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Department Distribution</h3>
                <div className="space-y-4">
                  {departmentStats.map((dept, idx) => {
                    const totalGross = payrollRecords.reduce((s, r) => s + (r.baseSalary + r.allowances), 0);
                    const percentage = totalGross > 0 ? ((dept.totalSalary / totalGross) * 100).toFixed(0) : 0;
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
                            className={`bg-gradient-to-r ${colors[idx % colors.length]} h-4 rounded-full flex items-center justify-end pr-2`}
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
          </div>
        )}

        {/* Trends Tab */}
        {selectedReport === 'trends' && (
          <div className="space-y-6 print-container">
            <div className="print-header print-only" style={{ display: 'none' }}>
              <div className="print-title">6-Month Payroll Trends</div>
              <div className="print-meta">Historical Analysis</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
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
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTrends.map((data, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{data.month} {data.year}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{data.employeeCount}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(data.totalGross)}</td>
                        <td className="px-4 py-3 text-right text-red-600">{formatCurrency(data.totalDeductions)}</td>
                        <td className="px-4 py-3 text-right font-bold text-cyan-600">{formatCurrency(data.totalNet)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Trends */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Payroll Growth</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyTrends.map((data, idx) => {
                    const maxValue = Math.max(...monthlyTrends.map(d => d.totalNet));
                    const height = maxValue > 0 ? (data.totalNet / maxValue) * 100 : 0;
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
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-800">Average Monthly Payroll</span>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(Math.round(monthlyTrends.reduce((s, d) => s + d.totalNet, 0) / monthlyTrends.length))}</p>
                    <p className="text-xs text-green-700 mt-1">Last 6 months</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-cyan-800">Active Employees</span>
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">{stats.activeEmployees}</p>
                    <p className="text-xs text-cyan-700 mt-1">Current month</p>
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
