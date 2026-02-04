import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import MonthlyAttendance from '@/models/Attendance';

/**
 * GET PF & ESIC Compliance Report
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const employees = await Employee.find({ 
      $or: [
        { status: { $exists: false } },
        { status: { $ne: 'inactive' } }
      ]
    }).lean();

    const pfEsicReport = employees.map((emp: any) => {
      const deductions = emp.salary?.deductions || {};
      const basic = emp.salary?.earnings?.basic || 0;

      const pfAmount = deductions.pf || (basic * 0.12);
      const esicAmount = deductions.esic || (basic * 0.0475);
      const employerContribution = {
        pf: pfAmount,
        esic: esicAmount * 1.54,
      };

      return {
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        uan: emp.uanNumber || 'N/A',
        pf: emp.pfNumber || 'N/A',
        esi: emp.esiNumber || 'N/A',
        basic,
        employeePF: pfAmount,
        employerPF: employerContribution.pf,
        totalPF: pfAmount + employerContribution.pf,
        employeeESIC: esicAmount,
        employerESIC: employerContribution.esic,
        totalESIC: esicAmount + employerContribution.esic,
      };
    });

    const totalPF = pfEsicReport.reduce((sum: number, emp: any) => sum + emp.totalPF, 0);
    const totalESIC = pfEsicReport.reduce((sum: number, emp: any) => sum + emp.totalESIC, 0);

    return NextResponse.json(
      {
        success: true,
        data: pfEsicReport,
        summary: { totalPF, totalESIC, count: pfEsicReport.length },
        month,
        year,
      },
      { headers: { 'Cache-Control': 'public, max-age=600' } }
    );
  } catch (error) {
    console.error('PF & ESIC Report Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PF & ESIC report' },
      { status: 500 }
    );
  }
}
