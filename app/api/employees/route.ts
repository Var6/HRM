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
      data: employees,
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

    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      'name', 'dateOfBirth', 'fatherName', 'motherName', 'maritalStatus',
      'educationQualification', 'permanentAddress', 'correspondenceAddress',
      'EcontactNo', 'mobileNumber', 'email', 'employeeCode', 'dateOfJoining',
      'department', 'designation', 'branchName', 'modeOfPayment'
    ];

    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone numbers (Indian format - 10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(body.mobileNumber?.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Mobile number must be a valid 10-digit number starting with 6-9' },
        { status: 400 }
      );
    }
    if (!phoneRegex.test(body.EcontactNo?.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Emergency contact must be a valid 10-digit number starting with 6-9' },
        { status: 400 }
      );
    }

    // Check for duplicate employee code
    const existingEmployee = await Employee.findOne({ employeeCode: body.employeeCode });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee code already exists. Please use a different code.' },
        { status: 409 }
      );
    }

    // Initialize salary structure if not provided
    if (!body.salary) {
      body.salary = {
        earnings: {
          basic: 0,
          hra: 0,
          conveyance: 0,
          specialAllowance: 0,
          monthlyBonus: 0,
          quarterlyBonus: 0
        },
        deductions: {
          pf: 0,
          esic: 0,
          advance: 0,
          salaryAdvance: 0,
          loan: 0,
          tds: 0,
          lop: 0
        },
        salaryProcessed: false,
        salaryHold: false
      };
    }

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
