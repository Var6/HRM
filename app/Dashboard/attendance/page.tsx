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
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employee: {
            ...item.employee,
            monthlyLeaves: {}
          },
          attendance: item.attendance
        });
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
const handleQuickMark = async (employeeId: string, status: string, leaveType?: string, leaveReason?: string) => {  // ✅ ADD leaveReason parameter
  try {
    const today = new Date();
    
  const payload = {
  employeeId,
  date: today.toISOString(), // backend extracts month
  year: selectedYear,
  status,
  leaveType,
  leaveReason
};

    const res = await fetch(`/api/attendance/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to update');
    const result = await res.json();

    setAttendanceData(prevData => prevData.map(item => {
      if (item.employee._id === employeeId) {
        return { ...item, attendance: result.attendance };
      }
      return item;
    }));

  } catch (error) {
    console.error("Failed to mark attendance", error);
    alert("Failed to update attendance");
  }
};

  // Helper to check today's status for UI styling
  const getTodayStatus = (records: any[]) => {
    const todayStr = new Date().toDateString(); // Or selected date
    const record = records?.find((r: any) => new Date(r.date).toDateString() === todayStr);
    return record ? record.status : 'present'; // Default to 'present' if no record exists
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
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowMarkAttendance(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <Plus className="w-5 h-5" />
                Mark Attendance
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
                                             className="w-24 h-24 rounded-xl object-cover border-4 border-slate-200"
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
                        <p className="text-xs text-slate-500 mb-1">Total Leaves Taken</p>
                        <p className="text-2xl font-bold text-slate-900">{employee.totalLeavesTaken}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Leave Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                          {/* Calculation using the attendance object */}
                          {(
                            (employee.leaveBalance?.casualLeave || 0) + 
                            (employee.leaveBalance?.earnedLeave || 0) - 
                            (attendance.summary?.casualLeavesTaken || 0) - 
                            (attendance.summary?.earnedLeavesTaken || 0)
                          ).toFixed(1)}
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Earned Leave</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {((employee.leaveBalance?.earnedLeave || 0) - (attendance.summary?.earnedLeavesTaken || 0)).toFixed(1)}
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Casual Leave</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {((employee.leaveBalance?.casualLeave || 0) - (attendance.summary?.casualLeavesTaken || 0)).toFixed(1)}
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
              <h2 className="text-2xl font-bold text-slate-900">  Yearly Attendance Report ({selectedYear})</h2>
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
                                             className="w-24 h-24 rounded-xl object-cover border-4 border-slate-200"
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
                        onClick={() => handleQuickMark(employee._id, 'present')} // ✅ FIXED: ._id
                        className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                          currentStatus === 'present' 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-green-50'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Present
                      </button>

                      {/* HALF DAY BUTTON */}
                      <button 
                         onClick={() => handleQuickMark(employee._id, 'halfDay', 'casual')} // ✅ FIXED: ._id
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
      handleQuickMark(employee._id, 'absent', undefined, reason);
    } else {
      alert('Absence reason is required!');
    }
  }}
  className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
    currentStatus === 'absent' 
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
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg">
                <Save className="w-5 h-5" />
                Save Attendance
              </button>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {selectedView === 'reports' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Leave Type Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-cyan-600" />
                  Leave Type Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-slate-700">Earned Leave</span>
                    <span className="font-bold text-green-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-slate-700">Casual Leave</span>
                    <span className="font-bold text-blue-600">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium text-slate-700">Sick Leave</span>
                    <span className="font-bold text-amber-600">15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-slate-700">Half Day</span>
                    <span className="font-bold text-purple-600">5%</span>
                  </div>
                </div>
              </div>

              {/* Department-wise Analysis */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-600" />
                  Department-wise Leaves
                </h3>
                <div className="space-y-4">
                  {['HR', 'Finance', 'Operations', 'Admin'].map((dept, idx) => {
                    const percentage = [75, 60, 45, 30][idx];
                    return (
                      <div key={dept}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">{dept}</span>
                          <span className="text-sm text-slate-500">{percentage}%</span>
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
              <h3 className="text-xl font-bold text-slate-900 mb-4">Export Reports</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:border-green-300 transition-all text-left">
                  <FileText className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-semibold text-slate-900">Monthly Report</p>
                  <p className="text-sm text-slate-600">Export monthly attendance</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg hover:border-blue-300 transition-all text-left">
                  <Download className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-semibold text-slate-900">Annual Report</p>
                  <p className="text-sm text-slate-600">Export yearly summary</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg hover:border-purple-300 transition-all text-left">
                  <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-semibold text-slate-900">Custom Report</p>
                  <p className="text-sm text-slate-600">Generate custom reports</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}