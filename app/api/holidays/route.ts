import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Holiday from "@/models/Holiday";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let query: any = {};
    if (month && year) {
      query.month = Number(month);
      query.year = Number(year);
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });

    return NextResponse.json({
      success: true,
      holidays
    });
  } catch (error) {
    console.error("GET /api/holidays error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, date, description, createdBy } = await req.json();

    const holidayDate = new Date(date);
    const holiday = new Holiday({
      name,
      date: holidayDate,
      year: holidayDate.getFullYear(),
      month: holidayDate.getMonth(),
      day: holidayDate.getDate(),
      description,
      createdBy
    });

    await holiday.save();

    return NextResponse.json({
      success: true,
      holiday
    });
  } catch (error) {
    console.error("POST /api/holidays error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await Holiday.findByIdAndDelete(id);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("DELETE /api/holidays error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
