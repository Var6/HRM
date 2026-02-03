
// API Route: /api/performance/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Performance from "@/models/Performance";
import Employee from "@/models/Employee";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Fetch all performance reviews and populate employee data
    const reviews = await Performance.find({})
      .populate('employeeId', 'employeeCode employeeName designation department branch photograph')
      .sort({ date: -1 })
      .lean();

    // Filter by month and year if provided
    const filteredReviews = reviews.filter(review => {
      const reviewDate = new Date(review.date);
      return reviewDate.getMonth() === month && reviewDate.getFullYear() === year;
    });

    // Map to include employee data properly
    const data = filteredReviews.map(review => ({
      ...review,
      employee: review.employeeId
    }));

    return NextResponse.json({ 
      success: true, 
      data,
      month,
      year
    });
  } catch (error: any) {
    console.error("GET /api/performance error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const record = await Performance.create(body);
    
    // Populate employee data
    const populated = await Performance.findById(record._id)
      .populate('employeeId', 'employeeCode employeeName designation department branch photograph')
      .lean();

    return NextResponse.json(
      { success: true, record: populated },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/performance error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}