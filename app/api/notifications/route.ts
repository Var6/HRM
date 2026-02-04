import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * GET ALL NOTIFICATIONS
 */
export async function GET() {
  try {
    await connectDB();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('employeeId', 'name email designation');

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * CREATE NOTIFICATION
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const notification = await Notification.create(body);

    return NextResponse.json(
      { success: true, notification },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST notification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
