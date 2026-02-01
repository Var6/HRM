import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PayrollHistory from "@/models/PayrollHistory";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    await connectDB();

    const history = await PayrollHistory.find({ employeeId })
      .sort({ year: -1, month: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error("GET /api/payroll/employee/[employeeId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}