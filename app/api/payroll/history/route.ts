import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PayrollHistory from "@/models/PayrollHistory";

export async function GET(req: Request) {
  try {
    await connectDB();

    const history = await PayrollHistory.find()
      .sort({ year: -1, month: -1 })
      .limit(12);

    // Transform the data to match expected format
    const formattedHistory = history.map((record: any) => ({
      id: record._id.toString(),
      month: record.month,
      year: record.year,
      totalEmployees: record.totalEmployees || 1,
      totalNetSalary: record.netSalary || 0,
      totalGrossSalary: record.grossSalary || 0,
      status: record.salaryProcessed ? 'paid' : record.salaryHold ? 'on-hold' : 'draft'
    }));

    return NextResponse.json({
      success: true,
      history: formattedHistory
    });
  } catch (error) {
    console.error("GET /api/payroll/history error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}