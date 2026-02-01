import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { employeeCode, month, year, salaryProcessed } = await req.json();

    const employee = await Employee.findOne({ employeeCode });
    
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update or create payroll history
    const earnings = employee.salary?.earnings || {};
    const deductions = employee.salary?.deductions || {};
    
    const grossSalary = Object.values(earnings).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0);

    await PayrollHistory.findOneAndUpdate(
      { employeeId: employee._id, month, year },
      {
        grossSalary,
        totalDeductions,
        netSalary: grossSalary - totalDeductions,
        earnings,
        deductions,
        salaryProcessed,
        processedDate: salaryProcessed ? new Date() : null
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}