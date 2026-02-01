
// API Route: /api/performance/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Performance from "@/models/Performance";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const record = await Performance.create(body);

    return NextResponse.json(
      { success: true, record },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/performance error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}