import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExitInterview from '@/models/ExitInterview';
import Employee from '@/models/Employee';

// GET: Fetch exit interviews
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

    const interviews = await ExitInterview.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: interviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create exit interview
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      employeeId,
      resignationDate,
      lastWorkingDay,
      noticePeriod,
      reasonForLeaving,
      detailedReason,
      overallExperience,
      managerRating,
      workEnvironmentRating,
      learningOpportunitiesRating,
      compensationRating,
      wouldRecommend,
      suggestions,
      feedback,
      conductedBy,
      finalSettlement,
    } = body;

    // Validate employee
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Create exit interview
    const exitInterview = await ExitInterview.create({
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      resignationDate: new Date(resignationDate),
      lastWorkingDay: new Date(lastWorkingDay),
      noticePeriod: noticePeriod || 30,
      reasonForLeaving,
      detailedReason,
      overallExperience,
      managerRating: managerRating || null,
      workEnvironmentRating: workEnvironmentRating || null,
      learningOpportunitiesRating: learningOpportunitiesRating || null,
      compensationRating: compensationRating || null,
      wouldRecommend,
      suggestions: suggestions || '',
      feedback: feedback || '',
      conductedBy,
      interviewDate: new Date(),
      finalSettlement: finalSettlement || {
        pendingSalary: 0,
        leaveEncashment: 0,
        bonus: 0,
        deductions: 0,
        totalAmount: 0,
        paid: false,
      },
      status: 'Completed',
    });

    // Update employee status to Left
    employee.status = 'Left';
    employee.relievingDate = new Date(lastWorkingDay);
    await employee.save();

    return NextResponse.json({ success: true, data: exitInterview, message: 'Exit interview completed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update exit interview or settlement
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { interviewId, action, finalSettlement } = body;

    const exitInterview = await ExitInterview.findById(interviewId);

    if (!exitInterview) {
      return NextResponse.json({ success: false, error: 'Exit interview not found' }, { status: 404 });
    }

    if (action === 'updateSettlement') {
      exitInterview.finalSettlement = finalSettlement;
      exitInterview.status = 'Settlement Pending';
      await exitInterview.save();

      return NextResponse.json({ success: true, data: exitInterview, message: 'Settlement details updated' });
    } else if (action === 'markPaid') {
      exitInterview.finalSettlement.paid = true;
      exitInterview.finalSettlement.paidDate = new Date();
      exitInterview.status = 'Closed';
      await exitInterview.save();

      return NextResponse.json({ success: true, data: exitInterview, message: 'Settlement marked as paid' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
