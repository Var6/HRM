import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MonthlyAttendance from '@/models/Attendance';
import Employee from '@/models/Employee';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Get all employees
    const employees = await Employee.find({ status: 'Active' });

    // Get attendance for all employees
    const attendanceData = await Promise.all(
      employees.map(async (employee) => {
        let attendance = await MonthlyAttendance.findOne({
          employeeId: employee._id,
          month,
          year
        });

        if (!attendance) {
          // Create empty attendance record
          attendance = await MonthlyAttendance.create({
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
            leaveBalance: {
              casualLeave: employee.leaves.casualLeave,
              earnedLeave: employee.leaves.earnedLeave,
              carriedForward: 0
            }
          });
        }

        return {
          employee: {
            _id: employee._id,
            name: employee.name,
            employeeCode: employee.employeeCode,
            designation: employee.designation,
            department: employee.department,
            photograph: employee.photograph
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