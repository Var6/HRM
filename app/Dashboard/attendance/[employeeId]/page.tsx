'use client';
import React, { useState, useEffect, use } from 'react'; // 👈 1. Added 'use'
import { 
  ArrowLeft, User, Mail, Phone, Briefcase,
  CheckCircle, XCircle, Coffee, Home, AlertCircle,
  TrendingUp, Award, ChevronLeft, ChevronRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Employee {
  _id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  email: string;
  mobileNumber: string;
  photograph?: string;
}
interface AttendanceRecord {
  date: Date;
  status: 'present' | 'onLeave' | 'leave' | 'halfDay' | 'weekend' | 'holiday';  // ✅ CHANGED
  leaveType?: 'casual' | 'earned' | 'sick' | 'halfDay' | 'extraordinary' | null;
  leaveReason?: string;  // ✅ ADDED
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
}


interface Attendance {
  _id: string;
  employeeId: string;
  month: number;
  year: number;
  records: AttendanceRecord[];
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLeaves: number;
    totalHalfDays: number;
    casualLeavesTaken: number;
    earnedLeavesTaken: number;
    sickLeavesTaken: number;
    extraordinaryLeavesTaken: number;
  };
  leaveBalance: {
    casualLeave: number;
    earnedLeave: number;
    carriedForward: number;
  };
}

// 👈 2. Updated Props Type to Promise (Next.js 15 Requirement)
export default function EmployeeAttendance({ params }: { params: Promise<{ employeeId: string }> }) {
  
  // 👈 3. Unwrap the params using React.use()
  const { employeeId } = use(params);
  const router = useRouter(); // ✅ Add this
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [leaveReason, setLeaveReason] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedHolidayDate, setSelectedHolidayDate] = useState<Date | null>(null);
  const [holidayName, setHolidayName] = useState('');
  const [markingHoliday, setMarkingHoliday] = useState(false);


const isTuesday = (date: Date) => {
  return date.getDay() === 2; // 0=Sun, 1=Mon, 2=Tue
};

const isHoliday = (date: Date) => {
  return holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.toDateString() === date.toDateString();
  });
};

const getHolidayName = (date: Date) => {
  const holiday = holidays.find(h => {
    const holidayDate = new Date(h.date);
    return holidayDate.toDateString() === date.toDateString();
  });
  return holiday?.name || '';
};

const fetchHolidays = async () => {
  try {
    const response = await fetch(`/api/holidays?month=${selectedMonth}&year=${selectedYear}`);
    const data = await response.json();
    if (data.success) {
      setHolidays(data.holidays || []);
    }
  } catch (error) {
    console.error('Error fetching holidays:', error);
  }
};

