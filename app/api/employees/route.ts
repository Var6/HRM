import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    // 1. Connect DB
    await connectDB();

    // 2. Read form data
    const formData = await req.formData();

    // 3. Read and validate JSON payload
    const raw = formData.get("data");
    if (!raw) {
      return NextResponse.json(
        { error: "Employee data missing" },
        { status: 400 }
      );
    }

    let employeeData: any;
    try {
      employeeData = JSON.parse(raw as string);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON data" },
        { status: 400 }
      );
    }

    // 4. Handle photo upload (optional)
    const file = formData.get("photo") as File | null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadRes: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "hrm/employees" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      employeeData.photograph = uploadRes.secure_url;
    }

    // 5. Save employee
    const employee = await Employee.create(employeeData);

    // 6. Always return JSON
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
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID missing" },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, employee },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
