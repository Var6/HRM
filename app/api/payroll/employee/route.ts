import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import Employee from '@/models/Employee';
import PayrollHistory from '@/models/PayrollHistory';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!employeeId || !month || !year) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch employee data
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    // Fetch or create payroll history for this month
    let payrollHistory = await PayrollHistory.findOne({
      employeeId,
      month,
      year: parseInt(year)
    });

    // Calculate salary components
    const basicSalary = employee.salaryStructure?.basic || 0;
    const hra = employee.salaryStructure?.hra || 0;
    const conveyance = employee.salaryStructure?.conveyance || 0;
    const specialAllowance = employee.salaryStructure?.specialAllowance || 0;
    const monthlyBonus = employee.salaryStructure?.monthlyBonus || 0;
    const quarterlyBonus = employee.salaryStructure?.quarterlyBonus || 0;

    const pf = employee.salaryStructure?.pf || 0;
    const esic = employee.salaryStructure?.esic || 0;
    const tds = employee.salaryStructure?.tds || 0;
    const salaryAdvance = employee.salaryStructure?.salaryAdvance || 0;
    const loan = employee.salaryStructure?.loan || 0;
    const lop = employee.salaryStructure?.lop || 0;

    const grossSalary = basicSalary + hra + conveyance + specialAllowance + monthlyBonus + quarterlyBonus;
    const totalDeductions = pf + esic + tds + salaryAdvance + loan + lop;
    const netSalary = grossSalary - totalDeductions;

    // Prepare salary data
    const salaryData = {
      employeeId: employee._id.toString(),
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      designation: employee.designation,
      department: employee.department,
      branch: employee.branch,
      photograph: employee.photograph,
      fatherName: employee.fatherName,
      dateOfJoining: employee.dateOfJoining,
      panNumber: employee.panNumber,
      uanNumber: employee.uanNumber,
      esiNumber: employee.esiNumber,
      aadharNumber: employee.aadharNumber,
      bankAccount: employee.bankAccount,
      presentDays: payrollHistory?.presentDays || 30,
      earnings: {
        basic: basicSalary,
        hra,
        conveyance,
        specialAllowance,
        monthlyBonus,
        quarterlyBonus
      },
      deductions: {
        pf,
        esic,
        tds,
        salaryAdvance,
        loan,
        lop
      },
      grossSalary,
      totalDeductions,
      netSalary,
      salaryProcessed: payrollHistory?.salaryProcessed || false,
      salaryHold: payrollHistory?.salaryHold || false,
      salaryHoldReason: payrollHistory?.salaryHoldReason || ''
    };

    return NextResponse.json({
      success: true,
      data: salaryData
    });

  } catch (error) {
    console.error('Error fetching employee payroll:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}