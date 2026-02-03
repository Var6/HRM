import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { CACHE_CONFIG } from "@/lib/optimization-config";

// Enable caching for 5 minutes (300 seconds)
export const revalidate = 300;

/**
 * GET ALL EMPLOYEES
 * GET /api/employees
 * Cached for better performance
 */
export async function GET() {
  try {
    await connectDB();

    const employees = await Employee.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      employees,
    }, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_CONFIG.EMPLOYEE_CACHE_TIME}`,
      }
    });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * CREATE EMPLOYEE
 * POST /api/employees
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json(); // 👈 JSON ONLY

    const employee = await Employee.create(body);

    return NextResponse.json(
      { success: true, employee },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
