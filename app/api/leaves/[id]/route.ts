import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import Notification from '@/models/Notification';

// GET specific leave request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('employeeId', 'firstName lastName department designation email mobileNumber')
      .populate('reviewedBy', 'firstName lastName');

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: leaveRequest },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leave request' },
      { status: 500 }
    );
  }
}

// PATCH - Update leave request (Approve/Reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const body = await request.json();
    const { status, hrRemarks, rejectionReason, reviewedBy } = body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Valid status (approved/rejected) is required' },
        { status: 400 }
      );
    }

    // If rejecting, reason is required
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Update leave request
    leaveRequest.status = status;
    leaveRequest.hrRemarks = hrRemarks;
    leaveRequest.rejectionReason = rejectionReason;
    if (reviewedBy) leaveRequest.reviewedBy = reviewedBy;
    leaveRequest.reviewedOn = new Date();

    await leaveRequest.save();

    // Create notification for employee
    const notificationMessage = status === 'approved' 
      ? `Your ${leaveRequest.leaveType} leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been approved.`
      : `Your ${leaveRequest.leaveType} leave request has been rejected. Reason: ${rejectionReason}`;

    await Notification.create({
      title: status === 'approved' ? 'Leave Approved' : 'Leave Rejected',
      message: notificationMessage,
      type: 'leave_request',
      priority: status === 'approved' ? 'low' : 'medium'
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `Leave request ${status} successfully`,
        data: leaveRequest 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update leave request' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel leave request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Store request details before deletion
    const leaveType = leaveRequest.leaveType;
    const startDate = leaveRequest.startDate;
    const endDate = leaveRequest.endDate;
    const status = leaveRequest.status;

    // Delete the leave request
    await LeaveRequest.findByIdAndDelete(id);

    // Create notification for cancellation/deletion
    const notificationMessage = status === 'pending' 
      ? `Your ${leaveType} leave request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been cancelled.`
      : `Your ${leaveType} leave request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been deleted.`;

    await Notification.create({
      title: status === 'pending' ? 'Leave Request Cancelled' : 'Leave Request Deleted',
      message: notificationMessage,
      type: 'leave_request',
      priority: 'low'
    });

    return NextResponse.json(
      { success: true, message: 'Leave request deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete leave request' },
      { status: 500 }
    );
  }
}
