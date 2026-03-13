import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * DELETE ALL NOTIFICATIONS
 * DELETE /api/notifications/clear-all
 */
export async function DELETE() {
  try {
    await connectDB();
    const result = await Notification.deleteMany({});
    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("DELETE all notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
