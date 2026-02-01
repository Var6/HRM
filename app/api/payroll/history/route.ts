import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PayrollHistory from "@/models/PayrollHistory";

export async function GET() {
  try {
    await connectDB();
    const history = await PayrollHistory.find()
      .sort({ year: -1, processedDate: -1 })
      .limit(12)
      .lean();
    
    // Transform the data to ensure 'id' field exists
    const transformedHistory = history.map(record => ({
      id: record._id.toString(),
      month: record.month,
      year: record.year,
      processedDate: record.processedDate,
      totalEmployees: record.totalEmployees,
      totalGrossSalary: record.totalGrossSalary,
      totalDeductions: record.totalDeductions,
      totalNetSalary: record.totalNetSalary,
      status: record.status,
      approvedBy: record.approvedBy,
      paidDate: record.paidDate
    }));
    
    return NextResponse.json({
      success: true,
      history: transformedHistory
    });
  } catch (error) {
    console.error("GET /api/payroll/history error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const record = await PayrollHistory.create(body);
    
    return NextResponse.json(
      { success: true, record: {
        id: record._id.toString(),
        ...record.toObject()
      }},
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/payroll/history error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}