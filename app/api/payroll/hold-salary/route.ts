import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import PayrollHistory from "@/models/PayrollHistory";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { employeeCode, month, year, salaryHold, salaryHoldReason } = await req.json();

    const employee = await Employee.findOne({ employeeCode });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update or create payroll history with hold status
    await PayrollHistory.findOneAndUpdate(
      { employeeId: employee._id, month, year },
      {
        salaryHold,
        salaryHoldReason,
        salaryProcessed: false // Can't be processed while on hold
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error holding salary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}