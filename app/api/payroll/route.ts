import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = Number(searchParams.get('year'));

    const employees = await Employee.find().sort({ createdAt: -1 });

    const payrollData = await Promise.all(
      employees.map(async (emp) => {
        const earnings = emp.salary?.earnings || {};
        const deductions = emp.salary?.deductions || {};

        const grossSalary = Object.values(earnings).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
        const totalDeductions = Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0);

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
          deductions,
          grossSalary,
          totalDeductions,
          netSalary: grossSalary - totalDeductions,
          bankAccount: emp.bankAccountNo || 'N/A',
          pfNumber: emp.pfNo || 'N/A',
          uanNumber: emp.uanNo || 'N/A',
          esiNumber: emp.esiNo || 'N/A',
          salaryProcessed: history?.salaryProcessed || false,
          salaryHold: history?.salaryHold || false,
          salaryHoldReason: history?.salaryHoldReason || null
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