import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';

/**
 * GET TDS Report
 * Tax deducted at source summary
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

    const tdsReport = employees.map((emp: any) => {
      const deductions = emp.salary?.deductions || {};
      const earnings = emp.salary?.earnings || {};

      const basic = earnings.basic || 0;
      const hra = earnings.hra || 0;
      const tds = deductions.tds || 0;

      const grossIncome = basic + hra;
      const taxableIncome = grossIncome > 250000 ? grossIncome : 0;

      return {
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        panNumber: emp.panNumber || 'N/A',
        designation: emp.designation,
        department: emp.department,
        basicSalary: basic,
        hra,
        grossIncome,
        taxableIncome,
        tdsDeducted: tds,
        cumulativeTDS: tds, // Would need to sum previous months for actual value
      };
    });

    const summary = {
      totalEmployees: tdsReport.length,
      totalTax: tdsReport.reduce((sum: number, emp: any) => sum + emp.tdsDeducted, 0),
      totalTaxableIncome: tdsReport.reduce((sum: number, emp: any) => sum + emp.taxableIncome, 0),
      totalGrossIncome: tdsReport.reduce((sum: number, emp: any) => sum + emp.grossIncome, 0),
    };

    return NextResponse.json(
      {
        success: true,
        data: tdsReport,
        summary,
        month,
        year,
      },
      { headers: { 'Cache-Control': 'public, max-age=600' } }
    );
  } catch (error) {
    console.error('TDS Report Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate TDS report' },
      { status: 500 }
    );
  }
}
