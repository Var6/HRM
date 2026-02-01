import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MonthlyAttendance from '@/models/Attendance';
import Employee from '@/models/Employee';

// Force dynamic to ensure it fetches fresh data every time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const employees = await Employee.find({}).sort({ name: 1 });
    
    if (!employees || employees.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const attendanceData = await Promise.all(
      employees.map(async (employee) => {
        let attendance = await MonthlyAttendance.findOne({
          employeeId: employee._id,
          month,
          year
        });

        // ✅ IMPROVED: Credit monthly leaves on first fetch
        if (!attendance) {
          const monthStart = new Date(year, month, 1);
          const employeeJoinDate = new Date(employee.joiningDate);
          
          // Only credit if employee joined before this month
          const shouldCredit = employeeJoinDate <= monthStart;
          
          attendance = {
            employeeId: employee._id,
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
            monthlyCredit: {
              casualLeave: shouldCredit ? 1 : 0,
              earnedLeave: shouldCredit ? 1.25 : 0
            },
            leaveBalance: {
              casualLeave: (employee.leaves?.casualLeave || 0) + (shouldCredit ? 1 : 0),
              earnedLeave: (employee.leaves?.earnedLeave || 0) + (shouldCredit ? 1.25 : 0),
              carriedForward: 0
            },
            lop: {
              days: 0,
              amount: 0
            }
          };
        }

        return {
          employee: {
            _id: employee._id,
            name: employee.name,
            employeeCode: employee.employeeCode,
            designation: employee.designation,
            department: employee.department,
            photograph: employee.photograph,
            leaves: employee.leaves,
            leaveBalance: attendance.leaveBalance
          },
          attendance
        };
      })
    );

    return NextResponse.json({ success: true, data: attendanceData });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

