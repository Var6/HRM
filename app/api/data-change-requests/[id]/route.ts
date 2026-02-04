import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DataChangeRequest from '@/models/DataChangeRequest';
import Employee from '@/models/Employee';
import Notification from '@/models/Notification';

// GET specific data change request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const dataChangeRequest = await DataChangeRequest.findById(params.id)
      .populate('employeeId', 'firstName lastName department designation email mobileNumber')
      .populate('reviewedBy', 'firstName lastName');

    if (!dataChangeRequest) {
      return NextResponse.json(
        { success: false, message: 'Data change request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: dataChangeRequest },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching data change request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data change request' },
      { status: 500 }
    );
  }
}

// PATCH - Update data change request (Approve/Reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
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

    const dataChangeRequest = await DataChangeRequest.findById(params.id);
    
    if (!dataChangeRequest) {
      return NextResponse.json(
        { success: false, message: 'Data change request not found' },
        { status: 404 }
      );
    }

    // Update data change request
    dataChangeRequest.status = status;
    dataChangeRequest.hrRemarks = hrRemarks;
    dataChangeRequest.rejectionReason = rejectionReason;
    dataChangeRequest.reviewedBy = reviewedBy;
    dataChangeRequest.reviewedOn = new Date();

    await dataChangeRequest.save();

    // If approved, update the employee record
    if (status === 'approved') {
      const employee = await Employee.findById(dataChangeRequest.employeeId);
      if (employee) {
        // Update the field based on fieldName
        // This is a simple implementation - you may need to customize based on your field structure
        const fieldPath = dataChangeRequest.fieldName.split('.');
        let current: any = employee;
        
        for (let i = 0; i < fieldPath.length - 1; i++) {
          current = current[fieldPath[i]];
        }
        
        current[fieldPath[fieldPath.length - 1]] = dataChangeRequest.requestedValue;
        await employee.save();
      }
    }

    // Create notification for employee
    const notificationMessage = status === 'approved' 
      ? `Your request to change ${dataChangeRequest.fieldName} has been approved.`
      : `Your request to change ${dataChangeRequest.fieldName} has been rejected. Reason: ${rejectionReason}`;

    await Notification.create({
      title: status === 'approved' ? 'Data Change Approved' : 'Data Change Rejected',
      message: notificationMessage,
      type: 'data_change_response',
      priority: status === 'approved' ? 'low' : 'medium',
      relatedId: dataChangeRequest._id.toString(),
      relatedModel: 'DataChangeRequest',
      recipientId: dataChangeRequest.employeeId.toString()
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `Data change request ${status} successfully`,
        data: dataChangeRequest 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating data change request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update data change request' },
      { status: 500 }
    );
  }
}
