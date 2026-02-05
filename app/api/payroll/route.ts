import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";
import MonthlyAttendance from "@/models/Attendance";
import Holiday from "@/models/Holiday";
import { calculateLOP, calculateLOPAmount, getAttendanceSummary, getWorkingDaysInMonth } from "@/lib/attendance-utils";
import { CACHE_CONFIG } from "@/lib/optimization-config";

// Cache payroll data for 10 minutes (600 seconds)
export const revalidate = 600;

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    // Handle both number and string month parameters
    let monthIndex = 0;
    let year = new Date().getFullYear();
    
    if (monthParam) {
      monthIndex = isNaN(Number(monthParam)) ? 
        new Date(`${monthParam} 1, ${yearParam || new Date().getFullYear()}`).getMonth() : 
        Number(monthParam);
    }
    if (yearParam) {
      year = Number(yearParam);
    }

    console.log('Payroll API called with:', { monthParam, yearParam, monthIndex, year });

    // Get all holidays for this month
    const holidays = await Holiday.find({
      year,
      month: monthIndex
    }).lean();
    const holidayDates = holidays.map(h => new Date(h.date));

    const employees = await Employee.find({ 
      $or: [
        { status: { $exists: false } },
        { status: { $ne: 'inactive' } }
      ]
    }).sort({ createdAt: -1 }).lean();
    console.log('Found employees:', employees.length);

    const payrollData = await Promise.all(
      employees.map(async (emp) => {
        const earnings = emp.salary?.earnings || {};
        const deductions = emp.salary?.deductions || {};
        
        // Calculate total earnings (gross salary before any deductions)
        // Ensure all values are converted to numbers
        let grossSalary = Object.values(earnings).reduce((sum: number, val: any) => {
          const num = Number(val || 0);
          return sum + (isNaN(num) ? 0 : num);
        }, 0);
        
        // Get attendance to calculate LOP
        const attendance = await MonthlyAttendance.findOne({
          employeeId: emp._id,
          month: monthIndex,
          year
        }).lean();

        const workingDays = getWorkingDaysInMonth(monthIndex, year, holidayDates);
        const attendanceSummary = attendance
          ? getAttendanceSummary(attendance.records || [], monthIndex, year)
          : null;
        const presentDays = attendanceSummary ? attendanceSummary.totalPresent : workingDays;

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
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const history = await PayrollHistory.findOne({
          employeeId: emp._id,
          month: months[monthIndex],
          year
        });

        return {
          _id: emp._id.toString(),
          employeeId: {
            _id: emp._id.toString(),
            employeeCode: emp.employeeCode,
            employeeName: emp.name,
            designation: emp.designation,
            department: emp.department,
            branch: emp.branchName || 'Corporate Office',
            photograph: emp.photograph || null,
            hra: emp.salary?.earnings?.hra || 0,
            conveyance: emp.salary?.earnings?.conveyance || 0,
            pf: emp.salary?.deductions?.pf || 0,
            esic: emp.salary?.deductions?.esic || 0,
            uan: emp.uanNo || '',
            pfNumber: emp.pfNo || '',
            esiNumber: emp.esiNo || '',
            accountNumber: emp.bankAccountNo || '',
            ifsc: emp.bankIfsc || '',
            bankName: emp.bankName || ''
          },
          month: monthIndex,
          year,
          baseSalary: Number(emp.salary?.earnings?.basic || 0),
          allowances: Object.values(earnings).reduce((sum: number, val: any) => {
            const num = Number(val || 0);
            return sum + (isNaN(num) ? 0 : num);
          }, 0) - Number(emp.salary?.earnings?.basic || 0),
          deductions: Number(totalDeductions) || 0,
          netSalary: Number(netSalary) || 0,
          grossSalary: Number(grossSalary) || 0,
          presentDays,
          workingDays,
          earnings: {
            basic: Number(emp.salary?.earnings?.basic || 0),
            hra: Number(emp.salary?.earnings?.hra || 0),
            conveyance: Number(emp.salary?.earnings?.conveyance || 0),
            monthlyBonus: Number(emp.salary?.earnings?.monthlyBonus || 0),
            quarterlyBonus: Number(emp.salary?.earnings?.quarterlyBonus || 0),
            specialAllowance: Number(emp.salary?.earnings?.specialAllowance || 0)
          },
          deductionsBreakdown: {
            pf: Number(emp.salary?.deductions?.pf || 0),
            esic: Number(emp.salary?.deductions?.esic || 0),
            advance: Number(emp.salary?.deductions?.advance || emp.salary?.deductions?.salaryAdvance || 0),
            loan: Number(emp.salary?.deductions?.loan || 0),
            tds: Number(emp.salary?.deductions?.tds || 0),
            lop: Number(lopAmount) || 0
          },
          salaryProcessed: history?.salaryProcessed ?? emp.salary?.salaryProcessed ?? false,
          salaryHold: history?.salaryHold ?? emp.salary?.salaryHold ?? false,
          salaryHoldReason: history?.salaryHoldReason ?? emp.salary?.salaryHoldReason ?? '',
          bankAccount: emp.bankAccountNo || '',
          createdAt: new Date()
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: payrollData,
      month: monthIndex,
      year
    }, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_CONFIG.PAYROLL_CACHE_TIME}`,
      }
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