import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import MonthlyAttendance from '@/models/Attendance';
import { getWorkingDaysInMonth } from '@/lib/attendance-utils';

/**
 * GET Salary Register Report
 * Monthly salary register for all employees
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toLocaleString('default', { month: 'long' });
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const employees = await Employee.find({ status: { $ne: 'inactive' } }).lean();

    const salaryRegister = await Promise.all(
      employees.map(async (emp: any) => {
        const attendance = await MonthlyAttendance.findOne({
          employeeId: emp._id,
          month: monthIndex + 1,
          year,
        }).lean();

        const presentDays = attendance?.presentDays || 0;
        const workingDays = getWorkingDaysInMonth(monthIndex, year);
        
        // Simple LOP calculation: based on present days vs working days
        const absenceDays = Math.max(0, workingDays - presentDays);
        const lopDays = Math.max(0, absenceDays - 2); // Allow 2 days absence
        
        const basic = emp.salary?.earnings?.basic || 0;
        const dailyRate = basic / workingDays;
        const lopAmount = lopDays * dailyRate;

        const earnings = emp.salary?.earnings || {};
        const deductions = emp.salary?.deductions || {};

        const hra = earnings.hra || 0;
        const conveyance = earnings.conveyance || 0;
        const monthlyBonus = earnings.monthlyBonus || 0;

        const grossSalary = basic + hra + conveyance + monthlyBonus;
        const pf = deductions.pf || 0;
        const esic = deductions.esic || 0;
        const tds = deductions.tds || 0;

        const totalDeductions = pf + esic + tds + lopAmount;
        const netSalary = grossSalary - totalDeductions;

        return {
          employeeCode: emp.employeeCode,
          employeeName: emp.name,
          designation: emp.designation,
          department: emp.department,
          basic,
          hra,
          conveyance,
          monthlyBonus,
          grossSalary,
          pf,
          esic,
          tds,
          lopAmount,
          totalDeductions,
          netSalary,
          bankAccount: emp.bankAccount,
          presentDays,
          workingDays,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: salaryRegister, month, year },
      { headers: { 'Cache-Control': 'public, max-age=600' } }
    );
  } catch (error) {
    console.error('Salary Register Report Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate salary register' },
      { status: 500 }
    );
  }
}
