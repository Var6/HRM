import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";
import MonthlyAttendance from "@/models/Attendance";
import { calculateLOP, calculateLOPAmount, getWorkingDaysInMonth } from "@/lib/attendance-utils";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = Number(searchParams.get('year'));
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

    const employees = await Employee.find().sort({ createdAt: -1 });

    const payrollData = await Promise.all(
      employees.map(async (emp) => {
        const earnings = emp.salary?.earnings || {};
        const deductions = emp.salary?.deductions || {};
        
        let grossSalary = Object.values(earnings).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
        
        // ✅ Get attendance to calculate LOP
        const attendance = await MonthlyAttendance.findOne({
          employeeId: emp._id,
          month: monthIndex,
          year
        });

        let lopDays = 0;
        let lopAmount = 0;

        if (attendance) {
          // Calculate LOP
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

        // ✅ Deduct LOP from gross salary BEFORE other deductions
        const adjustedGrossSalary = grossSalary - lopAmount;
        
        // Now calculate other deductions
        let totalDeductions = Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
        
        // Add LOP to total deductions for display purposes
        totalDeductions += lopAmount;

        // Get history for this month
        const history = await PayrollHistory.findOne({
          employeeId: emp._id,
          month,
          year
        });

        return {
          employeeId: emp._id.toString(),
          employeeName: emp.name,
          employeeCode: emp.employeeCode,
          designation: emp.designation,
          department: emp.department,
          branch: emp.branchName || 'Corporate Office',
          photograph: emp.photograph || null,
          earnings,
          deductions: {
            ...deductions,
            lop: lopAmount // Add LOP to deductions
          },
          grossSalary: adjustedGrossSalary, // Adjusted gross after LOP
          originalGrossSalary: grossSalary, // Original gross before LOP
          lopDays,
          lopAmount,
          totalDeductions,
          netSalary: adjustedGrossSalary - (totalDeductions - lopAmount), // Net = Adjusted Gross - Standard Deductions
          bankAccount: emp.bankAccountNo || 'N/A',
          pfNumber: emp.pfNo || 'N/A',
          uanNumber: emp.uanNo || 'N/A',
          esiNumber: emp.esiNo || 'N/A',
          salaryProcessed: history?.salaryProcessed || false,
          salaryHold: history?.salaryHold || false,
          salaryHoldReason: history?.salaryHoldReason || null,
          workingDays: getWorkingDaysInMonth(monthIndex, year),
          presentDays: attendance ? 
            getWorkingDaysInMonth(monthIndex, year) - (attendance.summary?.totalAbsent || 0) : 
            getWorkingDaysInMonth(monthIndex, year)
        };
      })
    );

    return NextResponse.json({
      success: true,
      payrollData,
      month,
      year
    });
  } catch (error) {
    console.error("GET /api/payroll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { employeeCode, month, year, salaryProcessed } = await req.json();
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

    const employee = await Employee.findOne({ employeeCode });
    
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Get attendance to calculate LOP
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

    // Adjust gross salary by deducting LOP
    const adjustedGrossSalary = grossSalary - lopAmount;
    
    // Calculate standard deductions
    let standardDeductions = Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    
    // Total deductions include standard + LOP
    const totalDeductions = standardDeductions + lopAmount;
    
    // Net salary = Adjusted Gross - Standard Deductions
    const netSalary = adjustedGrossSalary - standardDeductions;

    // Update or create payroll history
    await PayrollHistory.findOneAndUpdate(
      { employeeId: employee._id, month, year },
      {
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
        salaryProcessed,
        processedDate: salaryProcessed ? new Date() : null,
        workingDays: getWorkingDaysInMonth(monthIndex, year),
        presentDays: attendance ? 
          getWorkingDaysInMonth(monthIndex, year) - (attendance.summary?.totalAbsent || 0) : 
          getWorkingDaysInMonth(monthIndex, year)
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing payroll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}