const markHolidayOnCalendar = async () => {
  if (!selectedHolidayDate || !holidayName.trim()) {
    alert('Please enter a holiday name');
    return;
  }

  try {
    setMarkingHoliday(true);
    const response = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: holidayName,
        date: selectedHolidayDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        description: `Marked by ${employee?.name || 'HR'} on employee attendance page`,
        createdBy: 'Employee Attendance'
      })
    });

    if (response.ok) {
      // Refresh holidays to show the new one
      await fetchHolidays();
      setShowHolidayModal(false);
      setSelectedHolidayDate(null);
      setHolidayName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      const error = await response.json();
      alert(`Failed to mark holiday: ${error.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error marking holiday:', error);
    alert('Failed to mark holiday. Please try again.');
  } finally {
    setMarkingHoliday(false);
  }
};

const calculatePresentDays = () => {
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  
  // ✅ Count Tuesdays in the month
  let tuesdayCount = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(selectedYear, selectedMonth, i);
    if (isTuesday(date)) tuesdayCount++;
  }
  
  const exceptionDays = attendance?.records.length || 0;
  return daysInMonth - exceptionDays - tuesdayCount; // ✅ Subtract Tuesdays
};

const generateCalendar = () => {
  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
  const days: Date[] = [];

  const startDay = firstDay.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(new Date(0)); 
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(selectedYear, selectedMonth, i);
    days.push(currentDate);
  }

  setCalendarDays(days);
};

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);
      
      // 👈 4. THE FIX: Use 'employeeId' (from params), NOT 'employee._id' (from state)
      const res = await fetch(
        `/api/attendance/${employeeId}?month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setEmployee(data.employee);
      setAttendance(data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceForDate = (date: Date): AttendanceRecord | null => {
    if (!attendance || date.getTime() === 0) return null;
    
    return attendance.records.find(
      r => new Date(r.date).toDateString() === date.toDateString()
    ) || null;
  };
  
  const markAttendance = async (date: Date, status: string, leaveType?: string) => {
  if (!attendance) return;

  try {
    setSaving(true);
    
    const payload = {
      month: selectedMonth,
      year: selectedYear,
      date: date.toISOString(),
      status,
      leaveType: leaveType || null,
      leaveReason: (status === 'leave' || status === 'onLeave') ? leaveReason : '',
      checkIn: status === 'present' ? '09:00' : '',
      checkOut: status === 'present' ? '18:00' : '',
      remarks: ''
    };

    console.log('Sending payload:', payload); // ✅ ADD THIS

    const res = await fetch(`/api/attendance/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', res.status); // ✅ ADD THIS

    if (!res.ok) {
      const errorData = await res.json(); // ✅ ADD THIS
      console.error('API Error Response:', errorData); // ✅ ADD THIS
      throw new Error(errorData.error || 'Failed to save');
    }

    const data = await res.json();
    console.log('Success response:', data); // ✅ ADD THIS
    
    setAttendance(data.attendance);
    setShowSuccess(true);
    setLeaveReason('');
    setTimeout(() => setShowSuccess(false), 3000);
     router.refresh(); 
  } catch (error: any) {
    console.error('Full error:', error); // ✅ ADD THIS
    alert(`Failed to save attendance: ${error.message}`); // ✅ ADD THIS
  } finally {
    setSaving(false);
  }
};

  const getStatusColor = (record: AttendanceRecord | null) => {
    if (!record) return 'bg-white border-slate-200';
    switch (record.status) {
      case 'present': return 'bg-green-50 border-green-300';
      case 'onLeave': return 'bg-red-50 border-red-300';  
      case 'leave': return 'bg-blue-50 border-blue-300';
      case 'halfDay': return 'bg-amber-50 border-amber-300';
      case 'weekend': return 'bg-purple-50 border-purple-300';
      case 'holiday': return 'bg-pink-50 border-pink-300';
      default: return 'bg-white border-slate-200';
    }
  };

  const getStatusIcon = (record: AttendanceRecord | null) => {
  if (!record) return null;
  
  // ✅ FIX: Different icons based on leave type
  if (record.status === 'leave') {
    switch (record.leaveType) {
      case 'casual': return <Home className="w-4 h-4 text-blue-600" />;
      case 'earned': return <Award className="w-4 h-4 text-indigo-600" />;
      case 'sick': return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default: return <Home className="w-4 h-4 text-blue-600" />;
    }
  }
  
  switch (record.status) {
    case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'onLeave': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'halfDay': return <Coffee className="w-4 h-4 text-amber-600" />;
    case 'holiday': return <Calendar className="w-4 h-4 text-pink-600" />;
    case 'weekend': return <Home className="w-4 h-4 text-purple-600" />;
    default: return null;
  }
};

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  useEffect(() => {
    // Only fetch if we have the ID
    if (employeeId) {
      fetchEmployeeAttendance();
    }
    fetchHolidays();
  }, [selectedMonth, selectedYear, employeeId]);
  
  useEffect(() => {
    generateCalendar();
  }, [selectedMonth, selectedYear, attendance]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9 flex items-center justify-center">
        <p className="text-slate-500 text-lg">Loading attendance...</p>
      </div>
    );
  } 
  
  if (!employee || !attendance) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9 flex items-center justify-center">
        <p className="text-slate-500 text-lg">Employee not found</p>
      </div>
    );
  }  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 pt-9">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/Dashboard/attendance"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Attendance
          </Link>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-medium">Attendance saved successfully!</p>
            </div>
          )}

          {/* Employee Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                {employee.photograph ? (
                  <img 
                    src={employee.photograph} 
                    alt={employee.name}
                    className="w-24 h-24 rounded-xl object-cover border-4 border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-4 border-slate-200">
                    <User className="w-12 h-12 text-cyan-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{employee.name}</h1>
                <p className="text-xl text-slate-600 mb-3">{employee.designation}</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">{employee.employeeCode} • {employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{employee.mobileNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}

              {calendarDays.map((date, index) => {
  if (date.getTime() === 0) {
    return <div key={index} className="aspect-square" />;
  }

  const record = getAttendanceForDate(date);
  const isToday = date.toDateString() === new Date().toDateString();
  const isFuture = date > new Date();
  const isTues = isTuesday(date); // ✅ Check if Tuesday
  const holiday = isHoliday(date); // ✅ Check if holiday
  
  const isPast = date < new Date() && !isToday;
  const displayAsPresent = !record && isPast && !isFuture && !isTues && !holiday; // ✅ Not present if Tuesday or holiday

  return (
    <div
      key={index}
      className={`aspect-square border-2 rounded-lg p-2 transition-all flex flex-col items-center justify-center ${
        holiday
          ? 'bg-pink-100 border-pink-300'
          : isTues
          ? 'bg-purple-50 border-purple-300 opacity-75' // ✅ Tuesday styling
          : displayAsPresent 
            ? 'bg-green-50 border-green-300'
            : getStatusColor(record)
      } ${isToday ? 'ring-2 ring-cyan-500' : ''} ${
        (isFuture || isTues) && !holiday ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer' // ✅ Disable Tuesday
      }`}
      onClick={() => {
        if (holiday) {
          // If clicking on holiday, show info - allow marking past/future holidays too
          setSelectedHolidayDate(date);
          setHolidayName('');
          setShowHolidayModal(true);
        } else if (!isFuture && !isTues) {
          setSelectedDate(date);
        }
      }}
    >
      <div className="flex flex-col items-center justify-center h-full w-full text-center">
        <span className={`text-sm font-semibold ${
          isToday ? 'text-cyan-600' : isTues ? 'text-purple-600' : holiday ? 'text-pink-600' : 'text-slate-900'
        }`}>
          {date.getDate()}
        </span>
        {holiday ? (
          <span className="text-xs text-pink-600 font-bold text-center leading-tight break-words max-w-[60px]">{getHolidayName(date)}</span>
        ) : isTues ? (
          <span className="text-xs text-purple-600 font-medium">OFF</span> // ✅ Show OFF for Tuesday
        ) : displayAsPresent ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          getStatusIcon(record)
        )}
      </div>
    </div>
  );
})}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Legend</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
  <span className="text-sm font-medium text-slate-700">Present</span>
  <span className="text-xl font-bold text-green-600">{calculatePresentDays()}</span>
</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                    <span className="text-xs text-slate-600">On Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
                    <span className="text-xs text-slate-600">Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-100 border-2 border-amber-300"></div>
                    <span className="text-xs text-slate-600">Half Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300"></div>
                    <span className="text-xs text-slate-600">Weekend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-pink-100 border-2 border-pink-300"></div>
                    <span className="text-xs text-slate-600">Holiday</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Mark Attendance */}
          {/* Quick Mark Attendance */}
            {selectedDate && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Mark Attendance - {selectedDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => markAttendance(selectedDate, 'present')}
                    disabled={saving}
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-all text-left disabled:opacity-50"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-semibold text-green-900">Present</p>
                  </button>

                  <button
                    onClick={() => markAttendance(selectedDate, 'onLeave')}
                    disabled={saving || !leaveReason.trim()}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-all text-left disabled:opacity-50"
                  >
                    <XCircle className="w-6 h-6 text-red-600 mb-2" />
                    <p className="font-semibold text-red-900">On Leave (LOP)</p>
                    <p className="text-xs text-red-700 mt-1">Loss of Pay</p>
                  </button>

                  <button
                    onClick={() => markAttendance(selectedDate, 'leave', 'casual')}
                    disabled={saving}
                    className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all text-left disabled:opacity-50"
                  >
                    <Home className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="font-semibold text-blue-900">Casual Leave</p>
                  </button>

                  <button
                    onClick={() => markAttendance(selectedDate, 'leave', 'earned')}
                    disabled={saving}
                    className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all text-left disabled:opacity-50"
                  >
                    <Award className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="font-semibold text-indigo-900">Earned Leave</p>
                  </button>

                  <button
                    onClick={() => markAttendance(selectedDate, 'halfDay', 'casual')}
                    disabled={saving}
                    className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-all text-left disabled:opacity-50"
                  >
                    <Coffee className="w-6 h-6 text-amber-600 mb-2" />
                    <p className="font-semibold text-amber-900">Half Day</p>
                  </button>

                  <button
                    onClick={() => markAttendance(selectedDate, 'leave', 'sick')}
                    disabled={saving}
                    className="p-4 bg-rose-50 border-2 border-rose-200 rounded-lg hover:bg-rose-100 transition-all text-left disabled:opacity-50"
                  >
                    <AlertCircle className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="font-semibold text-rose-900">Sick Leave</p>
                  </button>
                  <button
  onClick={() => markAttendance(selectedDate, 'holiday')}
  disabled={saving}
  className="p-4 bg-pink-50 border-2 border-pink-200 rounded-lg hover:bg-pink-100 transition-all text-left disabled:opacity-50"
>
  <Calendar className="w-6 h-6 text-pink-600 mb-2" />
  <p className="font-semibold text-pink-900">Holiday</p>
</button>
                </div>

                {/* ✅ TEXTAREA ADDED HERE - INSIDE THE CARD */}

                {/* ✅ END OF TEXTAREA SECTION */}

              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            
            {/* Monthly Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
                Monthly Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Present</span>
                  <span className="text-xl font-bold text-green-600">{attendance.summary.totalPresent}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">On Leave (LOP)</span> 
                  <span className="text-xl font-bold text-red-600">{attendance.summary.totalAbsent}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Leaves</span>
                  <span className="text-xl font-bold text-blue-600">{attendance.summary.totalLeaves}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Half Days</span>
                  <span className="text-xl font-bold text-amber-600">{attendance.summary.totalHalfDays}</span>
                </div>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-cyan-600" />
                Leave Summary
              </h3>

              <div className="space-y-6">
                {/* Casual Leave */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">Casual Leave</p>
                      <p className="text-sm text-slate-500">Total Taken / Allocated</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${attendance.summary.casualLeavesTaken > attendance.leaveBalance.casualLeave ? 'text-red-600' : 'text-blue-600'}`}>
                        {attendance.summary.casualLeavesTaken.toFixed(1)} / {attendance.leaveBalance.casualLeave.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        attendance.summary.casualLeavesTaken > attendance.leaveBalance.casualLeave 
                          ? 'bg-linear-to-r from-red-500 to-red-600' 
                          : 'bg-linear-to-r from-blue-500 to-cyan-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (attendance.summary.casualLeavesTaken / Math.max(attendance.leaveBalance.casualLeave, attendance.summary.casualLeavesTaken)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  {attendance.summary.casualLeavesTaken > attendance.leaveBalance.casualLeave && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Exceeded by {(attendance.summary.casualLeavesTaken - attendance.leaveBalance.casualLeave).toFixed(1)} days</p>
                  )}
                  {attendance.summary.casualLeavesTaken <= attendance.leaveBalance.casualLeave && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">✓ {(attendance.leaveBalance.casualLeave - attendance.summary.casualLeavesTaken).toFixed(1)} days remaining</p>
                  )}
                </div>

                {/* Earned Leave */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">Earned Leave</p>
                      <p className="text-sm text-slate-500">Total Taken / Allocated</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${attendance.summary.earnedLeavesTaken > attendance.leaveBalance.earnedLeave ? 'text-red-600' : 'text-green-600'}`}>
                        {attendance.summary.earnedLeavesTaken.toFixed(1)} / {attendance.leaveBalance.earnedLeave.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        attendance.summary.earnedLeavesTaken > attendance.leaveBalance.earnedLeave 
                          ? 'bg-linear-to-r from-red-500 to-red-600' 
                          : 'bg-linear-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (attendance.summary.earnedLeavesTaken / Math.max(attendance.leaveBalance.earnedLeave, attendance.summary.earnedLeavesTaken)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  {attendance.summary.earnedLeavesTaken > attendance.leaveBalance.earnedLeave && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Exceeded by {(attendance.summary.earnedLeavesTaken - attendance.leaveBalance.earnedLeave).toFixed(1)} days</p>
                  )}
                  {attendance.summary.earnedLeavesTaken <= attendance.leaveBalance.earnedLeave && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">✓ {(attendance.leaveBalance.earnedLeave - attendance.summary.earnedLeavesTaken).toFixed(1)} days remaining</p>
                  )}
                </div>

                {/* Total Summary */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600">Casual Taken</p>
                      <p className="text-2xl font-bold text-blue-600">{attendance.summary.casualLeavesTaken.toFixed(1)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600">Earned Taken</p>
                      <p className="text-2xl font-bold text-green-600">{attendance.summary.earnedLeavesTaken.toFixed(1)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600">Total Taken</p>
                      <p className="text-2xl font-bold text-slate-900">{(attendance.summary.casualLeavesTaken + attendance.summary.earnedLeavesTaken).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Reason (for Quick Mark) */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Leave Reason {selectedDate && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter reason for leave (required for all leave types)..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    rows={3}
                    />
                  <p className="text-xs text-slate-500 mt-2">
                    💡 This reason will be recorded permanently for future references
                  </p>
                  {selectedDate && !leaveReason.trim() && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Leave reason is required before marking attendance
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Holiday Marking Modal */}
        {showHolidayModal && selectedHolidayDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-pink-600" />
                  Mark Holiday
                </h3>
                <button
                  onClick={() => {
                    setShowHolidayModal(false);
                    setSelectedHolidayDate(null);
                    setHolidayName('');
                  }}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Information Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    ℹ️ <strong>Important:</strong> This holiday will be marked on all employee calendars company-wide and will synchronize across the system.
                  </p>
                </div>

                {/* Date Display */}
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">Selected Date</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedHolidayDate.toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Holiday Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Holiday Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="e.g., Diwali, Holi, Christmas"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && holidayName.trim()) {
                        markHolidayOnCalendar();
                      }
                    }}
                  />
                </div>

                {/* System Sync Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-900">
                    ✓ This will be saved to the system and visible to all users
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowHolidayModal(false);
                      setSelectedHolidayDate(null);
                      setHolidayName('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={markHolidayOnCalendar}
                    disabled={!holidayName.trim() || markingHoliday}
                    className="flex-1 px-4 py-2 bg-linear-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {markingHoliday ? 'Marking...' : 'Mark Holiday'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}