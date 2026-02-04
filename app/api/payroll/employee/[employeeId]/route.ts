import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PayrollHistory from "@/models/PayrollHistory";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    // Validate employeeId
    if (!employeeId || employeeId === 'undefined' || !employeeId.match(/^[0-9a-f]{24}$/i)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing employee ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch all payroll history for this employee
    const history = await PayrollHistory.find({ employeeId })
      .sort({ year: -1, month: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      history: history || []
    });
  } catch (error) {
    console.error("GET /api/payroll/employee/[employeeId] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
