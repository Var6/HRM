import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';

/**
 * GET Loan & Advance Report
 * Outstanding loans and advances
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const employees = await Employee.find({ 
      $or: [
        { status: { $exists: false } },
        { status: { $ne: 'inactive' } }
      ]
    }).lean();

    const loanAdvanceReport = employees
      .filter((emp: any) => {
        const deductions = emp.salary?.deductions || {};
        return (deductions.advance || 0) > 0 || (deductions.loan || 0) > 0;
      })
      .map((emp: any) => {
        const deductions = emp.salary?.deductions || {};
        const advance = deductions.advance || deductions.salaryAdvance || 0;
        const loan = deductions.loan || 0;
        const total = advance + loan;

        return {
          employeeCode: emp.employeeCode,
          employeeName: emp.name,
          designation: emp.designation,
          department: emp.department,
          advanceAmount: advance,
          loanAmount: loan,
          totalOutstanding: total,
          monthlyDeduction: 0, // Would need to calculate from loan terms
          remainingMonths: 0, // Would need to track from loan terms
          status: 'Active',
        };
      });

    const summary = {
      totalAdvances: loanAdvanceReport.reduce((sum: number, emp: any) => sum + emp.advanceAmount, 0),
      totalLoans: loanAdvanceReport.reduce((sum: number, emp: any) => sum + emp.loanAmount, 0),
      totalOutstanding: loanAdvanceReport.reduce((sum: number, emp: any) => sum + emp.totalOutstanding, 0),
      employeesWithAdvance: loanAdvanceReport.length,
    };

    return NextResponse.json(
      {
        success: true,
        data: loanAdvanceReport,
        summary,
        month,
        year,
      },
      { headers: { 'Cache-Control': 'public, max-age=600' } }
    );
  } catch (error) {
    console.error('Loan & Advance Report Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate loan & advance report' },
      { status: 500 }
    );
  }
}
