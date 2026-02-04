import { NextResponse } from "next/server";

/**
 * GET UNREAD NOTIFICATIONS COUNT
 * GET /api/notifications/unread/count
 */
export async function GET() {
  try {
    const { connectDB } = await import('@/lib/mongodb');
    const Notification = (await import('@/models/Notification')).default;
    
    await connectDB();
    
    const unreadCount = await Notification.countDocuments({ read: false });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("GET unread count error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
