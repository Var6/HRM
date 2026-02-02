import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";
import MonthlyAttendance from "@/models/Attendance";
import { calculateLOP, calculateLOPAmount, getWorkingDaysInMonth } from "@/lib/attendance-utils";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { employeeCode, month, year, salaryHold, salaryHoldReason } = await req.json();
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

    const employee = await Employee.findOne({ employeeCode });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Get attendance to calculate LOP (even for held salary, we track LOP)
    const attendance = await MonthlyAttendance.findOne({
      employeeId: employee._id,
      month: monthIndex,
      year
    });

    const earnings = employee.salary?.earnings || {};
    const deductions = employee.salary?.deductions || {};
    
    let grossSalary = Object.values(earnings).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    
    let lopDays = 0;
    let lopAmount = 0;

    if (attendance) {
      lopDays = calculateLOP(
        attendance.records,
        monthIndex,
        year,
        attendance.summary?.casualLeavesTaken || 0,
        attendance.summary?.earnedLeavesTaken || 0,
        attendance.monthlyCredit || { casualLeave: 1, earnedLeave: 1.25 }
      );

      lopAmount = calculateLOPAmount(grossSalary, lopDays, monthIndex, year);
    }

    const adjustedGrossSalary = grossSalary - lopAmount;
    let standardDeductions = Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    const totalDeductions = standardDeductions + lopAmount;
    const netSalary = adjustedGrossSalary - standardDeductions;

    // Update or create payroll history with hold status
    await PayrollHistory.findOneAndUpdate(
      { employeeId: employee._id, month, year },
      {
        salaryHold,
        salaryHoldReason,
        salaryProcessed: false, // Can't be processed while on hold
        grossSalary: adjustedGrossSalary,
        originalGrossSalary: grossSalary,
        totalDeductions,
        netSalary,
        earnings,
        deductions: {
          ...deductions,
          lop: lopAmount
        },
        lopDays,
        lopAmount,
        workingDays: getWorkingDaysInMonth(monthIndex, year),
        presentDays: attendance ? 
          getWorkingDaysInMonth(monthIndex, year) - (attendance.summary?.totalAbsent || 0) : 
          getWorkingDaysInMonth(monthIndex, year)
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error holding salary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}