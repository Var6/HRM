import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LeaveEncashment from '@/models/LeaveEncashment';
import Employee from '@/models/Employee';
import LeaveRequest from '@/models/LeaveRequest';

// GET: Fetch leave encashment requests
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

    const requests = await LeaveEncashment.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create leave encashment request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { employeeId, leaveType, leaveDays, perDayRate, payrollMonth, notes } = body;

    // Validate employee
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Check available leaves
    const approvedLeaves = await LeaveRequest.find({
      employeeId,
      leaveType,
      status: 'Approved',
    });

    const totalApprovedDays = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);

    if (totalApprovedDays < leaveDays) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient leave balance. Available: ${totalApprovedDays} days` 
      }, { status: 400 });
    }

    const encashmentAmount = leaveDays * perDayRate;

    // Create encashment request
    const encashment = await LeaveEncashment.create({
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      leaveType,
      leaveDays,
      perDayRate,
      encashmentAmount,
      payrollMonth: new Date(payrollMonth),
      notes: notes || '',
      status: 'Pending',
    });

    return NextResponse.json({ success: true, data: encashment, message: 'Leave encashment request submitted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Approve/Reject/Pay encashment request
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { requestId, action, approvedBy, rejectionReason } = body;

    const encashment = await LeaveEncashment.findById(requestId);

    if (!encashment) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (encashment.status !== 'Pending') {
        return NextResponse.json({ success: false, error: 'Request already processed' }, { status: 400 });
      }

      encashment.status = 'Approved';
      encashment.approvedBy = approvedBy;
      encashment.approvedDate = new Date();
      await encashment.save();

      return NextResponse.json({ success: true, data: encashment, message: 'Encashment request approved' });
    } else if (action === 'reject') {
      if (encashment.status !== 'Pending') {
        return NextResponse.json({ success: false, error: 'Request already processed' }, { status: 400 });
      }

      encashment.status = 'Rejected';
      encashment.approvedBy = approvedBy;
      encashment.approvedDate = new Date();
      encashment.rejectionReason = rejectionReason || 'No reason provided';
      await encashment.save();

      return NextResponse.json({ success: true, data: encashment, message: 'Encashment request rejected' });
    } else if (action === 'markPaid') {
      if (encashment.status !== 'Approved') {
        return NextResponse.json({ success: false, error: 'Request not approved yet' }, { status: 400 });
      }

      encashment.status = 'Paid';
      encashment.paidDate = new Date();
      await encashment.save();

      return NextResponse.json({ success: true, data: encashment, message: 'Encashment marked as paid' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
