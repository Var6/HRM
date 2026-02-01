import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const employees = await Employee.find().sort({ createdAt: -1 });
    
    const payrollData = employees.map(emp => {
      const earnings = emp.salary?.earnings || {};
      const deductions = emp.salary?.deductions || {};

      const grossSalary = (
        Number(earnings.basic || 0) +
        Number(earnings.hra || 0) +
        Number(earnings.conveyance || 0) +
        Number(earnings.monthlyBonus || 0) +
        Number(earnings.quarterlyBonus || 0) +
        Number(earnings.specialAllowance || 0)
      );

      const totalDeductions = (
        Number(deductions.pf || 0) +
        Number(deductions.esic || 0) +
        Number(deductions.lop || 0) +
        Number(deductions.salaryAdvance || 0) +
        Number(deductions.loan || 0) +
        Number(deductions.tds || 0)
      );

      const netSalary = grossSalary - totalDeductions;

      return {
        employeeId: emp._id.toString(),
        employeeName: emp.name,
        employeeCode: emp.employeeCode,
        designation: emp.designation,
        department: emp.department,
        branch: emp.branchName || 'Corporate Office',
        photograph: emp.photograph || null,
        earnings: {
          basic: Number(earnings.basic || 0),
          hra: Number(earnings.hra || 0),
          conveyance: Number(earnings.conveyance || 0),
          monthlyBonus: Number(earnings.monthlyBonus || 0),
          quarterlyBonus: Number(earnings.quarterlyBonus || 0),
          specialAllowance: Number(earnings.specialAllowance || 0)
        },
        deductions: {
          pf: Number(deductions.pf || 0),
          esic: Number(deductions.esic || 0),
          lop: Number(deductions.lop || 0),
          salaryAdvance: Number(deductions.salaryAdvance || 0),
          loan: Number(deductions.loan || 0),
          tds: Number(deductions.tds || 0)
        },
        grossSalary,
        totalDeductions,
        netSalary,
        bankAccount: emp.bankAccountNo || 'N/A',
        pfNumber: emp.pfNo || 'N/A',
        uanNumber: emp.uanNo || 'N/A',
        esiNumber: emp.esiNo || 'N/A',
        salaryProcessed: emp.salaryProcessed || false,
        salaryHold: emp.salaryHold || false,
        salaryHoldReason: emp.salaryHoldReason || null
      };
    });

    return NextResponse.json({
      success: true,
      payrollData,
      month,
      year
    });
  } catch (error) {
    console.error("GET /api/payroll error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}