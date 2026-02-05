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

    // Fetch all performance reviews
    const reviews = await Performance.find({}).sort({ date: -1 });

    // For each review, fetch employee data separately
    const reviewsWithEmployee = await Promise.all(
      reviews.map(async (review) => {
        try {
          const emp = await Employee.findById(review.employeeId, 'name employeeCode designation department branch photograph');
          return {
            _id: review._id,
            employeeId: review.employeeId,
            employee: emp,
            date: review.date,
            rating: review.rating,
            reviewer: review.reviewer,
            comments: review.comments,
            achievements: review.achievements,
            improvementAreas: review.improvementAreas,
            createdAt: review.createdAt
          };
        } catch (err) {
          console.error('Error fetching employee:', err);
          return {
            _id: review._id,
            employeeId: review.employeeId,
            employee: null,
            date: review.date,
            rating: review.rating,
            reviewer: review.reviewer,
            comments: review.comments,
            achievements: review.achievements,
            improvementAreas: review.improvementAreas,
            createdAt: review.createdAt
          };
        }
      })
    );

    // Filter by month and year if provided
    const filteredReviews = reviewsWithEmployee.filter(review => {
      const reviewDate = new Date(review.date);
      return reviewDate.getMonth() === month && reviewDate.getFullYear() === year;
    });

    return NextResponse.json({ 
      success: true, 
      data: filteredReviews,
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
    
    // Fetch employee data separately
    const emp = await Employee.findById(record.employeeId, 'name employeeCode designation department branch photograph');

    const response = {
      _id: record._id,
      employeeId: record.employeeId,
      employee: emp,
      date: record.date,
      rating: record.rating,
      reviewer: record.reviewer,
      comments: record.comments,
      achievements: record.achievements,
      improvementAreas: record.improvementAreas,
      createdAt: record.createdAt
    };

    return NextResponse.json(
      { success: true, record: response },
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