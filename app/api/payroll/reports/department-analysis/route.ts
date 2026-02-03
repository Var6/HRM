import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';

/**
 * GET Department-wise Analysis Report
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const employees = await Employee.find({ status: { $ne: 'inactive' } }).lean();

    // Group by department
    const departmentMap: Record<string, any> = {};

    employees.forEach((emp: any) => {
      const dept = emp.department || 'Unassigned';
      if (!departmentMap[dept]) {
        departmentMap[dept] = {
          department: dept,
          employees: [],
          totalGross: 0,
          totalDeductions: 0,
          totalNet: 0,
          count: 0,
        };
      }

      const earnings = emp.salary?.earnings || {};
      const deductions = emp.salary?.deductions || {};

      const basic = earnings.basic || 0;
      const hra = earnings.hra || 0;
      const conveyance = earnings.conveyance || 0;
      const monthlyBonus = earnings.monthlyBonus || 0;

      const grossSalary = basic + hra + conveyance + monthlyBonus;
      const totalDed = (deductions.pf || 0) + (deductions.esic || 0) + (deductions.tds || 0);
      const netSalary = grossSalary - totalDed;

      departmentMap[dept].employees.push({
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        grossSalary,
        deductions: totalDed,
        netSalary,
      });

      departmentMap[dept].totalGross += grossSalary;
      departmentMap[dept].totalDeductions += totalDed;
      departmentMap[dept].totalNet += netSalary;
      departmentMap[dept].count += 1;
    });

    const analysis = Object.values(departmentMap);
    const grandTotals = {
      totalGross: analysis.reduce((sum: number, dept: any) => sum + dept.totalGross, 0),
      totalDeductions: analysis.reduce((sum: number, dept: any) => sum + dept.totalDeductions, 0),
      totalNet: analysis.reduce((sum: number, dept: any) => sum + dept.totalNet, 0),
      totalEmployees: analysis.reduce((sum: number, dept: any) => sum + dept.count, 0),
    };

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        summary: grandTotals,
        month,
        year,
      },
      { headers: { 'Cache-Control': 'public, max-age=600' } }
    );
  } catch (error) {
    console.error('Department Analysis Report Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate department analysis' },
      { status: 500 }
    );
  }
}
