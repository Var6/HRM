import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AttendanceRequest from '@/models/AttendanceRequest';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';

// GET: Fetch attendance requests
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
      query.approvalStatus = status;
    }

    const requests = await AttendanceRequest.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create attendance request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { employeeId, attendanceDate, status, reason, supportingDocument, workingHours } = body;

    // Validate employee
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: new Date(attendanceDate),
    });

    if (existingAttendance) {
      return NextResponse.json({ success: false, error: 'Attendance already marked for this date' }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = await AttendanceRequest.findOne({
      employeeId,
      attendanceDate: new Date(attendanceDate),
      approvalStatus: 'Pending',
    });

    if (existingRequest) {
      return NextResponse.json({ success: false, error: 'Request already exists for this date' }, { status: 400 });
    }

    // Create request
    const attendanceRequest = await AttendanceRequest.create({
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      attendanceDate: new Date(attendanceDate),
      status,
      reason,
      supportingDocument: supportingDocument || null,
      workingHours: workingHours || 8,
      approvalStatus: 'Pending',
    });

    return NextResponse.json({ success: true, data: attendanceRequest, message: 'Attendance request submitted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Approve/Reject attendance request
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { requestId, action, approvedBy, rejectionReason } = body;

    const attendanceRequest = await AttendanceRequest.findById(requestId);

    if (!attendanceRequest) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (attendanceRequest.approvalStatus !== 'Pending') {
      return NextResponse.json({ success: false, error: 'Request already processed' }, { status: 400 });
    }

    if (action === 'approve') {
      // Approve and create attendance record
      attendanceRequest.approvalStatus = 'Approved';
      attendanceRequest.approvedBy = approvedBy;
      attendanceRequest.approvedDate = new Date();
      await attendanceRequest.save();

      // Create attendance record
      await Attendance.create({
        employeeId: attendanceRequest.employeeId,
        employeeCode: attendanceRequest.employeeCode,
        employeeName: attendanceRequest.employeeName,
        date: attendanceRequest.attendanceDate,
        status: attendanceRequest.status,
        workingHours: attendanceRequest.workingHours,
        remarks: `Attendance request approved by ${approvedBy}`,
      });

      return NextResponse.json({ success: true, data: attendanceRequest, message: 'Request approved and attendance marked' });
    } else if (action === 'reject') {
      attendanceRequest.approvalStatus = 'Rejected';
      attendanceRequest.approvedBy = approvedBy;
      attendanceRequest.approvedDate = new Date();
      attendanceRequest.rejectionReason = rejectionReason || 'No reason provided';
      await attendanceRequest.save();

      return NextResponse.json({ success: true, data: attendanceRequest, message: 'Request rejected' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
