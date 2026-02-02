'use client';
import React, { useEffect, useState } from 'react';
import { 
  Calendar, Users, TrendingUp, Clock, Plus, Download, Upload,
  Filter, Search, ChevronLeft, ChevronRight, Check, X, Coffee,
  Briefcase, Home, AlertCircle, CheckCircle, XCircle, Edit,
  Trash2, Eye, FileText, BarChart3, PieChart, Activity,
  User, MapPin, Phone, Mail, ChevronDown, ChevronUp, Save
} from 'lucide-react';
import Link from 'next/link';


const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] as const;
type Month = typeof months[number];

type LeaveType = 'casual' | 'earned' | 'sick' | 'halfDay' | 'absent';

interface DailyAttendance {
  employeeId: number;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'halfDay' | 'weekend' | 'holiday';
  leaveType?: LeaveType;
  leaveReason?: string;  
  remarks?: string;
}

export default function AttendanceManagement() {
  const [selectedView, setSelectedView] = useState<'overview' | 'monthly' | 'daily' | 'reports'>('overview');
  
  const getCurrentFinancialYear = () => {
  const today = new Date();
  const month = today.getMonth(); // 0 = Jan, 3 = Apr

  // Financial year starts in April
  return month < 3 ? today.getFullYear() - 1 : today.getFullYear();
};

const [selectedYear, setSelectedYear] = useState<number>(getCurrentFinancialYear());
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [selectedHolidayMonth, setSelectedHolidayMonth] = useState(new Date().getMonth());
  const [selectedHolidayYear, setSelectedHolidayYear] = useState(new Date().getFullYear());
  const [holidayFormData, setHolidayFormData] = useState({
    name: '',
    date: '',
    description: ''
  });
 const filteredEmployees = attendanceData.filter(item => {
  const emp = item.employee;
  if (!emp) return false;

  const q = searchQuery.toLowerCase();

  return (
    emp.name?.toLowerCase().includes(q) ||
    emp.employeeCode?.toLowerCase().includes(q) ||
    emp.designation?.toLowerCase().includes(q)
  );
});

const monthIndexToName = (index: number) => [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
][index];



  // Calculate statistics
const stats = {
  totalEmployees: attendanceData.length,
  averageLeavesTaken: attendanceData.length > 0 
  ? (
      attendanceData.reduce(
        (sum, item) => sum + (item.attendance?.summary?.totalLeaves || 0),
        0
      ) / attendanceData.length
    ).toFixed(1)
  : '0',

totalLeavesThisMonth: attendanceData.reduce(
  (sum, item) => sum + (item.attendance?.summary?.totalLeaves || 0),
  0
),

  employeesOnLeaveToday: attendanceData.filter(item => {
    const today = new Date().toDateString();
    return item.attendance.records?.some((r: any) => 
      new Date(r.date).toDateString() === today && r.status === 'leave'
    );
  }).length
};
    useEffect(() => {
  fetchAttendanceData();
}, [selectedYear]);

const fetchAttendanceData = async () => {
  try {
    setLoading(true);
    
    // ✅ FIXED: Fetch ALL months from Apr (selectedYear) to Mar (selectedYear+1)
    const allMonths = [];
    
    // Apr-Dec of selectedYear (months 3-11)
    for (let m = 3; m <= 11; m++) {
      const res = await fetch(`/api/attendance?month=${m}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        allMonths.push(...data.data);
      }
    }
    
    // Jan-Mar of selectedYear+1 (months 0-2)
    for (let m = 0; m <= 2; m++) {
      const res = await fetch(`/api/attendance?month=${m}&year=${selectedYear + 1}`);
      if (res.ok) {
        const data = await res.json();
        allMonths.push(...data.data);
      }
    }

    // Group by employee and merge monthly data
    const employeeMap = new Map();
    
    allMonths.forEach((item: any) => {
      const empId = item.employee._id;
      
     const currentMonth = new Date().getMonth();
const isCurrentMonth = item.attendance.month === currentMonth;

if (!employeeMap.has(empId)) {
  employeeMap.set(empId, {
    employee: {
      ...item.employee,
      monthlyLeaves: {}
    },
    attendance: item.attendance,
    currentMonthAttendance: isCurrentMonth ? item.attendance : null  // ✅ Track current month separately
  });
} else if (isCurrentMonth) {
  // Update current month attendance if found
  employeeMap.get(empId).currentMonthAttendance = item.attendance;
}
      
      const emp = employeeMap.get(empId);
      const monthName = monthIndexToName(item.attendance.month);
      emp.employee.monthlyLeaves[monthName] = item.attendance.summary?.totalLeaves || 0;
    });

   const normalized = Array.from(employeeMap.values()).map((item: any) => {
  // Ensure all months exist
  months.forEach(m => {
    if (!(m in item.employee.monthlyLeaves)) {
      item.employee.monthlyLeaves[m] = null;
    }
  });

  item.employee.totalLeavesTaken = Object.values(item.employee.monthlyLeaves)
    .filter((v: any) => v !== null)
    .reduce((sum: number, val: any) => sum + (val || 0), 0);

  // ✅ Use currentMonthAttendance for daily tracker, fallback to attendance
  item.attendance = item.currentMonthAttendance || item.attendance;

  return item;
});

    setAttendanceData(normalized);

  } catch (error) {
    console.error('Error fetching attendance:', error);
  } finally {
    setLoading(false);
  }
};
// Function to mark attendance directly from the list
const handleQuickMark = async (employeeId: string, status: string, leaveType?: string, leaveReason?: string) => {
  try {
    setMarkingAttendance(true);
    const today = new Date();
    
    const payload = {
      employeeId,
      date: today.toISOString(),
      month: today.getMonth(),
      year: today.getFullYear(),
      status,
      leaveType,
      leaveReason: leaveReason || ''
    };

    console.log('Quick mark payload:', payload);

    const res = await fetch(`/api/attendance/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', res.status); // ✅ Check status

    if (!res.ok) {
      const errorText = await res.text(); // ✅ Get raw response first
      console.error('Raw error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      console.error('Parsed error:', errorData);
      alert(`Failed to update: ${errorData.error || errorText}`); // ✅ Show actual error
      throw new Error(errorData.error || 'Failed to update');
    }

    const result = await res.json();
    console.log('Success result:', result);

    // ✅ FIX: Fetch ONLY the current month's fresh data
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const freshRes = await fetch(`/api/attendance?month=${currentMonth}&year=${currentYear}`);
if (freshRes.ok) {
  const freshData = await freshRes.json();
  
  setAttendanceData(prevData => prevData.map(item => {
    if (item.employee._id === employeeId) {
      // Find the updated employee data from fresh fetch
      const updatedEmployeeData = freshData.data.find((d: any) => d.employee._id === employeeId);
      
      if (updatedEmployeeData) {
        // Update monthly leaves for current month
        const currentMonthName = monthIndexToName(currentMonth);
        
        return {
          ...item,
          employee: {
            ...item.employee,
            monthlyLeaves: {
              ...item.employee.monthlyLeaves,
              [currentMonthName]: updatedEmployeeData.attendance.summary?.totalLeaves || 0
            },
            totalLeavesTaken: Object.values({
              ...item.employee.monthlyLeaves,
              [currentMonthName]: updatedEmployeeData.attendance.summary?.totalLeaves || 0
            })
              .filter((v: any) => v !== null)
              .reduce((sum: number, val: any) => sum + (val || 0), 0)
          },
          attendance: updatedEmployeeData.attendance
        };
      }
    }
    return item;
  }));
}

setShowSuccessToast(true);
setTimeout(() => setShowSuccessToast(false), 3000);
  } catch (error: any) {
    console.error("Failed to mark attendance", error);
    console.error("Error details:", error.message);
  }finally{
    setMarkingAttendance(false);
  }
};
//---------
  // Helper to check today's status for UI styling
  const getTodayStatus = (records: any[]) => {
    const todayStr = new Date().toDateString(); // Or selected date
    const record = records?.find((r: any) => new Date(r.date).toDateString() === todayStr);
    return record ? record.status : 'present'; // Default to 'present' if no record exists
  };

  // ========== HOLIDAY MANAGEMENT FUNCTIONS ==========
  const fetchHolidays = async () => {
    try {
      const response = await fetch(
        `/api/holidays?month=${selectedHolidayMonth}&year=${selectedHolidayYear}`
      );
      const data = await response.json();
      if (data.success) {
        setHolidays(data.holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [selectedHolidayMonth, selectedHolidayYear]);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...holidayFormData,
          createdBy: 'HR'
        })
      });

      if (response.ok) {
        setShowHolidayModal(false);
        setHolidayFormData({ name: '', date: '', description: '' });
        fetchHolidays();
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (confirm('Delete this holiday?')) {
      try {
        const response = await fetch(`/api/holidays?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchHolidays();
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  // ========== EXCEL EXPORT FUNCTION ==========
  const handleExcelExport = async () => {
    try {
      // Dynamically import xlsx to avoid build-time issues
      const XLSX = (await import('xlsx')).default || await import('xlsx');
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare data - employees in rows, months in columns
      const exportData = filteredEmployees.map((item, index) => {
        const row: any = {
          'Sl.': index + 1,
          'Employee Name': item.employee.name || '',
          'Employee Code': item.employee.employeeCode || '',
        };
        
        // Add monthly leave data (Apr-Mar) - show 0 if no data
        months.forEach(month => {
          row[month] = item.employee.monthlyLeaves?.[month] || 0;
        });
        
        // Calculate and add leave balance
        const earnedLeaveAllocated = item.employee.leaveBalance?.earnedLeave || 0;
        const casualLeaveAllocated = item.employee.leaveBalance?.casualLeave || 0;
        const totalLeavesTaken = item.employee.totalLeavesTaken || 0;
        const leaveBalance = Math.max(0, earnedLeaveAllocated + casualLeaveAllocated - totalLeavesTaken);
        
        row['Carry Forwarded EL'] = 0;
        row['Earned Leave'] = earnedLeaveAllocated.toFixed(2);
        row['Casual Leave'] = casualLeaveAllocated.toFixed(2);
        row['Leave Balance'] = leaveBalance.toFixed(2);
        
        return row;
      });
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 5 },   // Sl.
        { wch: 20 },  // Employee Name
        { wch: 15 },  // Employee Code
        ...Array(12).fill({ wch: 8 }),  // Months (Apr-Mar)
        { wch: 15 }, // Carry Forwarded EL
        { wch: 13 }, // Earned Leave
        { wch: 13 }, // Casual Leave
        { wch: 13 }  // Leave Balance
      ];
      ws['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      
      // Download file
      XLSX.writeFile(wb, `Attendance_Report_${selectedYear}-${selectedYear + 1}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export. Please ensure xlsx library is installed.');
    }
  };

  // ========== CALCULATE DYNAMIC REPORT STATISTICS ==========
  const calculateReportStats = () => {
    let earnedLeaves = 0;
    let casualLeaves = 0;
    let sickLeaves = 0;
    let halfDays = 0;
    
    attendanceData.forEach(item => {
      item.attendance?.records?.forEach((record: any) => {
        if (record.status === 'leave') {
          if (record.leaveType === 'earned') earnedLeaves++;
          else if (record.leaveType === 'casual') casualLeaves++;
          else if (record.leaveType === 'sick') sickLeaves++;
        } else if (record.status === 'halfDay') {
          halfDays += 0.5;
        }
      });
    });
    
    const total = earnedLeaves + casualLeaves + sickLeaves + halfDays;
    
    return {
      earnedLeaves: total > 0 ? ((earnedLeaves / total) * 100).toFixed(1) : 0,
      casualLeaves: total > 0 ? ((casualLeaves / total) * 100).toFixed(1) : 0,
      sickLeaves: total > 0 ? ((sickLeaves / total) * 100).toFixed(1) : 0,
      halfDays: total > 0 ? ((halfDays / total) * 100).toFixed(1) : 0,
      totalLeaves: total
    };
  };

  // ========== CALCULATE DEPARTMENT-WISE LEAVES ==========
  const calculateDepartmentLeaves = () => {
    const departments: { [key: string]: number } = {};
    const departmentCounts: { [key: string]: number } = {};
    
    attendanceData.forEach(item => {
      const dept = item.employee.department || 'Unassigned';
      if (!departments[dept]) {
        departments[dept] = 0;
        departmentCounts[dept] = 0;
      }
      departments[dept] += item.employee.totalLeavesTaken || 0;
      departmentCounts[dept]++;
    });
    
    return Object.keys(departments).map(dept => ({
      name: dept,
      avgLeaves: departmentCounts[dept] > 0 ? (departments[dept] / departmentCounts[dept]).toFixed(1) : 0,
      totalLeaves: departments[dept],
      employees: departmentCounts[dept]
    }));
  };

if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-9 flex items-center justify-center">
      <p className="text-slate-500 text-lg">Loading attendance data...</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        {showSuccessToast && (
  <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
    <CheckCircle className="w-5 h-5" />
    <span>Attendance marked successfully!</span>
  </div>
)}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Attendance Management
              </h1>
              <p className="text-slate-600">Track and manage employee attendance efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExcelExport}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowHolidayModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25"
              >
                <Calendar className="w-5 h-5" />
                Manage Holidays
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
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">On Leave Today</p>
              <p className="text-3xl font-bold text-slate-900">{stats.employeesOnLeaveToday}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Leaves This Month</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalLeavesThisMonth}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Avg. Leaves/Employee</p>
              <p className="text-3xl font-bold text-slate-900">{stats.averageLeavesTaken}</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'monthly', label: 'Monthly View', icon: Calendar },
                { id: 'daily', label: 'Daily Tracker', icon: Clock },
                { id: 'reports', label: 'Reports', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
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

            {/* Employee Cards */}
            <div className="space-y-4">
             {/* Employee Cards */}
            <div className="space-y-4">
              {filteredEmployees.map((item) => {
                // FIX: Destructure both objects from the item
                const { employee, attendance } = item;
                
                return (
                <div
                  key={employee._id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-slate-200">
                         {employee.photograph ? (
                                           <img 
                                             src={employee.photograph} 
                                             alt={employee.name}
                                               className="w-full h-full object-cover"
                                           />
                                         ) : (
                                           <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-4 border-slate-200">
                                             <User className="w-12 h-12 text-cyan-600" />
                                           </div>
                                         )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{employee.name}</h3>
                          <p className="text-slate-600 mb-1">{employee.designation}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{employee.employeeCode}</span>
                            <span>•</span>
                            <span>{employee.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* DYNAMIC LINK: Connects to your [slug] page */}
                        <Link 
                          href={`/Dashboard/attendance/${employee._id}`} 
                          className="px-4 py-2 border border-cyan-200 text-cyan-700 rounded-lg hover:bg-cyan-50 transition-all flex items-center gap-2"
                        >
                           <Edit className="w-4 h-4" />
                           Manage
                        </Link>

                        <button
                          onClick={() => setSelectedEmployee(selectedEmployee === employee._id ? null : employee._id)}
                          className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-all flex items-center gap-2"
                        >
                          {selectedEmployee === employee._id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Quick View
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats - NOW FIXED with safe access to 'attendance' */}
                   <div className="grid md:grid-cols-4 gap-4 mb-4">
  <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
    <p className="text-xs text-slate-500 mb-1">Total Leaves Taken (FY)</p>
    <p className="text-2xl font-bold text-slate-900">
      {employee.totalLeavesTaken.toFixed(1)}
    </p>
  </div>

  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
    <p className="text-xs text-slate-500 mb-1">Leave Balance (FY)</p>
    <p className="text-2xl font-bold text-green-600">
      {Math.max(0, (
        (employee.leaveBalance?.earnedLeave || 0) +
        (employee.leaveBalance?.casualLeave || 0) -
        employee.totalLeavesTaken
      )).toFixed(1)}
    </p>
  </div>

  <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
    <p className="text-xs text-slate-500 mb-1">Earned Leave (Allocated)</p>
    <p className="text-2xl font-bold text-blue-600">
      {(employee.leaveBalance?.earnedLeave || 0).toFixed(1)}
    </p>
  </div>

  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
    <p className="text-xs text-slate-500 mb-1">Casual Leave (Allocated)</p>
    <p className="text-2xl font-bold text-purple-600">
      {(employee.leaveBalance?.casualLeave || 0).toFixed(1)}
    </p>
  </div>
</div>


                 {/* Expanded Details - Quick View */}
{selectedEmployee === employee._id && (
  <div className="pt-4 border-t border-slate-200">
    <h4 className="text-lg font-semibold text-slate-900 mb-4">
      Monthly Leave Breakdown ({selectedYear}-{selectedYear + 1})
    </h4>
    <div className="grid grid-cols-6 gap-3">
      {months.map((month) => {
        const leaves = employee.monthlyLeaves?.[month];
        
        // ✅ Debug: Log to see what data we have
        console.log(`${month}: ${leaves}`);

        return (
          <div
            key={month}
            className={`p-3 rounded-lg border-2 text-center ${
              leaves === null
                ? 'bg-slate-50 border-slate-200'
                : leaves === 0
                  ? 'bg-green-50 border-green-200'
                  : leaves < 2
                    ? 'bg-blue-50 border-blue-200'
                    : leaves < 5
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-red-50 border-red-200'
            }`}
          >
            <p className="text-xs font-semibold text-slate-600 mb-1">{month}</p>
            <p className={`text-xl font-bold ${
              leaves === null 
                ? 'text-slate-400' 
                : leaves === 0 
                  ? 'text-green-600' 
                  : leaves < 2
                    ? 'text-blue-600'
                    : leaves < 5
                      ? 'text-amber-600'
                      : 'text-red-600'
            }`}>
              {leaves === null ? '—' : leaves.toFixed(1)}
            </p>
          </div>
        );
      })}
    </div>
  </div>
)}
                  </div>
                </div>
              )})}
            </div>
            </div>
          </div>
        )}

        {/* Monthly View Tab */}
        {selectedView === 'monthly' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
  Financial Year Attendance ({selectedYear}–{selectedYear + 1})
  <span className="text-sm font-normal text-slate-500 ml-2">(Apr–Mar)</span>
</h2>

              <div className="flex items-center gap-3">
               <button 
    onClick={() => setSelectedYear(prev => prev - 1)}
  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
>
  <ChevronLeft className="w-5 h-5 text-slate-600" />
</button>
<span className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-900">
  {selectedYear}–{selectedYear + 1}
</span>

<button 
    onClick={() => setSelectedYear(prev => prev + 1)}
  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
>
  <ChevronRight className="w-5 h-5 text-slate-600" />
</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 bg-slate-50">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 bg-slate-50">Designation</th>
                    {months.map((month) => (
                      <th key={month} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 bg-slate-50">
                        {month}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 bg-slate-50">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 bg-slate-50">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((item) => {
                    const employee = item.employee;
                    // safely handle missing leaves
                    const leaves = employee.monthlyLeaves || {}; 
                    
                    return (
                      <tr key={employee._id} className="border-b border-slate-200 hover:bg-slate-50 transition-all">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-slate-900">{employee.name}</p>
                            <p className="text-xs text-slate-500">{employee.employeeCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{employee.designation}</td>
                       {months.map((month) => (
  <td key={month} className="px-4 py-3 text-center">
    {(() => {
      const leaves = employee.monthlyLeaves?.[month];
      
      return (
        <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
          leaves === null
            ? 'bg-slate-100 text-slate-400'
            : leaves === 0
              ? 'bg-green-100 text-green-700'
              : leaves < 2
                ? 'bg-blue-100 text-blue-700'
                : leaves < 5
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
        }`}>
          {leaves === null ? '—' : leaves.toFixed(1)}
        </span>
      );
    })()}
  </td>
))}
                        <td className="px-4 py-3 text-center font-bold text-slate-900">
                          {employee.totalLeavesTaken}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">
                          {(
  (employee.leaveBalance?.casualLeave || 0) +
  (employee.leaveBalance?.earnedLeave || 0) -
  employee.totalLeavesTaken
).toFixed(1)
}

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Tracker Tab */}
        {selectedView === 'daily' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Daily Attendance Tracker</h2>
              <input
              disabled
                type="date"
                className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

          <div className="space-y-3">
              {filteredEmployees.map((item) => {
                const { employee, attendance } = item;
                const currentStatus = getTodayStatus(attendance?.records || []);

                return (
                  <div key={employee._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                       {employee.photograph ? (
                                           <img 
                                             src={employee.photograph} 
                                             alt={employee.name}
                                             className="w-full h-full object-cover" 
                                           />
                                         ) : (
                                           <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-4 border-slate-200">
                                             <User className="w-12 h-12 text-cyan-600" />
                                           </div>
                                         )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{employee.name}</p>
                        <p className="text-sm text-slate-500">{employee.designation}</p>
                      </div>
                    </div>

                   <div className="flex items-center gap-2">
                      {/* PRESENT BUTTON */}
                      <button 
  onClick={() => handleQuickMark(employee._id, 'present')}
  disabled={markingAttendance}  // ✅ ADD THIS
  className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
    currentStatus === 'present' 
      ? 'bg-green-600 text-white shadow-md' 
      : 'bg-white border border-slate-200 text-slate-600 hover:bg-green-50'
  } ${markingAttendance ? 'opacity-50 cursor-not-allowed' : ''}`}  // ✅ ADD THIS
>
                        <CheckCircle className="w-4 h-4" />
                        Present
                      </button>

                      {/* HALF DAY BUTTON */}
                      <button 
                         onClick={() => handleQuickMark(employee._id, 'halfDay', 'casual')} // ✅ FIXED: ._id
                         disabled={markingAttendance}  // ✅ ADD THIS
                         className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                          currentStatus === 'halfDay' 
                            ? 'bg-amber-500 text-white shadow-md' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                        }`}
                      >
                        <Coffee className="w-4 h-4" />
                        Half Day
                      </button>

                      {/* LEAVE BUTTON */}
                      <button 
                        onClick={() => handleQuickMark(employee._id, 'leave', 'casual')} // ✅ FIXED: ._id
                        disabled={markingAttendance}  // ✅ ADD THIS
                        className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                          currentStatus === 'leave' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        Leave
                      </button>

                      {/* ABSENT BUTTON */}
                      {/* ON LEAVE (LOP) BUTTON */}
<button 
  onClick={() => {
    const reason = prompt('Enter absence reason:');

    if (reason && reason.trim()) {
      handleQuickMark(employee._id, 'onLeave', undefined, reason);  // ✅ CHANGE 'absent' to 'onLeave'
    } else {
      alert('Absence reason is required!');
    }
  }}
  disabled={markingAttendance}  // ✅ ADD THIS
  className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
    currentStatus === 'onLeave' 
      ? 'bg-red-600 text-white shadow-md' 
      : 'bg-white border border-slate-200 text-slate-600 hover:bg-red-50'
  }`}
>
  <XCircle className="w-4 h-4" />
  Absent
</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
  <button 
    onClick={() => fetchAttendanceData()}
    disabled={loading}
    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
  >
    <Activity className="w-5 h-5" />
    {loading ? 'Refreshing...' : 'Refresh Data'}
  </button>
</div>
          </div>
        )}

        {/* Reports Tab */}
        {selectedView === 'reports' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Leave Type Distribution - DYNAMIC */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-cyan-600" />
                  Leave Type Distribution (FY {selectedYear}-{selectedYear + 1})
                </h3>
                {(() => {
                  const stats = calculateReportStats();
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-slate-700">Earned Leave</span>
                        <span className="font-bold text-green-600">{stats.earnedLeaves}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-slate-700">Casual Leave</span>
                        <span className="font-bold text-blue-600">{stats.casualLeaves}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <span className="font-medium text-slate-700">Sick Leave</span>
                        <span className="font-bold text-amber-600">{stats.sickLeaves}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium text-slate-700">Half Day</span>
                        <span className="font-bold text-purple-600">{stats.halfDays}%</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 mt-4">
                        <p className="text-sm text-slate-600">Total Leaves Taken: <span className="font-bold text-slate-900">{stats.totalLeaves}</span></p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Department-wise Analysis - DYNAMIC */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-600" />
                  Department-wise Leaves
                </h3>
                <div className="space-y-4">
                  {calculateDepartmentLeaves().map((dept) => {
                    const maxLeaves = calculateDepartmentLeaves().reduce((max, d) => Math.max(max, parseFloat(d.avgLeaves as any)), 0);
                    const percentage = maxLeaves > 0 ? (parseFloat(dept.avgLeaves as any) / maxLeaves) * 100 : 0;
                    
                    return (
                      <div key={dept.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <span className="font-medium text-slate-700">{dept.name}</span>
                            <p className="text-xs text-slate-500">({dept.employees} employees, {dept.totalLeaves} total leaves)</p>
                          </div>
                          <span className="text-sm font-bold text-slate-700">{dept.avgLeaves} avg</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Download className="w-6 h-6 text-cyan-600" />
                Export Reports
              </h3>
              <div className="grid md:grid-cols-1 gap-4">
                <button 
                  onClick={handleExcelExport}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-semibold text-slate-900">Download Attendance Report (Excel)</p>
                  <p className="text-sm text-slate-600">Export FY {selectedYear}-{selectedYear + 1} attendance with employee details, monthly leaves, and leave balances</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Holiday Management Modal */}
        {showHolidayModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-cyan-600" />
                  Holiday Management
                </h3>
                <button
                  onClick={() => setShowHolidayModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Month/Year Selector */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-slate-700">Month:</label>
                  <select
                    value={selectedHolidayMonth}
                    onChange={(e) => setSelectedHolidayMonth(Number(e.target.value))}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>

                  <label className="font-semibold text-slate-700">Year:</label>
                  <select
                    value={selectedHolidayYear}
                    onChange={(e) => setSelectedHolidayYear(Number(e.target.value))}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => fetchHolidays()}
                    className="ml-auto px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Add Holiday Form */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-6 border border-cyan-200">
                <h4 className="font-bold text-slate-900 mb-4">Add New Holiday</h4>
                <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Holiday Name</label>
                    <input
                      type="text"
                      value={holidayFormData.name}
                      onChange={(e) => setHolidayFormData({ ...holidayFormData, name: e.target.value })}
                      placeholder="e.g., Diwali"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={holidayFormData.date}
                      onChange={(e) => setHolidayFormData({ ...holidayFormData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={holidayFormData.description}
                      onChange={(e) => setHolidayFormData({ ...holidayFormData, description: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium"
                    >
                      Add Holiday
                    </button>
                  </div>
                </form>
              </div>

              {/* Holidays List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">
                  Holidays List - {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedHolidayMonth]} {selectedHolidayYear}
                </h4>

                {holidays.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No holidays marked for this month</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {holidays.map((holiday) => (
                      <div key={holiday._id} className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900">{holiday.name}</h5>
                            <p className="text-sm text-slate-600">
                              {new Date(holiday.date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            {holiday.description && (
                              <p className="text-xs text-slate-500 mt-1">{holiday.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteHoliday(holiday._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}