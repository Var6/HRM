
// API Route: /api/increments/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Increment from "@/models/Increment";
import Employee from "@/models/Employee";

export async function GET(req: Request) {
  try {
    await connectDB();

    const increments = await Increment.find()
      .populate('employeeId', 'employeeCode employeeName designation department')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      increments
    });
  } catch (error) {
    console.error("GET /api/increments error:", error);
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
    
    // Create increment record
    const increment = await Increment.create(body);

    // Update employee salary
    const employee = await Employee.findById(body.employeeId);
    if (employee) {
      const ratio = body.newSalary / body.previousSalary;
      
      // Update all salary components proportionally
      const updatedEarnings = {
        basic: Math.round((employee.salary.earnings.basic || 0) * ratio),
        hra: Math.round((employee.salary.earnings.hra || 0) * ratio),
        conveyance: Math.round((employee.salary.earnings.conveyance || 0) * ratio),
        monthlyBonus: Math.round((employee.salary.earnings.monthlyBonus || 0) * ratio),
        quarterlyBonus: Math.round((employee.salary.earnings.quarterlyBonus || 0) * ratio),
        specialAllowance: Math.round((employee.salary.earnings.specialAllowance || 0) * ratio)
      };

      employee.salary.earnings = updatedEarnings;
      await employee.save();
    }

    return NextResponse.json(
      { success: true, increment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/increments error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}