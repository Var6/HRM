import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import MonthlyAttendance from '@/models/Attendance';
import Employee from '@/models/Employee';

export async function GET(
  request: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    await connectDB();
    const { employeeId } = params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get or create attendance record
    let attendance = await MonthlyAttendance.findOne({
      employeeId,
      month,
      year
    });

    if (!attendance) {
      // Calculate leave balance based on joining date and months completed
      const joiningDate = new Date(employee.dateOfJoining);
      const currentDate = new Date(year, month, 1);
      const monthsCompleted = Math.floor(
        (currentDate.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // CL: 1 per month (max 12), EL: 1.25 per month (max 15)
      const casualLeaveEarned = Math.min(monthsCompleted, 12);
      const earnedLeaveEarned = Math.min(monthsCompleted * 1.25, 15);

      attendance = await MonthlyAttendance.create({
        employeeId,
        month,
        year,
        records: [],
        summary: {
          totalPresent: 0,
          totalAbsent: 0,
          totalLeaves: 0,
          totalHalfDays: 0,
          casualLeavesTaken: 0,
          earnedLeavesTaken: 0,
          sickLeavesTaken: 0,
          extraordinaryLeavesTaken: 0
        },
        leaveBalance: {
          casualLeave: casualLeaveEarned,
          earnedLeave: earnedLeaveEarned,
          carriedForward: 0
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      employee,
      attendance 
    });

  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    await connectDB();
    const { employeeId } = params;
    const body = await request.json();
    const { month, year, date, status, leaveType, checkIn, checkOut, remarks } = body;

    let attendance = await MonthlyAttendance.findOne({
      employeeId,
      month,
      year
    });

    if (!attendance) {
      const employee = await Employee.findById(employeeId);
      attendance = new MonthlyAttendance({
        employeeId,
        month,
        year,
        records: [],
        leaveBalance: {
          casualLeave: employee.leaves.casualLeave,
          earnedLeave: employee.leaves.earnedLeave,
          carriedForward: 0
        }
      });
    }

    // Find existing record for this date
    const recordDate = new Date(date);
    const existingRecordIndex = attendance.records.findIndex(
      (r: any) => new Date(r.date).toDateString() === recordDate.toDateString()
    );

    const newRecord = {
      date: recordDate,
      status,
      leaveType: leaveType || null,
      checkIn,
      checkOut,
      remarks
    };

    if (existingRecordIndex >= 0) {
      // Update existing record
      attendance.records[existingRecordIndex] = newRecord;
    } else {
      // Add new record
      attendance.records.push(newRecord);
    }

    // Recalculate summary
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
      switch (record.status) {
        case 'present':
          summary.totalPresent++;
          break;
        case 'absent':
          summary.totalAbsent++;
          break;
        case 'leave':
          summary.totalLeaves++;
          if (record.leaveType === 'casual') summary.casualLeavesTaken++;
          else if (record.leaveType === 'earned') summary.earnedLeavesTaken++;
          else if (record.leaveType === 'sick') summary.sickLeavesTaken++;
          else if (record.leaveType === 'extraordinary') summary.extraordinaryLeavesTaken++;
          break;
        case 'halfDay':
          summary.totalHalfDays++;
          if (record.leaveType === 'casual') summary.casualLeavesTaken += 0.5;
          else if (record.leaveType === 'earned') summary.earnedLeavesTaken += 0.5;
          else if (record.leaveType === 'sick') summary.sickLeavesTaken += 0.5;
          break;
      }
    });

    attendance.summary = summary;
    await attendance.save();

    return NextResponse.json({ success: true, attendance });

  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}