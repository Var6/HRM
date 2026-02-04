import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";

/**
 * GET SINGLE EMPLOYEE
 * GET /api/employees/:id
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate id
    if (!id || id === 'undefined' || !id.match(/^[0-9a-f]{24}$/i)) {
      return NextResponse.json(
        { error: 'Invalid or missing employee ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("GET employee error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * UPDATE EMPLOYEE
 * PUT /api/employees/:id
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check for duplicate employee code (but allow if it's the same employee)
    const existingEmployee = await Employee.findOne({ 
      employeeCode: body.employeeCode,
      _id: { $ne: id } // Exclude current employee
    });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee code already exists. Please use a different code.' },
        { status: 409 }
      );
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("PUT employee error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE EMPLOYEE
 * DELETE /api/employees/:id
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE employee error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
