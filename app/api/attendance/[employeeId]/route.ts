import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MonthlyAttendance from '@/models/Attendance';
import Employee from '@/models/Employee';

// ✅ GET: Fetch single employee attendance
export async function GET(
  request: Request,
  props: { params: Promise<{ employeeId: string }> }
) {
  try {
    await connectDB();
    const params = await props.params;
    const { employeeId } = params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    let attendance = await MonthlyAttendance.findOne({ employeeId, month, year });

   // Virtual attendance object if none exists in DB
    if (!attendance) {
      const monthStart = new Date(year, month, 1);
      
      attendance = {
        employeeId,
        month,
        year,
        records: [],
        summary: {
          totalPresent: 0, totalAbsent: 0, totalLeaves: 0, totalHalfDays: 0,
          casualLeavesTaken: 0, earnedLeavesTaken: 0, sickLeavesTaken: 0, extraordinaryLeavesTaken: 0
        },
        monthlyCredit: {
          casualLeave: 1,      // 1 CL per month
          earnedLeave: 1.25    // 1.25 EL per month
        },
        leaveBalance: {
          casualLeave: (employee.leaves?.casualLeave || 0) + 1,
          earnedLeave: (employee.leaves?.earnedLeave || 0) + 1.25,
          carriedForward: 0
        },
        lop: {
          days: 0,
          amount: 0
        }
      };
    }

    return NextResponse.json({ success: true, employee, attendance });

  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function PUT(
  request: Request,
  props: { params: Promise<{ employeeId: string }> }
) {
  try {
    await connectDB();
    const params = await props.params;
    const { employeeId } = params;

    const body = await request.json();
    const { month, year, date, status, leaveType, remarks, checkIn, checkOut, leaveReason } = body;

    let attendance = await MonthlyAttendance.findOne({ employeeId, month, year });

    if (!attendance) {
      const employee = await Employee.findById(employeeId);
      if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

      attendance = new MonthlyAttendance({
        employeeId,
        month,
        year,
        records: [],
        monthlyCredit: {
          casualLeave: 1,
          earnedLeave: 1.25
        },
        leaveBalance: {
          casualLeave: (employee.leaves?.casualLeave || 0) + 1,
          earnedLeave: (employee.leaves?.earnedLeave || 0) + 1.25,
          carriedForward: 0
        },
        lop: {
          days: 0,
          amount: 0
        }
      });
    }

    const targetDate = new Date(date);
    const dateString = targetDate.toDateString();

    const isStandardPresent = status === 'present' && 
      (!remarks || remarks.trim() === "") && 
      (!leaveReason || leaveReason.trim() === "");  // ✅ FIXED

    if (isStandardPresent) {
      attendance.records = attendance.records.filter(
        (r: any) => new Date(r.date).toDateString() !== dateString
      );
    } else {
      const existingIndex = attendance.records.findIndex(
        (r: any) => new Date(r.date).toDateString() === dateString
      );

      const newRecord = {
        date: targetDate,
        status,
        leaveType: leaveType || null,
        leaveReason: leaveReason || '',  // ✅ FIXED
        remarks: remarks || '',
        checkIn: checkIn || '',
        checkOut: checkOut || ''
      };

      if (existingIndex >= 0) {
        attendance.records[existingIndex] = newRecord;
      } else {
        attendance.records.push(newRecord);
      }
    }

    const summary = {
      totalPresent: 0, 
      totalAbsent: 0,
      totalLeaves: 0,
      totalHalfDays: 0,
      casualLeavesTaken: 0,
      earnedLeavesTaken: 0,
      sickLeavesTaken: 0,
      extraordinaryLeavesTaken: 0
    };

   attendance.records.forEach((record: any) => {
      if (record.status === 'onLeave') summary.totalAbsent++;
      
      if (record.status === 'leave') {
        summary.totalLeaves++;
        if (record.leaveType === 'casual') summary.casualLeavesTaken++;
        if (record.leaveType === 'earned') summary.earnedLeavesTaken++;
        if (record.leaveType === 'sick') summary.sickLeavesTaken++;
        if (record.leaveType === 'extraordinary') summary.extraordinaryLeavesTaken++;
      }
      
      if (record.status === 'halfDay') {
        summary.totalHalfDays++;
        summary.totalLeaves += 0.5; 
        if (record.leaveType === 'casual') summary.casualLeavesTaken += 0.5;
        if (record.leaveType === 'earned') summary.earnedLeavesTaken += 0.5;
      }
    });

    // ✅ NEW: Calculate LOP (Loss of Pay)
    const totalLeavesAllowed = 
      (attendance.monthlyCredit?.casualLeave || 1) + 
      (attendance.monthlyCredit?.earnedLeave || 1.25);  // Total: 2.25 per month

    const totalLeavesTaken = 
      summary.casualLeavesTaken + 
      summary.earnedLeavesTaken;

    const lopDays = Math.max(0, totalLeavesTaken - totalLeavesAllowed);

    // Update LOP in attendance
    attendance.lop = {
      days: lopDays,
      amount: 0  // Will be calculated in salary module: lopDays * (dailySalary)
    };

    attendance.summary = summary;
    
    // ✅ Update leave balance (subtract used leaves)
    attendance.leaveBalance = {
      casualLeave: (attendance.monthlyCredit?.casualLeave || 1) - summary.casualLeavesTaken,
      earnedLeave: (attendance.monthlyCredit?.earnedLeave || 1.25) - summary.earnedLeavesTaken,
      carriedForward: 0
    };
    
    await attendance.save();

    return NextResponse.json({ success: true, attendance });

  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
