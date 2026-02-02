import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";
import MonthlyAttendance from "@/models/Attendance";
import Holiday from "@/models/Holiday";
import { calculateLOP, calculateLOPAmount, getWorkingDaysInMonth } from "@/lib/attendance-utils";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = Number(searchParams.get('year'));
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

    // Get all holidays for this month
    const holidays = await Holiday.find({
      year,
      month: monthIndex
    });
    const holidayDates = holidays.map(h => new Date(h.date));

    const employees = await Employee.find({ status: { $ne: 'inactive' } }).sort({ createdAt: -1 });

    const payrollData = await Promise.all(
      employees.map(async (emp) => {
        const earnings = emp.salary?.earnings || {};
        const deductions = emp.salary?.deductions || {};
        
        // Calculate total earnings (gross salary before any deductions)
        let grossSalary = Object.values(earnings).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
        
        // Get attendance to calculate LOP
        const attendance = await MonthlyAttendance.findOne({
          employeeId: emp._id,
          month: monthIndex,
          year
        });

        let lopDays = 0;
        let lopAmount = 0;
        let absentDays = 0;

        if (attendance) {
          // Count actual absent days
          absentDays = attendance.records.filter((r: any) => 
            r.status === 'onLeave' || r.status === 'absent'
          ).length;
          
          // Calculate LOP: if absent > 2.25 days, deduct for excess
          lopDays = calculateLOP(
            attendance.records,
            monthIndex,
            year,
            attendance.summary?.casualLeavesTaken || 0,
            attendance.summary?.earnedLeavesTaken || 0,
            attendance.monthlyCredit || { casualLeave: 1, earnedLeave: 1.25 },
            holidayDates
          );

          lopAmount = calculateLOPAmount(grossSalary, lopDays, monthIndex, year, holidayDates);
        }

        // Calculate standard deductions (all except LOP and manual)
        let standardDeductions = 0;
        const standardDeductionsObj: any = {};
        
        Object.entries(deductions).forEach(([key, val]) => {
          if (key !== 'lop') {
            const amount = Number(val || 0);
            standardDeductions += amount;
            standardDeductionsObj[key] = amount;
          }
        });
        
        // Total deductions = standard deductions + LOP
        const totalDeductions = standardDeductions + lopAmount;
        
        // Net salary = Gross Salary - All Deductions
        const netSalary = grossSalary - totalDeductions;

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
            ...standardDeductionsObj,
            lop: lopAmount
          },
          grossSalary,
          lopDays,
          lopAmount,
          absentDays,
          standardDeductions,
          totalDeductions,
          netSalary,
          bankAccount: emp.bankAccountNo || 'N/A',
          pfNumber: emp.pfNo || 'N/A',
          uanNumber: emp.uanNo || 'N/A',
          esiNumber: emp.esiNo || 'N/A',
          salaryProcessed: history?.salaryProcessed || false,
          salaryHold: history?.salaryHold || false,
          salaryHoldReason: history?.salaryHoldReason || null,
          workingDays: getWorkingDaysInMonth(monthIndex, year, holidayDates),
          presentDays: attendance ? 
            getWorkingDaysInMonth(monthIndex, year, holidayDates) - (attendance.summary?.totalAbsent || 0) : 
            getWorkingDaysInMonth(monthIndex, year, holidayDates),
          fatherName: emp.fatherName || 'N/A',
          panNumber: emp.panCardNo || 'N/A',
          dateOfJoining: emp.dateOfJoining || 'N/A',
          aadharNumber: emp.aadharCardNo || 'N/A'
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
    const { employeeCode, month, year, salaryProcessed, manualDeductions } = await req.json();
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

    const employee = await Employee.findOne({ employeeCode });
    
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Get holidays
    const holidays = await Holiday.find({
      year,
      month: monthIndex
    });
    const holidayDates = holidays.map(h => new Date(h.date));

    // Get attendance to calculate LOP
    const attendance = await MonthlyAttendance.findOne({
      employeeId: employee._id,
      month: monthIndex,
      year
    });

    const earnings = employee.salary?.earnings || {};
    const deductions = employee.salary?.deductions || {};
    
    // Calculate gross salary
    let grossSalary = Object.values(earnings).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    
    let lopDays = 0;
    let lopAmount = 0;
    let absentDays = 0;

    if (attendance) {
      absentDays = attendance.records.filter((r: any) => 
        r.status === 'onLeave' || r.status === 'absent'
      ).length;

      lopDays = calculateLOP(
        attendance.records,
        monthIndex,
        year,
        attendance.summary?.casualLeavesTaken || 0,
        attendance.summary?.earnedLeavesTaken || 0,
        attendance.monthlyCredit || { casualLeave: 1, earnedLeave: 1.25 },
        holidayDates
      );

      lopAmount = calculateLOPAmount(grossSalary, lopDays, monthIndex, year, holidayDates);
    }

    // Calculate standard deductions
    let standardDeductions = 0;
    const standardDeductionsObj: any = {};
    
    Object.entries(deductions).forEach(([key, val]) => {
      if (key !== 'lop') {
        const amount = Number(val || 0);
        standardDeductions += amount;
        standardDeductionsObj[key] = amount;
      }
    });
    
    // Calculate total manual deductions
    let totalManualDeductions = 0;
    if (manualDeductions && Array.isArray(manualDeductions)) {
      totalManualDeductions = manualDeductions.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
    }
    
    // Total deductions = standard + LOP + manual
    const totalDeductions = standardDeductions + lopAmount + totalManualDeductions;
    
    // Net salary = Gross Salary - All Deductions
    const netSalary = grossSalary - totalDeductions;

    // Update or create payroll history
    await PayrollHistory.findOneAndUpdate(
      { employeeId: employee._id, month, year },
      {
        salarySnapshot: earnings,
        grossSalary,
        totalDeductions,
        netSalary,
        earnings,
        deductions: {
          ...standardDeductionsObj,
          lop: lopAmount,
          manualDeduction: totalManualDeductions
        },
        lopDays,
        lopAmount,
        absent: absentDays,
        manualDeductions: manualDeductions || [],
        totalManualDeductions,
        salaryProcessed,
        processedDate: salaryProcessed ? new Date() : null
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing payroll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}