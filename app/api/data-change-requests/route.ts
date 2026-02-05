import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DataChangeRequest from '@/models/DataChangeRequest';
import Employee from '@/models/Employee';
import Notification from '@/models/Notification';

// GET all data change requests or for specific employee
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

    const dataChangeRequests = await DataChangeRequest.find(query)
      .sort({ requestedOn: -1 })
      .populate('employeeId', 'name department designation')
      .populate('reviewedBy', 'name');

    return NextResponse.json(
      { success: true, data: dataChangeRequests },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching data change requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data change requests' },
      { status: 500 }
    );
  }
}

// POST - Create new data change request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { employeeId, requestType, fieldName, currentValue, requestedValue, reason } = body;

    // Validate input
    if (!employeeId || !requestType || !fieldName || !currentValue || !requestedValue || !reason) {
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

    // Create data change request
    const dataChangeRequest = await DataChangeRequest.create({
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      requestType,
      fieldName,
      currentValue,
      requestedValue,
      reason,
      department: employee.department,
      status: 'pending'
    });

    // Create notification for HR
    await Notification.create({
      title: 'Data Change Request',
      message: `${employee.name} (${employee.employeeCode}) has requested to change ${fieldName} from "${currentValue}" to "${requestedValue}"`,
      type: 'data_change_request',
      priority: 'medium',
      relatedId: dataChangeRequest._id.toString(),
      relatedModel: 'DataChangeRequest'
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Data change request submitted successfully',
        data: dataChangeRequest 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating data change request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create data change request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a data change request
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');

    if (!requestId || !employeeId) {
      return NextResponse.json(
        { success: false, message: 'Request ID and Employee ID are required' },
        { status: 400 }
      );
    }

    // Find the request
    const dataChangeRequest = await DataChangeRequest.findById(requestId);
    
    if (!dataChangeRequest) {
      return NextResponse.json(
        { success: false, message: 'Data change request not found' },
        { status: 404 }
      );
    }

    // Verify ownership - only the employee who created it can delete
    if (dataChangeRequest.employeeId.toString() !== employeeId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to delete this request' },
        { status: 403 }
      );
    }

    // Only allow deletion of pending requests
    if (dataChangeRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Only pending requests can be deleted' },
        { status: 400 }
      );
    }

    // Delete the request
    await DataChangeRequest.findByIdAndDelete(requestId);

    return NextResponse.json(
      { success: true, message: 'Data change request deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting data change request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete data change request' },
      { status: 500 }
    );
  }
}
