import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const employee = await Employee.findById(params.id);

  if (!employee) {
    return NextResponse.json(
      { error: "Employee not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, employee });
}

export async function PUT(req: Request, { params }: any) {
  await connectDB();
  const body = await req.json();
  const emp = await Employee.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(emp);
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();
  await Employee.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
