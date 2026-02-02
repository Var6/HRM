import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PayrollHistory from "@/models/PayrollHistory";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { employeeId, month, year, manualDeductions } = await req.json();

    // Calculate total manual deductions
    let totalManualDeductions = 0;
    if (manualDeductions && Array.isArray(manualDeductions)) {
      totalManualDeductions = manualDeductions.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
    }

    // Get existing payroll record
    const payroll = await PayrollHistory.findOne({
      employeeId,
      month,
      year
    });

    if (!payroll) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    // Calculate new total deductions
    const totalDeductions = (payroll.deductions?.pf || 0) + 
                           (payroll.deductions?.esic || 0) + 
                           (payroll.deductions?.tds || 0) + 
                           (payroll.deductions?.salaryAdvance || 0) + 
                           (payroll.deductions?.loan || 0) + 
                           (payroll.lopAmount || 0) + 
                           totalManualDeductions;

    // Calculate new net salary
    const netSalary = payroll.grossSalary - totalDeductions;

    // Update payroll history
    await PayrollHistory.findByIdAndUpdate(
      payroll._id,
      {
        manualDeductions: manualDeductions || [],
        totalManualDeductions,
        deductions: {
          ...payroll.deductions,
          manualDeduction: totalManualDeductions
        },
        totalDeductions,
        netSalary
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      totalDeductions,
      netSalary
    });
  } catch (error) {
    console.error("PUT /api/payroll/manual-deductions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
