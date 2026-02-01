
// API Route: /api/increments/[employeeId]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Increment from "@/models/Increment";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    await connectDB();

    const increments = await Increment.find({ employeeId })
      .sort({ effectiveFrom: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      increments
    });
  } catch (error) {
    console.error("GET /api/increments/[employeeId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
