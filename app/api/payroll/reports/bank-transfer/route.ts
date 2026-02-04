import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';

/**
 * GET Bank Transfer Sheet Report
 * Format for bank salary disbursement
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const employees = await Employee.find({
      $and: [
        {
          $or: [
            { status: { $exists: false } },
            { status: { $ne: 'inactive' } }
          ]
        },
        { bankAccount: { $exists: true, $ne: 'N/A' } }
      ]
    }).lean();

    const bankTransferSheet = employees.map((emp: any) => {
      const earnings = emp.salary?.earnings || {};
      const deductions = emp.salary?.deductions || {};

      const basic = earnings.basic || 0;
      const hra = earnings.hra || 0;
      const conveyance = earnings.conveyance || 0;
      const monthlyBonus = earnings.monthlyBonus || 0;

      const grossSalary = basic + hra + conveyance + monthlyBonus;
      const totalDeductions = (deductions.pf || 0) + (deductions.esic || 0) + (deductions.tds || 0);
      const netSalary = grossSalary - totalDeductions;

      return {
        serialNo: 0, // Will be assigned sequentially
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        bankAccount: emp.bankAccount,
        ifscCode: emp.ifscCode || 'N/A',
        amount: netSalary,
        narrative: `Salary for ${month} ${year}`,
      };
    });

    // Assign serial numbers
    bankTransferSheet.forEach((record: any, index: number) => {
      record.serialNo = index + 1;
    });

    const totalAmount = bankTransferSheet.reduce((sum: number, record: any) => sum + record.amount, 0);

    return NextResponse.json(
      {
        success: true,
        data: bankTransferSheet,
        summary: {
          totalRecords: bankTransferSheet.length,
          totalAmount,
          month,
          year,
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=600' } }
    );
  } catch (error) {
    console.error('Bank Transfer Sheet Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate bank transfer sheet' },
      { status: 500 }
    );
  }
}
