import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MonthlyAttendance from '@/models/Attendance';
import Employee from '@/models/Employee';
import { calculateLOP, calculateLOPAmount, getWorkingDaysInMonth } from '@/lib/attendance-utils';

// ✅ GET: Fetch ALL employees attendance for a specific month/year
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Fetch all active employees
    const employees = await Employee.find({ status: { $ne: 'inactive' } }).sort({ createdAt: -1 });

    // Fetch or create attendance records for all employees
    const data = await Promise.all(
      employees.map(async (employee) => {
        let attendance = await MonthlyAttendance.findOne({ 
          employeeId: employee._id, 
          month, 
          year 
        });

        // Virtual attendance object if none exists in DB
        if (!attendance) {
          attendance = {
            employeeId: employee._id,
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

        return {
          employee: employee.toObject(),
          attendance
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data,
      month,
      year
    });

  } catch (error: any) {
    console.error('Error fetching attendance data:', error);
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

    // ✅ FIXED: Use findOneAndUpdate with upsert to avoid version conflicts
    const targetDate = new Date(date);
    const dateString = targetDate.toDateString();

    const isStandardPresent = status === 'present' && 
      (!remarks || remarks.trim() === "") && 
      (!leaveReason || leaveReason.trim() === "");

    let updateOperation;

    if (isStandardPresent) {
      // Remove the record for this date
      updateOperation = {
        $pull: {
          records: {
            date: {
              $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            }
          }
        }
      };
    } else {
      // First remove any existing record for this date, then add new one
      await MonthlyAttendance.findOneAndUpdate(
        { employeeId, month, year },
        {
          $pull: {
            records: {
              date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
              }
            }
          }
        }
      );

      updateOperation = {
        $push: {
          records: {
            date: targetDate,
            status,
            leaveType: leaveType || null,
            leaveReason: leaveReason || '',
            remarks: remarks || '',
            checkIn: checkIn || '',
            checkOut: checkOut || ''
          }
        }
      };
    }

    // Get employee for initial setup
    const employee = await Employee.findById(employeeId);
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    // ✅ Use findOneAndUpdate with upsert
    let attendance = await MonthlyAttendance.findOneAndUpdate(
      { employeeId, month, year },
      updateOperation,
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    // If just created, set initial values
    if (!attendance.monthlyCredit) {
      attendance.monthlyCredit = {
        casualLeave: 1,
        earnedLeave: 1.25
      };
      attendance.leaveBalance = {
        casualLeave: (employee.leaves?.casualLeave || 0) + 1,
        earnedLeave: (employee.leaves?.earnedLeave || 0) + 1.25,
        carriedForward: 0
      };
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

    // ✅ Calculate LOP using utility function
    const lopDays = calculateLOP(
      attendance.records,
      month,
      year,
      summary.casualLeavesTaken,
      summary.earnedLeavesTaken,
      attendance.monthlyCredit
    );

    // Get gross salary for LOP amount calculation
    const grossSalary = Object.values(employee.salary.earnings).reduce(
      (sum: number, val: any) => sum + Number(val || 0), 0
    );

    const lopAmount = calculateLOPAmount(grossSalary, lopDays, month, year);

    attendance.lop = {
      days: lopDays,
      amount: lopAmount
    };

    attendance.summary = summary;
    
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