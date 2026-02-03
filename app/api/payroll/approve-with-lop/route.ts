import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import { withCacheHeaders } from '@/lib/optimization-config';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      approvals,
      month,
      year,
    } = body;

    if (!approvals || !Array.isArray(approvals) || !month || !year) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const approvedData = [];
    const now = new Date();
    const approvalDate = now.toISOString().split('T')[0];
    const approvalTime = now.toTimeString().split(' ')[0];

    for (const approval of approvals) {
      const {
        employeeCode,
        lopDays,
        adjustedPF,
        adjustedESIC,
        adjustedAdvance,
        adjustedLoan,
        adjustedTDS,
        adjustedLOP,
        comments,
      } = approval;

      // Find employee
      const employee = await Employee.findOne({ employeeCode }).lean();

      if (!employee) {
        continue;
      }

      // Get attendance data for present days
      const monthIndex = new Date(`${month} 1`).getMonth();

      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        month: monthIndex,
        year: year,
      }).lean();

      const presentDays = attendance?.summary?.totalPresent || 0;
      const totalDaysInMonth = 30; // Standard working days in a month

      // Get current salary data
      const grossSalary = (employee.earnings
        ? Object.values(employee.earnings as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
        : 0) as number;

      // Calculate net salary
      const totalDeductions =
        adjustedPF +
        adjustedESIC +
        adjustedAdvance +
        adjustedLoan +
        adjustedTDS +
        adjustedLOP;

      const netSalary = Math.max(0, grossSalary - totalDeductions);

      // Save approval data to employee record
      await Employee.updateOne(
        { employeeCode },
        {
          $set: {
            salaryProcessed: true,
            salaryHold: false,
            presentDays,
            approvalDate,
            approvalTime,
            'deductions.lop': adjustedLOP,
            'deductions.pf': adjustedPF,
            'deductions.esic': adjustedESIC,
            'deductions.advance': adjustedAdvance,
            'deductions.loan': adjustedLoan,
            'deductions.tds': adjustedTDS,
            netSalary,
            approvalMonth: month,
            approvalYear: year,
            approvalComments: comments || '',
            approvalDT: now,
            lopDays,
          },
        }
      );

      approvedData.push({
        employeeCode,
        employeeName: employee.employeeName,
        department: employee.department,
        designation: employee.designation,
        grossSalary,
        presentDays,
        totalDaysInMonth,
        lopDays,
        deductions: {
          pf: adjustedPF,
          esic: adjustedESIC,
          advance: adjustedAdvance,
          loan: adjustedLoan,
          tds: adjustedTDS,
          lop: adjustedLOP,
        },
        totalDeductions,
        netSalary,
        approvalDate,
        approvalTime,
        comments,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `${approvedData.length} employee(s) approved successfully`,
        approvedData,
        approvalDate,
        approvalTime,
      },
      {
        headers: withCacheHeaders(0), // No cache for approval operations
      }
    );
  } catch (error) {
    console.error('Error processing approvals:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
