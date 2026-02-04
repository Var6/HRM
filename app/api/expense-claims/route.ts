import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExpenseClaim from '@/models/ExpenseClaim';
import Employee from '@/models/Employee';

// GET: Fetch expense claims
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

    const claims = await ExpenseClaim.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: claims });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create expense claim
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { employeeId, claimDate, expenses, notes } = body;

    // Validate employee
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Calculate total amount
    const totalAmount = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

    // Create claim
    const claim = await ExpenseClaim.create({
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      claimDate: new Date(claimDate),
      expenses,
      totalAmount,
      notes: notes || '',
      approvalStatus: 'Pending',
    });

    return NextResponse.json({ success: true, data: claim, message: 'Expense claim submitted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Approve/Reject/Pay expense claim
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { claimId, action, approvedBy, rejectionReason, paymentMethod } = body;

    const claim = await ExpenseClaim.findById(claimId);

    if (!claim) {
      return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (claim.approvalStatus !== 'Pending') {
        return NextResponse.json({ success: false, error: 'Claim already processed' }, { status: 400 });
      }

      claim.approvalStatus = 'Approved';
      claim.approvedBy = approvedBy;
      claim.approvedDate = new Date();
      await claim.save();

      return NextResponse.json({ success: true, data: claim, message: 'Expense claim approved' });
    } else if (action === 'reject') {
      if (claim.approvalStatus !== 'Pending') {
        return NextResponse.json({ success: false, error: 'Claim already processed' }, { status: 400 });
      }

      claim.approvalStatus = 'Rejected';
      claim.approvedBy = approvedBy;
      claim.approvedDate = new Date();
      claim.rejectionReason = rejectionReason || 'No reason provided';
      await claim.save();

      return NextResponse.json({ success: true, data: claim, message: 'Expense claim rejected' });
    } else if (action === 'markPaid') {
      if (claim.approvalStatus !== 'Approved') {
        return NextResponse.json({ success: false, error: 'Claim not approved yet' }, { status: 400 });
      }

      claim.approvalStatus = 'Paid';
      claim.paidDate = new Date();
      claim.paymentMethod = paymentMethod || 'Bank Transfer';
      await claim.save();

      return NextResponse.json({ success: true, data: claim, message: 'Expense claim marked as paid' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
