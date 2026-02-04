import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { employeeCode, password } = await request.json();

    // Validate input
    if (!employeeCode || !password) {
      return NextResponse.json(
        { success: false, message: 'Employee code and password are required' },
        { status: 400 }
      );
    }

    // Find employee by employee code
    const employee = await Employee.findOne({ 
      employeeCode,
      $or: [{ status: { $exists: false } }, { status: { $ne: 'inactive' } }]
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Invalid employee code or password' },
        { status: 401 }
      );
    }

    // Verify password (mobile number)
    if (password !== employee.mobileNumber) {
      return NextResponse.json(
        { success: false, message: 'Invalid employee code or password' },
        { status: 401 }
      );
    }

    // Create employee session data (exclude sensitive info)
    const employeeData = {
      _id: employee._id.toString(),
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      mobileNumber: employee.mobileNumber
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        employee: employeeData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Employee login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
