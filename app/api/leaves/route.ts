import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import Employee from '@/models/Employee';
import Notification from '@/models/Notification';
import Holiday from '@/models/Holiday';

// GET all leave requests or for specific employee
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let query: any = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (status) {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .sort({ appliedOn: -1 })
      .populate('employeeId', 'firstName lastName department designation')
      .populate('reviewedBy', 'firstName lastName');

    return NextResponse.json(
      { success: true, data: leaveRequests },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

// Calculate working days excluding Tuesdays and holidays
async function calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
  const holidays = await Holiday.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });

  const holidayDates = new Set(
    holidays.map(h => new Date(h.date).toDateString())
  );

  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toDateString();

    // Skip Tuesdays (2) and holidays
    if (dayOfWeek !== 2 && !holidayDates.has(dateString)) {
      workingDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

// POST - Create new leave request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, reason } = body;

    // Validate input
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Fetch employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    // Calculate working days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = await calculateWorkingDays(start, end);

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      department: employee.department,
      status: 'pending'
    });

    // Create notification for HR
    await Notification.create({
      title: 'New Leave Request',
      message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) has requested ${leaveType} leave for ${numberOfDays} day(s) from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      type: 'leave_request',
      priority: 'medium',
      relatedId: leaveRequest._id.toString(),
      relatedModel: 'LeaveRequest'
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Leave request submitted successfully',
        data: leaveRequest 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}
