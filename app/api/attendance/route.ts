import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MonthlyAttendance from '@/models/Attendance';
import Employee from '@/models/Employee';
import { calculateLOP, calculateLOPAmount, getWorkingDaysInMonth } from '@/lib/attendance-utils';
import { CACHE_CONFIG } from '@/lib/optimization-config';

// Cache attendance data for 15 minutes (900 seconds)
export const revalidate = 900;

// ✅ GET: Fetch ALL employees attendance for a specific month/year
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Fetch all active employees with lean query
    const employees = await Employee.find({ 
      $or: [
        { status: { $exists: false } },
        { status: { $ne: 'inactive' } }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Fetch or create attendance records for all employees
    const data = await Promise.all(
      employees.map(async (employee) => {
        let attendance = await MonthlyAttendance.findOne({ 
          employeeId: employee._id, 
          month, 
          year 
        }).lean();

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
          employee: employee,
          attendance
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data,
      month,
      year
    }, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_CONFIG.ATTENDANCE_CACHE_TIME}`,
      }
    });

  } catch (error: any) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ This should be in [employeeId] route, not here
// PUT handler removed - see /api/attendance/[employeeId]/route.ts instead