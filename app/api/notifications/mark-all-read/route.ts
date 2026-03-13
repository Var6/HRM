import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * MARK ALL NOTIFICATIONS AS READ
 * PUT /api/notifications/mark-all-read
 */
export async function PUT() {
  try {
    await connectDB();
    const result = await Notification.updateMany({ read: false }, { read: true });
    return NextResponse.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
