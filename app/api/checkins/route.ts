import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EmployeeCheckin from '@/models/EmployeeCheckin';
import Employee from '@/models/Employee';

// GET: Fetch checkins
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const checkins = await EmployeeCheckin.find(query).sort({ checkInTime: -1 }).limit(100);

    return NextResponse.json({ success: true, data: checkins });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create check-in or check-out
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { employeeId, action, location, deviceInfo } = body;

    // Validate employee
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (action === 'checkin') {
      // Check if already checked in today
      const existingCheckin = await EmployeeCheckin.findOne({
        employeeId,
        date: { $gte: today, $lt: tomorrow },
        status: 'Checked In',
      });

      if (existingCheckin) {
        return NextResponse.json({ success: false, error: 'Already checked in today' }, { status: 400 });
      }

      // Create new check-in
      const checkin = await EmployeeCheckin.create({
        employeeId,
        employeeCode: employee.employeeCode,
        employeeName: employee.name,
        checkInTime: new Date(),
        checkInLocation: location,
        deviceInfo: deviceInfo || '',
        status: 'Checked In',
        date: today,
      });

      return NextResponse.json({ success: true, data: checkin, message: 'Checked in successfully' });
    } else if (action === 'checkout') {
      // Find today's check-in
      const checkin = await EmployeeCheckin.findOne({
        employeeId,
        date: { $gte: today, $lt: tomorrow },
        status: 'Checked In',
      });

      if (!checkin) {
        return NextResponse.json({ success: false, error: 'No active check-in found for today' }, { status: 404 });
      }

      // Calculate total hours
      const checkOutTime = new Date();
      const totalHours = (checkOutTime.getTime() - checkin.checkInTime.getTime()) / (1000 * 60 * 60);

      // Update check-out
      checkin.checkOutTime = checkOutTime;
      checkin.checkOutLocation = location;
      checkin.totalHours = Math.round(totalHours * 100) / 100;
      checkin.status = 'Checked Out';
      await checkin.save();

      return NextResponse.json({ success: true, data: checkin, message: 'Checked out successfully' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
