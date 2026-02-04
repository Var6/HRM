
// API Route: /api/performance/[employeeId]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Performance from "@/models/Performance";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    // Validate employeeId
    if (!employeeId || employeeId === 'undefined' || !employeeId.match(/^[0-9a-f]{24}$/i)) {
      return NextResponse.json(
        { error: 'Invalid or missing employee ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const records = await Performance.find({ employeeId })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      records
    });
  } catch (error) {
    console.error("GET /api/performance/[employeeId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
